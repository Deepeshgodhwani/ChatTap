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
      chat.users.forEach((members) => {
        if (members.user._id=== message.sender._id) return;
        let data={
             message:message,
             receiverId:members.user._id
        }
        socket.in(members.user._id).emit("message_recieved",data);
      });
    });

    socket.on("group_created", (group) => {
      group.users.forEach((members) => {
        if (members.user._id == group.admin._id) return;
        socket.in(members.user._id).emit("created_group", group);
      });
    });

    socket.on("member_status",(data)=>{
              data.users.forEach(members=>{
                socket.in(members.user).emit("groupRemoved", data.status);  
              })
    })
  });
};
