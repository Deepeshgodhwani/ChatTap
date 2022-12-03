

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

          socket.on("send_message",(data)=>{
              console.log("message sent",data)
               socket.join("default");
               io.in("default").emit("receive_message",data);
          })
     })
}
