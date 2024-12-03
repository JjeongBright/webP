const express = require('express');
const app = express();
const router = express.Router();

const bodyParser = require("body-parser");
const session = require("express-session");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(
    session({
        secret: "secretary",
        resave: false,
        saveUninitialized: true,
    })
);

module.exports = router;