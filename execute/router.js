// router.js
const express = require("express");
const router = express.Router();

// 라우트 파일 불러오기
const loginRoutes = require("../controller/login");
const introRoutes = require("../controller/intro");
const signupRoutes = require("../controller/signup");

// 라우트 통합
router.use("/", loginRoutes);
router.use("/", introRoutes);
router.use("/", signupRoutes);

module.exports = router;
