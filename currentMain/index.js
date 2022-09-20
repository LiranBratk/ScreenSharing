const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const session = require('express-session');
const socketio = require('socket.io');
const cors = require('cors');

require('dotenv').config()
const app = express();

const indexRouter = require('./routes/app');
const clientRouter = require('./routes/client');
/*const serverRouter = */


app.use(session({
    secret: "aflhfajkhfjkashfsajhkfasjk",
    resave: false,
    saveUninitialized: true
}))
app.use(cors({
    origin: '*'
}));

require('./routes/server')(app);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/client', clientRouter);
// app.use('/server', serverRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(process.env.PORT || 3000, function () {
    console.log(
        "SERVER listening on port %d in %s mode",
        this.address().port,
        app.settings.env
    );
});

module.exports = app;
