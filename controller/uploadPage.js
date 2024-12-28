const express = require('express');
const router = express.Router();
const consoleInput = require('../service/console/consoleInput');
const uploadCsv = require('../service/uploadCSV');


const PORT = 3000;

// 정적 파일 서빙 설정

router.get("/upload", (req, res) => {
    const errorMessage = req.query.error;
    res.render("uploadResult", { errorMessage });
});

router.post("/upload", async (req, res) => {

    await consoleInput.executePython(res);

    setTimeout(() => uploadCsv.uploadCsvFile(req, res), 5000);


});

module.exports = router;
