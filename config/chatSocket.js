

module.exports.chatSocket=(server)=>{
  
     const io= require('socket.io')(server,{
        cors:{
           origin:"*"
        }
     })

     io.on('connection',(socket)=>{
          console.log("connected to socketd.io");
          socket.on("setup",(userData)=>{
               socket.join(userData._id);
               socket.emit("connected");
          }) 

          socket.on("join chat",(room)=>{
               socket.join(room);
               console.log("user joined ",room);
          })

          socket.on("new_message",(message)=>{
               var chat=message.chatId;

               if(!chat.users) return consol.log("chat.users not defined");
                
               chat.users.forEach(user=>{
                    if(user==message.sender._id) return ;
                       
                    socket.in(user).emit("message_recieved",message);

               })
              
          })
     })
}
