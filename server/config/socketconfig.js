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
    // console.log(socket.id);

    socket.on("join_room", (data) => {
      console.log(data);
      socket.join(data);
      console.log("User Joined Room: " + data);
    });

    socket.on("send_message", (data) => {
      console.log(data);
      socket.to(data.room).emit("receive_message", data.content);
    });

    socket.on("disconnect", () => {
      console.log("USER DISCONNECTED");
    });
  });
};
