# %%
import os
import math
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import MinMaxScaler
from tqdm import tqdm
import matplotlib.pyplot as plt
import time
from sklearn.metrics import f1_score, precision_score, recall_score, accuracy_score, confusion_matrix

# %%
# %% TranAD 모델 정의 및 학습 준비
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, dropout=0.1, max_len=5000):
        super(PositionalEncoding, self).__init__()
        self.dropout = nn.Dropout(p=dropout)

        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model).float() * (-math.log(10000.0) / d_model))
        pe += torch.sin(position * div_term)
        pe += torch.cos(position * div_term)
        pe = pe.unsqueeze(0).transpose(0, 1)
        self.register_buffer('pe', pe)

    def forward(self, x, pos=0):
        x = x + self.pe[pos:pos+x.size(0), :]
        return self.dropout(x)

class TransformerEncoderLayer(nn.Module):
    def __init__(self, d_model, nhead, dim_feedforward=16, dropout=0):
        super(TransformerEncoderLayer, self).__init__()
        self.self_attn = nn.MultiheadAttention(d_model, nhead, dropout=dropout)
        self.linear1 = nn.Linear(d_model, dim_feedforward)
        self.dropout = nn.Dropout(dropout)
        self.linear2 = nn.Linear(dim_feedforward, d_model)
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)
        self.activation = nn.LeakyReLU(True)

    def forward(self, src, src_mask=None, src_key_padding_mask=None, is_causal=False):
        src2 = self.self_attn(src, src, src)[0]
        src = src + self.dropout1(src2)
        src2 = self.linear2(self.dropout(self.activation(self.linear1(src))))
        src = src + self.dropout2(src2)
        return src



class TransformerDecoderLayer(nn.Module):
    def __init__(self, d_model, nhead, dim_feedforward=16, dropout=0):
        super(TransformerDecoderLayer, self).__init__()
        self.self_attn = nn.MultiheadAttention(d_model, nhead, dropout=dropout)
        self.multihead_attn = nn.MultiheadAttention(d_model, nhead, dropout=dropout)
        self.linear1 = nn.Linear(d_model, dim_feedforward)
        self.dropout = nn.Dropout(dropout)
        self.linear2 = nn.Linear(dim_feedforward, d_model)
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)
        self.dropout3 = nn.Dropout(dropout)
        self.activation = nn.LeakyReLU(True)

    def forward(self, tgt, memory, tgt_mask=None, memory_mask=None,
                tgt_key_padding_mask=None, memory_key_padding_mask=None,
                tgt_is_causal=False, memory_is_causal=False):
        tgt2 = self.self_attn(tgt, tgt, tgt, attn_mask=tgt_mask, key_padding_mask=tgt_key_padding_mask)[0]
        tgt = tgt + self.dropout1(tgt2)
        tgt2 = self.multihead_attn(tgt, memory, memory, attn_mask=memory_mask, key_padding_mask=memory_key_padding_mask)[0]
        tgt = tgt + self.dropout2(tgt2)
        tgt2 = self.linear2(self.dropout(self.activation(self.linear1(tgt))))
        tgt = tgt + self.dropout3(tgt2)
        return tgt


class TranAD(nn.Module):
    def __init__(self, feats):
        super(TranAD, self).__init__()
        self.name = 'TranAD'
        self.lr = 0.001
        self.batch = 128
        self.n_feats = feats
        self.n_window = 60
        self.n = self.n_feats * self.n_window
        self.pos_encoder = PositionalEncoding(2 * feats, 0.1, self.n_window)
        encoder_layers = TransformerEncoderLayer(d_model=2 * feats, nhead=feats, dim_feedforward=16, dropout=0.1)
        self.transformer_encoder = nn.TransformerEncoder(encoder_layers, 1)
        decoder_layers1 = TransformerDecoderLayer(d_model=2 * feats, nhead=feats, dim_feedforward=16, dropout=0.1)
        self.transformer_decoder1 = nn.TransformerDecoder(decoder_layers1, 1)
        decoder_layers2 = TransformerDecoderLayer(d_model=2 * feats, nhead=feats, dim_feedforward=16, dropout=0.1)
        self.transformer_decoder2 = nn.TransformerDecoder(decoder_layers2, 1)
        self.fcn = nn.Sequential(nn.Linear(2 * feats, feats), nn.Sigmoid())

    def encode(self, src, c, tgt):
        src = torch.cat((src, c), dim=2)
        src = src * math.sqrt(self.n_feats)
        src = self.pos_encoder(src)
        memory = self.transformer_encoder(src)
        tgt = tgt.repeat(1, 1, 2)
        return tgt, memory

    def forward(self, src, tgt):
        # Phase 1 - Without anomaly scores
        c = torch.zeros_like(src)
        x1 = self.fcn(self.transformer_decoder1(*self.encode(src, c, tgt)))
        # Phase 2 - With anomaly scores
        c = (x1 - src) ** 2
        x2 = self.fcn(self.transformer_decoder2(*self.encode(src, c, tgt)))
        return x1, x2


