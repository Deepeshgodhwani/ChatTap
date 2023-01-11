const Chat = require("../models/chat-box");
const ObjectId = require("bson-objectid");
const Message = require("../models/message");
const User = require("../models/user");
var mongoose = require("mongoose");

module.exports.savemessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    let message = await Message.create({
      content,
      sender: req.user,
      chatId,
    });

    if (req.body.noty) {
      message.noty = true;
      message.save();
    }

    let chat = await Chat.findById(chatId);
    chat.latestMessage = message._id;
    chat.save();
    let detailedMessage = await Message.findById(message._id)
      .populate("sender", "-password")
      .populate({
        path: "chatId",
        populate: {
          path: "users",
          populate: {
            path: "user",
          },
        },
      });
    return res.send(detailedMessage);
  } catch (error) {
    console.error("error in saving messages", error.message);
    res.status(400).send("Internal Server Error");
  }
};

module.exports.fetchMessages = async (req, res) => {
  try {
    const { Id } = req.query;
    let chatId = mongoose.Types.ObjectId(Id);
    let detailedMessage = await Message.find({ chatId: chatId }).populate(
      "sender",
      "-password"
    );
    return res.send(detailedMessage);
  } catch (error) {
    console.error("error in fetching messages", error.message);
    res.status(400).send("Internal Server Error");
  }
};

module.exports.fetchChat = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { user: ObjectId(req.user) } },
    })
      .populate({
        path: "users",
        populate: {
          path: "user",
        },
      })
      .populate({
        path: "latestMessage",
        ref: "message",
        populate: {
          path: "sender",
        },
      })
      .populate("admin")
      .sort("-updatedAt");

    return res.send(chats);
  } catch (error) {
    console.error("error in fetching recent chats", error.message);
    res.status(200).send("Internal Server Error");
  }
};

module.exports.accessChat = async (req, res) => {
  try {
    const { userTwo } = req.query;
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { user: ObjectId(userTwo) } } },
        { users: { $elemMatch: { user: ObjectId(req.user) } } },
      ],
    })
      .populate({
        path: "users",
        populate: {
          path: "user",
          ref: "user",
        },
      })
      .populate({
        path: "latestMessage",
        ref: "message",
        populate: {
          path: "sender",
          ref: "user",
          select: "name,email,avtar",
        },
      });
    if (isChat.length > 0) {
      return res.send(isChat[0]);
    } else {
      let chat = await Chat.create({
        isGroupChat: false,
        users: [{ user: req.user }, { user: userTwo }],
      });

      let fullChat = await Chat.findById(chat._id).populate({
        path: "users",
        populate: {
          path: "user",
          ref: "user",
        },
      });

      await fullChat.save();

      return res.send(fullChat);
    }
  } catch (error) {
    console.error("error in accessing chat", error.message);
    res.status(200).send("Internal Server Error");
  }
};

module.exports.createGroup = async (req, res) => {
  try {
    const { chatName, selectedUsersId } = req.body;
    selectedUsersId.push({ user: req.user });
    if (selectedUsersId.length <= 2) {
      return res.status(400).json({
        error: true,
        message: "Minimum users should be three",
      });
    }

    let newChat = await Chat.create({
      chatname: chatName,
      isGroupChat: true,
      users: selectedUsersId,
      admin: req.user,
    });

    if (req.body.pic) {
      newChat.profilePic = req.body.pic;
      newChat.save();
    }

    let FULLCHAT = await Chat.findById(newChat._id)
      .populate({
        path: "users",
        populate: {
          path: "user",
          ref: "user",
        },
      })
      .populate("admin", "-password");
    return res.send(FULLCHAT);
  } catch (error) {
    console.error("error in creating group", error.message);
    res.status(200).send("Internal Server Error");
  }
};

module.exports.accessGroupChat = async (req, res) => {
  try {
    let chat = await Chat.findById(req.query.chatId)
      .populate({
        path: "users",
        populate: {
          path: "user",
          ref: "user",
        },
      })
      .populate({
        path: "latestMessage",
        ref: "message",
        populate: {
          path: "sender",
          ref: "user",
          select: "name,email,avtar",
        },
      })
      .populate("admin", "-password");

    return res.send(chat);
  } catch (error) {
    console.error("error in access group chat", error.message);
    res.status(200).send("Internal Server Error");
  }
};

module.exports.changeName = async (req, res) => {
  try {
     console.log("reached");
    const { type, Id, name } = req.body;
    console.log(req.body);
    if (type === "group") {
      let chatId= mongoose.Types.ObjectId(Id);
      let chat = await Chat.findById(chatId);
      chat.chatname = name;
      await chat.save();
      return res.send(chat);
    } else {
      let userId=mongoose.Types.ObjectId(Id)
      let user = await User.findById(userId).select("-password");
      user.name = name;
      await user.save();
      return res.send(user);
    }
  } catch (error) {
    console.error(error.message);
    res.status(200).send("Internal Server Error");
  }
};

module.exports.removeUser = async (req, res) => {
  try {
    const { chatId, userId } = req.query;
    let group = await Chat.findById(chatId);
    group.users.forEach((members) => {
      let memberId = members.user.toString();
      if (memberId === userId) {
        members.isRemoved = true;
      }
    });
    await group.save();
    console.log(group.users);

    return res.send({ success: true });
  } catch (error) {
    console.error("error in removing user", error.message);
    res.status(200).send("Internal Server Error");
  }
};

module.exports.addUser = async (req, res) => {
  try {
    const { chatId, usersId } = req.body;
    let group = await Chat.findById(chatId);

    usersId.map((users) => {
      let check = true;
      group.users.map((member) => {
        let memberId = member.user.toString();
        if (memberId === users.user) {
          member.isRemoved = false;
          check = false;
        }
      });

      if (check) {
        group.users.push({ user: users.user, isRemoved: false, unseenMsge: 0 });
      }
    });
    group.save();

    return res.send({ success: true });
  } catch (error) {
    console.error("error in adding user", error.message);
    res.status(200).send("Internal Server Error");
  }
};

module.exports.changePic = async (req, res) => {
  try {
    console.log(req.query);
    const { isGroupChat, Id, pic } = req.query;

    if (isGroupChat) {
      let chat = await Chat.findById(Id);
      chat.set({ profilePic: pic });
      await chat.save();
    } else {
      let user = await User.findById(Id);
      user.set({ avtar: pic });
      await user.save();
    }

    return res.send({ success: true });
  } catch (error) {
    console.error("error in changin pic", error.message);
    res.status(200).send("Internal Server Error");
  }
};

module.exports.countUnseenMssge = async (req, res) => {
  try {
    const { type, chatId, userId } = req.query;
    let chat = await Chat.findById(chatId).populate({
      path: "users",
      populate: {
        path: "user",
      },
    });

    if (type == "dismiss") {
      chat.users.map((members) => {
        if (members.user == userId) {
          members.unseenMsg = 0;
        }
      });
    } else {
      chat.users.map((members) => {
        if (members.user._id == userId) {
          members.unseenMsg = members.unseenMsg + 1;
        }
      });
    }

    await chat.save();
    return res.send(chat.users);
  } catch (error) {
    console.error(error.message);
    res.status(200).send("Internal Server Error");
  }
};
