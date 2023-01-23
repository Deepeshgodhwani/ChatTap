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
      isChat[0].users.map(members=>{
        let memberId=members.user._id.toString();
         if(memberId===req.user){
             members.unseenMsg=0;
         }
        })
       await isChat[0].save();
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
    const { chatName, selectedUsersId,groupPicture } = req.body;
    console.log(groupPicture);
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
      profilePic:groupPicture
    });


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

      chat.users.map(members=>{
         let memberId=members.user._id.toString();
          if(memberId===req.user){
              members.unseenMsg=0;
          }
      })

      await chat.save();
    return res.send(chat);
  } catch (error) {
    console.error("error in access group chat", error.message);
    res.status(200).send("Internal Server Error");
  }
};

module.exports.changeName = async (req, res) => {
  try {
    const { type, Id, name } = req.body;
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
         
     let index=-1;
     let count=0;
     console.log(group.users);
     group.users.forEach(members=>{
       let memberId=members.user.toString();
       console.log(memberId, " and ",userId);
          if(memberId===userId){
             index=count;
          }
          count++;
     })
     console.log(index);
     group.users.splice(index,1);
    
    await group.save();

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
        group.users.push({ user: users.user, unseenMsge: 0 });
    });
    await group.save();

    console.log(group);
    return res.send({ success: true });
  } catch (error) {
    console.error("error in adding user", error.message);
    res.status(200).send("Internal Server Error");
  }
};

module.exports.changePic = async (req, res) => {
  try {
    const { isGroupChat, Id, pic } = req.query;
    console.log(req.query);

    if (isGroupChat!='false') {
      let chat = await Chat.findById(Id);
      chat.set({ profilePic: pic });
      await chat.save();
    } else {
      let user = await User.findById(Id);
      user.avtar=pic;
      await user.save();
    }

    return res.send({ success: true });
  } catch (error) {
    console.error("error in changing pic", error.message);
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
          console.log(members.unseenMsg);
          members.unseenMsg = members.unseenMsg + 1;
          console.log(members.unseenMsg);
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

module.exports.getCommonGroups =async(req,res)=>{

     try {
         
      let chats =await Chat.find({isGroupChat:true,
        $and: [
          { users: { $elemMatch: { user: ObjectId(req.query.userId) } } },
          { users: { $elemMatch: { user: ObjectId(req.user) } } },
          ],
          }).populate({
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
          return res.send(chats);
        
     } catch (error) {
        console.error(error.message);
        res.status(200).send("Internal Server Error");
     }
}



