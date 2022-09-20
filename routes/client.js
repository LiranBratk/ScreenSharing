const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.render('client', {
        wsPort: process.env.PORT || 3000 //(Number(process.env.PORT) + 1)
    });
});

module.exports = router;