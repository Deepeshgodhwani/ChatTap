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
    },vanishMode:{
        type:Boolean,
        default:false
    },
    created_date:{
        type:Date,
        default:Date.now
    }
})


const chatBox=mongoose.model("chat",chatBoxSchema);
module.exports=chatBox;