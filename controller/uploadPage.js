const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const consoleInput = require('../util/consoleInput');
const uploadCsv = require('../util/uploadCSV');


const PORT = 3000;

// 정적 파일 서빙 설정

router.get("/upload", (req, res) => {
    const errorMessage = req.query.error;
    res.render("uploadResult", { errorMessage });
});

router.post("/upload", (req, res) => {

    consoleInput.executePython(res);

    setTimeout(() => uploadCsv.uploadCsvFile(req, res), 5000);


});

module.exports = router;
