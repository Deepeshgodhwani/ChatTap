const express=require('express');
const fetchUser = require('../config/fetchUser');
const router=express.Router();
const chatCont=require('../controller/chatController');
const userCont =require('../controller/userController');


const {fetchChat,renameGroup,removeUser,addUser,
    accessChat,createGroup,savemessage,fetchMessages,accessGroupChat,changePic}=chatCont;

router.get('/searchUser',fetchUser,userCont.searchUser);
router.get('/accessChat',fetchUser,accessChat);
router.get('/fetchMessages',fetchUser,fetchMessages);
router.post('/message',fetchUser,savemessage);
router.post('/createGroup',fetchUser,createGroup);
router.get('/accessGroupChat',fetchUser,accessGroupChat);
router.get('/fetchChats',fetchUser,fetchChat);
router.get('/renameGroup',fetchUser,renameGroup);
router.get('/removeUser',fetchUser,removeUser);
router.get('/changePic',fetchUser,changePic)
router.post('/addUser',addUser);



module.exports=router;