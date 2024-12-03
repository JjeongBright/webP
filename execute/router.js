// router.js
const express = require("express");
const router = express.Router();

const loginRoutes = require("../controller/login");
const introRoutes = require("../controller/intro");
const signupRoutes = require("../controller/signup");
const uploadRoutes = require("../util/upload"); // 업로드 라우트 추가

router.use("/", loginRoutes);
router.use("/", introRoutes);
router.use("/", signupRoutes);
router.use("/", uploadRoutes); // 업로드 라우트 적용

module.exports = router;
