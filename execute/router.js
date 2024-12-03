const express = require("express");
const app = express();
const router = express.Router();

// Import routes
const loginRoutes = require("../controller/login");
const introRoutes = require("../controller/intro");
const signupRoutes = require("../controller/signup");

// Use routes
app.use("/", loginRoutes);
app.use("/", introRoutes);
app.use("/", signupRoutes); // Integrate signup routes


module.exports = router;