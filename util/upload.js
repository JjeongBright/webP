// controller/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const consoleCommand = require("./consoleInput");

// 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, '..', 'image');

// 디렉토리 존재 여부 확인 및 생성
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer 저장소 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'csv-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 파일 필터 설정 (CSV 파일만 허용)
const fileFilter = (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.csv') {
        cb(null, true);
    } else {
        cb(new Error('CSV 파일만 업로드 가능합니다.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 최대 5MB
});

router.get("/uploads", (req, res) => {
    // res.render('uploadResult');
})

router.post('/uploads', upload.single('csvfile'), (req, res) => {
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const headers = [];
    const rows = [];


    fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headerList) => {
            headers.push(...headerList);
        })
        .on('data', (data) => {
            rows.push(data);
        })
        .on('end', () => {
            // 파일 삭제 (선택 사항)
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('파일 삭제 중 오류:', err);
                }
                res.render('uploadResult', { fileName, headers, rows });
            });
        })
        .on('error', (err) => {
            console.error('CSV 파일 처리 중 오류:', err);
            res.status(500).send('CSV 파일 처리 중 오류가 발생했습니다.');
        });
});

module.exports = router;
