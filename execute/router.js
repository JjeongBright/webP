// router.js
const express = require("express");
const router = express.Router();

const loginRoutes = require("../controller/login");
const introRoutes = require("../controller");
const signupRoutes = require("../controller/signup");
const uploadRoutes = require("../util/upload"); // 업로드 라우트 추가
const uploadPictureRoutes = require("../controller/uploadPage"); // 추가
const confirmPicture = require('../util/confirmUploadPicture');

router.use("/", loginRoutes);
router.use("/", introRoutes);
router.use("/", signupRoutes);
router.use("/", uploadRoutes); // 업로드 라우트 적용
router.use("/", uploadPictureRoutes);
router.use("/", confirmPicture);

module.exports = router;
