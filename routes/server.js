module.exports = router = function (app) {

    const express = require('express');
    const cors = require('cors');

    app.use(cors({
        origin: '*'
    }));

    // const server = require('http').Server(app);
    // const io = socketio(server);

    const { Server } = require('socket.io');
    const io = new Server(3001);
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

    app.get('/server', function (req, res, next) {
        res.render('server');
    });

}