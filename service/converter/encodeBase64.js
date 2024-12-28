const express = require('express');
const router = express.Router();
const sharp = require('sharp');

const { getImage } = require("../data/queries");
async function convertImage(req, idx) {
    if (!req.session.user) {
        throw new Error("사용자 세션이 유효하지 않습니다.");
    }

    const id = req.session.user.id;
    const picture = await getImage(id, idx);


    if (!picture || (!picture.graph_image && (!Array.isArray(picture) || picture.length === 0))) {
        throw new Error("이미지가 존재하지 않습니다.");
    }

    const imageBuffer = Array.isArray(picture) ? picture[0]?.graph_image : picture.graph_image;



    if (!Buffer.isBuffer(imageBuffer)) {
        throw new Error("이미지 데이터가 Buffer 형식이 아닙니다.");
    }

    return imageBuffer.toString('base64');
}


module.exports = {
    convertImage
}