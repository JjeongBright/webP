const express = require('express');
const router = express.Router();

const { getImage } = require("../execute/data");

router.get('/confirmPicture', async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/uploadPicture");
    }

    const id = req.session.user.id;
    const picture = await getImage(id);
    let imageBuffer;

    if (!picture) {
        res.send("이미지가 존재하지 않습니다.");
        return res.redirect('/uploadPicture');
    }

    if(Array.isArray(picture)) {
        if (picture.length > 0 && picture[0].graph_image) {
            imageBuffer = picture[0];
        }
    } else if(picture.graph_image) {
        imageBuffer = picture.graph_image;
    }

    let pictureData;

    if(!Buffer.isBuffer(imageBuffer)) {
        imageBuffer = Buffer.from(imageBuffer);
    }

    pictureData = imageBuffer.toString('base64');
    res.render('confirmPicture', { pictureData });
});

module.exports = router;
