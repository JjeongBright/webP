// index.js
const express = require("express");
const router = express.Router();

const { getName, getLaboratory, getPosition} = require("../service/data/queries"); // Data access functions

// Root route
router.get("/", (req, res) => {
    if (req.session.user) {
        res.render("index");
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
        console.error("오류 발생:", error);
        res.status(500).send("서버 오류");
    }
});

module.exports = router;