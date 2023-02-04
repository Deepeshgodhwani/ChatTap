const express = require("express");
const fetchUser = require("../config/fetchUser");
const router = express.Router();
const chatCont = require("../controller/chatController");
const userCont = require("../controller/userController");

const {
  fetchChat,
  changeName,
  removeUser,
  addUser,
  accessChat,
  createGroup,
  savemessage,
  fetchMessages,
  accessGroupChat,
  changePic,
  countUnseenMssge,
  getCommonGroups,
} = chatCont;

router.get("/searchUser", fetchUser, userCont.searchUser);
router.get("/accessChat", fetchUser, accessChat);
router.get("/fetchMessages", fetchUser, fetchMessages);
router.post("/message", fetchUser, savemessage);
router.post("/createGroup", fetchUser, createGroup);
router.get("/accessGroupChat", fetchUser, accessGroupChat);
router.get("/fetchChats", fetchUser, fetchChat);
router.post("/changeName", fetchUser, changeName);
router.get("/removeUser", fetchUser, removeUser);
router.get("/changePic", fetchUser, changePic);
router.post("/addUser", addUser);
router.get("/countMssg", fetchUser, countUnseenMssge);
router.get("/getCommonGroups", fetchUser, getCommonGroups);

module.exports = router;
