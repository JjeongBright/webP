const dat = require('./data/queries');
const imageConverter = require('./converter/encodeBase64');



async function load(req, res) {

    const id = req.session.user.id;
    const laboratory = await dat.getLaboratory(id);
    const position = await dat.getPosition(id);
    const count = await dat.getCount(id);

    let items = [];

    if(count >= 1) {
        for (let i = 1; i <= count; i++) {

            const fileName = await dat.getFileName(id, i);
            const status = await dat.getState(id, i);
            try {
                const pictureData = await imageConverter.convertImage(req, i);
                items.push({
                    fileName: fileName,
                    image: `data:image/png;base64,${pictureData}`,
                    status: status
                });
            } catch (err) {
                console.error(`Error processing image at index ${i}:`, err.message);
                items.push({
                    fileName: fileName,
                    image: null, // 이미지가 없을 경우 처리
                    status: status
                });
            }
        }
    }
    else {
        return res.redirect("/index?error=사진이 존재하지 않습니다. 업로드 1회 이상 실행시에만 확인이 가능합니다.");
    }

    res.render("myPage", {
        laboratory: laboratory,
        position: position,
        name: req.session.user.name,
        items
    });

}

module.exports = {
    load,
}