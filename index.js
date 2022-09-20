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

const { Server } = require('socket.io');
const io = new Server(require('http').Server(app));
let connectedUsers = [];
let user_name = [];

io.on('connection', (socket) => {
    // It's necessary to socket knows all clients connected
    connectedUsers.push(socket.id);

    // Emit to myself the other users connected array to start a connection with each them
    console.log(connectedUsers.join(', '), socket.id);
    let adminSocket = connectedUsers[0]
    const otherUsers = (adminSocket == socket.id) ? [] : [adminSocket] //connectedUsers.filter(socketId => socketId !== socket.id);
    socket.emit('other-users', otherUsers);

    // Send Offer To Start Connection
    socket.on('appendname', (adminSocket, name) => {
        user_name.push(name)
        let socketID = connectedUsers[connectedUsers.length - 1];
        console.log(connectedUsers[connectedUsers.length - 1], user_name[user_name.length - 1])
        socket.to(adminSocket).emit("appendname", socketID, name)
    });

    // Send Offer To Start Connection
    socket.on('offer', (socketId, description) => {
        socket.to(socketId).emit('offer', socket.id, description, socketId);
    });

    // Send Answer From Offer Request
    socket.on('answer', (socketId, description) => {
        socket.to(socketId).emit('answer', description);
    });

    // Send Signals to Establish the Communication Channel
    socket.on('candidate', (socketId, candidate) => {
        socket.to(socketId).emit('candidate', candidate);
    });

    // Remove client when socket is disconnected
    socket.on('disconnect', () => {
        socket.to(adminSocket).emit("destroyed", socket.id)
        connectedUsers = connectedUsers.filter(socketId => socketId !== socket.id);
    });
});

module.exports = app;
