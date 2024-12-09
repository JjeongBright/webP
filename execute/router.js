// router.js
const express = require("express");
const router = express.Router();

const loginRoutes = require("../controller/login");
const introRoutes = require("../controller");
const signupRoutes = require("../controller/signup");
const uploadRoutes = require("../controller/uploadPage"); // 추가

router.use("/", loginRoutes);
router.use("/", introRoutes);
router.use("/", signupRoutes);
router.use("/", uploadRoutes);

module.exports = router;
