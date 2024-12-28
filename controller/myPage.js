const express = require('express');
const router = express.Router();
const loadData = require('../service/userInformation')

router.get("/myPage", async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    await loadData.load(req, res);

});

module.exports = router;
