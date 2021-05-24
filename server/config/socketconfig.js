const {handleCheckIn, handleDisconnect, handleMessageSent} = require("../routers/chatRouter");

module.exports = (server) => {
    const socketCORSConfig = {
        cors: {
            origin: ["http://localhost:3000", "https://mesw-secapp.herokuapp.com"],
            methods: ["GET", "POST"],
        },
    };
    let io;
    io = require("socket.io")(server, socketCORSConfig);

    io.on("connection", (socket) => {
        console.log("new socket connection: " + socket.id);
        socket.on('check-in', (params) => handleCheckIn(socket, params));
        socket.on('disconnect', () => handleDisconnect(socket));
        socket.on('message-sent', handleMessageSent);
    });
};
