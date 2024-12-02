const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const pool = require('./index'); // MySQL 연결 풀 가져오기
const { getId, getPassword } = require("./data"); // getId, getPassword 함수 가져오기

const app = express();
const PORT = 3000;

// Pug 설정
app.set("view engine", "pug");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(
    session({
        secret: "secretary",
        resave: false,
        saveUninitialized: true,
    })
);

// 메인 페이지 라우팅
app.get("/", (req, res) => {
    if (req.session.user) {
        res.render("index", { name: req.session.user.name });
    } else {
        res.redirect("/login");
    }
});

// 로그인 페이지 라우팅
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { id, password } = req.body;

    try {
        const user = await getId(id);
        if (!user) {
            return res.send("아이디가 존재하지 않습니다.");
        }

        const hashedPassword = await getPassword(id);
        const isMatch = bcrypt.compareSync(password, hashedPassword);

        if (!isMatch) {
            return res.send("비밀번호가 틀렸습니다.");
        }

        req.session.user = { id: id };
        res.redirect("/");
    } catch (error) {
        console.error("로그인 처리 중 오류:", error);
        res.status(500).send("서버 오류");
    }
});

// 회원가입 페이지 라우팅
app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
