// index.js
const express = require("express");
const router = express.Router();

const { getName, getLaboratory, getPosition} = require("../execute/data"); // Data access functions

// Root route
router.get("/", (req, res) => {
    if (req.session.user) {
        res.render("index", { name: req.session.user.name });
    } else {
        res.redirect("/login");
    }
});

// Intro route
router.get("/index", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    const id = req.session.user.id;

    try {
        const name = await getName(id);
        const laboratory = await getLaboratory(id);
        const position = await getPosition(id);
        res.render("index", { laboratory, position, name });
    } catch (error) {
        console.error("사용자 이름을 가져오는 중 오류:", error);
        res.status(500).send("서버 오류");
    }
});

module.exports = router;