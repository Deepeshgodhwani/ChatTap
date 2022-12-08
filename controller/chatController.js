
const Chat = require('../models/chat-box');
const ObjectId = require('bson-objectid');
const Message =require('../models/message');
var mongoose = require('mongoose');



module.exports.savemessage=async(req,res)=>{
        
    try {
        
        const {content,chatId}=req.body;


        let message=await Message.create({
            content,
            sender:req.user,
            chatId
         })


         if(req.body.noty){
            message.noty=true;
            message.save();
         }


         let chat=await Chat.findById(chatId);
         chat.latestMessage=message._id;
         chat.save();
         let detailedMessage=await Message.findById(message._id).populate('sender','-password').populate('chatId');
         return res.send(detailedMessage);
         
    } catch (error) {
        console.error(error.message);
        res.status(400).send("Internal Server Error");
    }
}


module.exports.fetchMessages=async(req,res)=>{
        
    try {
        const {Id}=req.query;
         let chatId=mongoose.Types.ObjectId(Id);
         let detailedMessage=await Message.find({chatId:chatId}).populate("sender","-password");
         return res.send(detailedMessage);
         
    } catch (error) {
        console.error(error.message);
        res.status(400).send("Internal Server Error");
    }
}



module.exports.fetchChat=async(req,res)=>{

    try {
        let chats=await Chat.find({users:ObjectId(req.user)})
        .populate('users','-password')
        .populate({
            path:'latestMessage',
            ref:'message',
            populate:{
                path:'sender',
            }
        }).populate('admin');
         return res.send(chats);
    } catch (error) {
        console.error(error.message);
        res.status(200).send("Internal Server Error");
    }
}


module.exports.accessChat= async (req,res)=>{
     try {   
          const {userTwo} =req.query;
        let isChat=await Chat.find({
            isGroupChat:false,
            $and:[
                {users:ObjectId(userTwo)},
                {users:ObjectId(req.user)}
            ]
        }).populate("users","-password")
        .populate({
            path:'latestMessage',
            ref:'message',
            populate:{
                path:'sender',
                ref:'user',
                select:"name,email,avtar"
            }
        })
        if(isChat.length>0){   
            return res.send(isChat[0]);
        }else{
            let chat = await Chat.create({
                isGroupChat:false,
                users:[req.user,userTwo]
            })


            let fullChat=await Chat.findById(chat._id)
            .populate('users','-password');
            return res.send(fullChat);
        }
     } catch (error) {
        console.error(error.message);
        res.status(200).send("Internal Server Error");
     }
}


module.exports.createGroup =async(req,res)=>{

    try {

        const {chatName,selectedUsersId}=req.body;
         selectedUsersId.push(req.user);
        if(selectedUsersId.length<=2){
          return res.status(400).json({
              "error":true,
              "message":"Minimum users should be three"
          })
        }
  
        let newChat =await Chat.create({
            chatname:chatName,
            isGroupChat:true,
            users:selectedUsersId,
            admin:req.user
        })
        
        let FULLCHAT=await Chat.findById(newChat._id)
        .populate('users','-password')
        .populate('admin','-password')
         return res.send(FULLCHAT);  
    } catch (error) {
        console.error(error.message);
        res.status(200).send("Internal Server Error");  
    } 
      
}


module.exports.accessGroupChat=async(req,res)=>{
     
    try {
        let chat=await Chat.findById(req.query.chatId)
        .populate("users","-password")
        .populate({
            path:'latestMessage',
            ref:'message',
            populate:{
                path:'sender',
                ref:'user',
                select:"name,email,avtar"
            }
        }).populate('admin',"-password"); 


        
         return res.send(chat);

    } catch (error) {
        console.error(error.message);
        res.status(200).send("Internal Server Error");
    }
     
}

module.exports.renameGroup=async(req,res)=>{
      
   try {
        return ;
   } catch (error) {
        console.error(err.message);
        res.status(200).send("Internal Server Error");
   }
}

module.exports.removeGroup=async(req,res)=>{
      
  try {
    return ;
  } catch (error) {
    console.error(err.message);
    res.status(200).send("Internal Server Error");
  }
}

module.exports.addGroup=async(req,res)=>{
      
    try {
        return ;
    } catch (error) {
        console.error(err.message);
        res.status(200).send("Internal Server Error");
    }
}