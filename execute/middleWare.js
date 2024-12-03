// middleWare.js
const bodyParser = require("body-parser");
const session = require("express-session");
const express = require('express');

function applyMiddlewares(app) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static("public"));
    app.use(
        session({
            secret: "secretary",
            resave: false,
            saveUninitialized: true,
        })
    );
}

module.exports = applyMiddlewares;
