// app.js
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Middleware setup
const middleWare = require('execute/middleWare');

// View engine setup
app.set("view engine", "pug");
app.set("views", "./views");

const routers = require('/execute/router');

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
