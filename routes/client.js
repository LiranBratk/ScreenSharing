const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.render('client', {
        wsPort: (Number(process.env.PORT) + 1)
    });
});

module.exports = router;