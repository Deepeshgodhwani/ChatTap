module.exports.chatSocket = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("connected to socket.io");
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("user joined", room);
    });

    socket.on("new_message", (message) => {
      var chat = message.chatId;
      if (!chat.users) return consol.log("chat users not defined");
      console.log("hitt");
      chat.users.forEach((user) => {
        if (user == message.sender._id) return;
        socket.in(user).emit("message_recieved", message);
      });
    });

    socket.on("group_created", (group) => {
      group.users.forEach((user) => {
        if (user._id == group.admin._id) return;
        console.log(user._id);
        socket.in(user._id).emit("created_group", group);
      });
    });
  });
};
