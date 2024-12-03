// app.js
const express = require("express");
const app = express();
const PORT = 3000;

// 미들웨어 불러오기
const applyMiddlewares = require('./execute/middleWare');
applyMiddlewares(app);

// 뷰 엔진 설정
app.set("view engine", "pug");
app.set("views", "./views");

// 라우터 불러오기
const routers = require('./execute/router');

// 라우터 적용
app.use("/", routers);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