# %%
# TranAD 모델 정의가 이전 코드에 있다고 가정

# 데이터 전처리 함수
def preprocess_data(csv_path, scaler, feature_columns, window_size):
    df = pd.read_csv(csv_path)
    df[feature_columns] = scaler.transform(df[feature_columns])
    data = df[feature_columns].values

    # 슬라이딩 윈도우 생성
    sliding_windows = [
        data[i:i + window_size] for i in range(len(data) - window_size + 1)
    ]
    
    # Torch 텐서로 변환 및 차원 조정
    data_tensor = torch.tensor(sliding_windows, dtype=torch.float32)
    return data_tensor

# 이상 탐지 함수
def detect_anomalies(model, data_tensor, threshold=0.365):
    anomaly_scores = []
    anomalies = []
    
    with torch.no_grad():
        for i, window in enumerate(data_tensor):
            # TranAD 모델에 맞는 차원 조정
            src = window[:-1].unsqueeze(1)  # (seq_len, batch_size, embed_dim)
            tgt = window[-1:].unsqueeze(1)  # (1, batch_size, embed_dim)
            _, pred = model(src, tgt)
            
            # Loss 계산 및 이상 탐지
            loss = torch.mean((pred - tgt) ** 2).item()
            anomaly_scores.append(loss)
            anomalies.append(loss > threshold)

    return anomaly_scores, anomalies

# 그래프 시각화 함수
def save_anomaly_scores(scores, threshold):
    graph_dir = "./png"
    os.makedirs(graph_dir, exist_ok=True)  # 경로 없으면 생성
    graph_path = os.path.join(graph_dir, "graph.png")
    
    plt.figure(figsize=(12, 6))
    plt.plot(scores, label="Anomaly Scores", marker='o', markersize=4, linewidth=1)
    plt.axhline(y=threshold, color='r', linestyle='--', label="Threshold")
    plt.title("Anomaly Scores with Threshold")
    plt.xlabel("Sliding Window Index")
    plt.ylabel("Anomaly Score")
    plt.legend()
    plt.grid(True)
    plt.savefig(graph_path)
    plt.close()
    print(f"Graph saved to {graph_path}")


# Anomaly Rate 저장 함수
def save_anomaly_rate(anomaly_count, total_windows):
    anomaly_rate = (anomaly_count / total_windows) * 100
    txt_dir = "./txt"
    os.makedirs(txt_dir, exist_ok=True)  # 경로 없으면 생성
    anomaly_rate_path = os.path.join(txt_dir, "anomalyRate.txt")
    
    with open(anomaly_rate_path, "w") as f:
        f.write(f"{anomaly_rate:05.1f}")  # 00.0 형식으로 저장
    print(f"Anomaly rate saved to {anomaly_rate_path}")

# 실행 코드
if __name__ == "__main__":


    # 경로 및 파라미터 설정
    model_path = './TranAD_HAI_2/full_checkpoint.ckpt'
    test_csv_path = 'test.csv'
    feature_columns = ['DATA[0]', 'DATA[1]', 'DATA[2]', 'DATA[3]', 'DATA[4]', 'DATA[5]', 'DATA[6]', 'DATA[7]']
    window_size = 20
    threshold = 0.15
    
    # 모델 로드
    checkpoint = torch.load(model_path)
    input_features = len(feature_columns)
    model = TranAD(input_features)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    
    # 스케일러 로드
    scaler = MinMaxScaler()
    scaler.fit([[0] * 8, [255] * 8])
    
    # 데이터 전처리
    test_data_tensor = preprocess_data(test_csv_path, scaler, feature_columns, window_size)
    
    # 이상 탐지 수행
    anomaly_scores, anomalies = detect_anomalies(model, test_data_tensor, threshold)
    
    # 결과 출력
    for i, (score, is_anomaly) in enumerate(zip(anomaly_scores, anomalies)):
        status = "Anomaly" if is_anomaly else "Normal"
        print(f"Window {i}: Score = {score:.4f}, Status = {status}")

    # 그래프 출력
    save_anomaly_scores(anomaly_scores, threshold)

    # 요약 출력
    total_windows = len(anomalies)
    anomaly_count = sum(anomalies)
    print(f"\nTotal Windows: {total_windows}")
    print(f"Anomalies Detected: {anomaly_count}")
    print(f"Anomaly Rate: {anomaly_count / total_windows * 100:.2f}%")

    # Anomaly Rate 저장
    save_anomaly_rate(anomaly_count, total_windows)
    end = time.time()

# %%


