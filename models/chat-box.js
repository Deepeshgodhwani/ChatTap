const mongoose=require('mongoose');


const chatBoxSchema=mongoose.Schema({
 
    chatname:{
        type:String,
        trim:true
    },
    isGroupChat:{type:Boolean,default:false},
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    ],
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'message'
    }
},{
    timesstamps:true,
})


const chatBox=mongoose.model("chat",chatBoxSchema);
module.exports=chatBox;