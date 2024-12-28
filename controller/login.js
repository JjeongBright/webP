// login.js
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const { getId, getPassword, getName } = require("../service/data/queries"); // Data access functions

// Login page routing
router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", async (req, res) => {
    const { id, password } = req.body;

    try {
        const userId = await getId(id);
        if (!userId) {
            return res.redirect("/login?error=아이디가 존재하지 않습니다.");

        }

        const hashedPassword = await getPassword(id);
        const isMatch = bcrypt.compareSync(password, hashedPassword);

        if (!isMatch) {
            return res.redirect("/login?error=아이디나 비밀번호가 일치하지 않습니다.");
        }

        const userName = await getName(id);
        req.session.user = { id: id, name: userName };
        res.redirect("/index");

    } catch (error) {
        console.error("로그인 처리 중 오류:", error);
        res.status(500).send("서버 오류");
    }
});

module.exports = router;

