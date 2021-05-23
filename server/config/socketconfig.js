const {handleCheckIn, handleDisconnect, handleMessageSent} = require("../routers/chatRouter");

module.exports = (server) => {
    const socketCORSConfig = {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    };
    let io;
    if (process.env.NODE_ENV === "production") {
        io = require("socket.io")(server);
    } else {
        io = require("socket.io")(server, socketCORSConfig);
    }

    io.on("connection", (socket) => {
        console.log("new socket connection: " + socket.id);
        socket.on('check-in', (params) => handleCheckIn(socket, params));
        socket.on('disconnect', () => handleDisconnect(socket));
        socket.on('message-sent', handleMessageSent);
    });
};
