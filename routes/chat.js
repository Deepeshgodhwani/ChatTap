const express=require('express');
const fetchUser = require('../config/fetchUser');
const router=express.Router();
const chatCont=require('../controller/chatController');
const userCont =require('../controller/userController');


const {fetchChat,renameGroup,removeGroup,addGroup,accessChat,createGroup}=chatCont;

router.get('/searchUser',fetchUser,userCont.searchUser);
router.get('/accessChat',fetchUser,accessChat);
router.post('/createGroup',fetchUser,createGroup);
router.get('/fetchChats',fetchUser,fetchChat);
router.get('/renameGroup',fetchUser,renameGroup);
router.get('/removeGroup',fetchUser,removeGroup);
router.get('/renameGroup',fetchUser,renameGroup);
router.get('/addGroup',addGroup);



module.exports=router;