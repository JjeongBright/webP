const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
const PORT = 3000;

// 사용자 데이터 저장 (임시)
const users = [];

// Pug 설정
app.set("view engine", "pug");
app.set("views", "./views");

// 미들웨어
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(
    session({
        secret: "mysecretkey",
        resave: false,
        saveUninitialized: true,
    })
);

// 라우트 설정
app.get("/", (req, res) => {
    if (req.session.user) {
        res.render("index", { name: req.session.user.name });
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username);

    if (!user) {
        return res.send("아이디가 존재하지 않습니다.");
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.send("비밀번호가 틀렸습니다.");
    }

    req.session.user = user;
    res.redirect("/");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", (req, res) => {
    const { username, password, name } = req.body;

    if (users.find((u) => u.username === username)) {
        return res.send("이미 존재하는 아이디입니다.");
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashedPassword, name });

    res.redirect("/login");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
