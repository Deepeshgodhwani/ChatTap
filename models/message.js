const mongoose=require('mongoose');

const messageSchema=mongoose.Schema({
    noty:{type:Boolean,default:false},
    content:{type:String,require:true},
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    chatId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'chat'
    },
    created_date:{
        type:Date,
        default:Date.now
    }
    
},{
    timestamps:true,
})

const message=mongoose.model("message",messageSchema);
module.exports=message