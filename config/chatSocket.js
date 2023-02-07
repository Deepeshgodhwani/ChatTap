const chatController = require("../controller/chatController");
const { addCount } = chatController;

module.exports.chatSocket = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  //setup socket connection //

  io.on("connection", (socket) => {
    console.log("connected to socket.io");
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      console.log("user joined", userData.name);
      socket.emit("connected");
    });

    //new message triggered //

    socket.on("new_message", (message) => {
      var chat = message.chatId;
      if (!chat.users) return console.log("chat users not defined");
      chat.users.forEach((members) => {
        if (members.user._id === message.sender._id) return;
        let data = {
          message: message,
          receiverId: members.user._id,
        };
        socket.in(members.user._id).emit("message_recieved", data);
      });

      if (message.removedUserId) {
        let data = {
          message: message,
          receiverId: message.removedUserId,
        };
        socket.in(message.removedUserId).emit("message_recieved", data);
      }
    });

    // update recent message //

    socket.on("update_Chatlist", (message) => {
      var chat = message.chatId;
      if (!chat.users) return console.log("chat users not defined");
      chat.users.forEach(async (members) => {
        if (members.user._id === message.sender._id) return;
        let users = await addCount(message.chatId._id, members.user._id);
        let data = {
          message: message,
          users: users,
        };
        socket.in(members.user._id).emit("latest_message", data);
      });

      if (message.removedUserId) {
        let data = {
          message: message,
          receiverId: message.removedUserId,
        };
        socket.in(message.removedUserId).emit("latest_message", data);
      }
    });

    // on creating group //

    socket.on("group_created", (group) => {
      group.users.forEach((members) => {
        if (members.user._id == group.admin._id) return;
        socket.in(members.user._id).emit("created_group", group);
      });
    });

    //update user exist in group or not //

    socket.on("member_status", (data) => {
      data.users.forEach((members) => {
        socket.in(members.user).emit("groupRemoved", data);
      });
    });

    // on changing group image //

    socket.on("changed_groupImage", (data) => {
      data.chat.users.forEach((members) => {
        if (members.user._id == data.logUser._id) return;
        socket.in(members.user._id).emit("toggleImage", data);
      });
    });

    // on changing group name //

    socket.on("changed_groupName", (data) => {
      data.chat.users.forEach((members) => {
        if (members.user._id == data.logUser._id) return;
        socket.in(members.user._id).emit("toggleName", data);
      });
    });

    //update users list while removing or adding //

    socket.on("change_users", (data) => {
      data.group.users.forEach((members) => {
        if (members.user._id == data.group.admin._id) return;
        socket.in(members.user._id).emit("updateUsers", data);
      });
    });

    //toggle typing //

    socket.on("toggleTyping", (data) => {
      data.chat.users.forEach((members) => {
        if (members.user._id == data.user._id) return;
        socket.in(members.user._id).emit("isTyping", data);
      });
    });
  });
};
