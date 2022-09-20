const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/shareScreen', function (req, res, next) {
    console.log("AA")
    res.render('sharescreen');
});

module.exports = router;