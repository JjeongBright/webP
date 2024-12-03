// signup.js
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const pool = require('../execute/db'); // Make sure to import your database connection
const { getId } = require("../execute/data"); // Import getId function

// Signup page routing
router.get("/signup", (req, res) => {
    res.render("signup");
});

router.post("/signup", async (req, res) => {
    const { id, password, name } = req.body;

    try {
        const existingUser = await getId(id);
        if (existingUser) {
            return res.send("이미 존재하는 아이디입니다.");
        }

        const hashedPassword = bcrypt.hashSync(password, 15);
        await pool.query('INSERT INTO example (id, password, name) VALUES (?, ?, ?)', [id, hashedPassword, name]);

        res.redirect("/login");
    } catch (error) {
        console.error("회원가입 처리 중 오류:", error);
        res.status(500).send("서버 오류");
    }
});

module.exports = router;
