const express=require('express');
const passport =require('passport');
const router=express.Router();
const accountController=require('../controller/account');

const {create,createSession,destroySession} = accountController;

router.post('/create',create);
router.get('/createSession',passport.authenticate('local',{failureRedirect:'/'}),createSession);
router.get('/signout',destroySession);



module.exports=router;