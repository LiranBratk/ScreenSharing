const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.render('client', {
        wsPort: 80 //(Number(process.env.PORT) + 1)
    });
});

module.exports = router;