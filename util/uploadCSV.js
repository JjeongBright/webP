const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");



router.use('/image', express.static(path.join(__dirname, 'image')));


function uploadCsvFile(req, res) {

    const py_dir = "./tranAD_python/";

    const upload = multer({
        dest: 'uploads/',
        limits: {
            fileSize: 1024 * 1024 * 10 // 최대 파일 크기: 10MB
        },
        fileFilter: (req, file, cb) => {
            // 파일의 MIME 타입을 확인하여 CSV 파일만 허용
            if (file.mimetype === 'text/csv') {
                cb(null, true);
            } else {
                cb(new Error('CSV 파일만 업로드 가능합니다.'));
            }
        }
    });


    upload.single('csvfile')(req, res, (err) => {
        if (err) {
            // Multer에서 발생한 에러 처리
            if (err.message === 'CSV 파일만 업로드 가능합니다.') {
                return res.redirect('/upload?error=CSV 파일만 업로드 가능합니다.');
            } else if (err.code === 'LIMIT_FILE_SIZE') {
                return res.redirect('/upload?error=파일 크기가 너무 큽니다. 최대 10MB 이하의 파일을 업로드 해주세요.');
            } else {
                console.error('파일 업로드 중 오류 발생:', err);
                return res.status(500).send('파일 업로드 중 오류가 발생했습니다.');
            }
        }
        // 파일이 비었을 경우 처리
        if (!req.file) {
            return res.redirect('/upload?error=파일이 업로드되지 않았습니다. 파일을 선택해주세요.');
        }
        const imageUrl = path.join(py_dir, 'png', 'graph.png');
        const txtUrl = path.join(py_dir, 'txt', 'anomalyRate.txt');
        let risk;

        // 비동기적으로 이미지 및 텍스트 파일 읽기
        Promise.all([
            fs.promises.readFile(imageUrl),
            fs.promises.readFile(txtUrl, 'utf-8')
        ])
            .then(([imageData, textData]) => {
                const pictureData = imageData.toString('base64');
                let currentStatus = parseFloat(textData.trim());

                if (currentStatus === 0) {
                    risk = "은 안전합니다.";
                } else {
                    risk = "에서 이상행위가 탐지되어, 가까운 카센터로 내방하시길 바랍니다.";
                }

                res.render("uploadResult", {pictureData, currentStatus, risk});
            })
            .catch((err) => {
                console.error('파일 처리 중 오류 발생:', err);
                res.status(500).send('파일 읽기 오류 발생');
            });
    });
}


module.exports = {
    uploadCsvFile,
}

