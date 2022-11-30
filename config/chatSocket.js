

module.exports.chatSocket=(server)=>{
  
     const io= require('socket.io')(server,{
        cors:{
           origin:"*"
        }
     })

     io.on('connection',(socket)=>{
          console.log("Connection Estaiblished ");
          socket.on("join_room",(data)=>{
              console.log("user joined ",data);
              socket.join("default");
              io.in('default').emit("user_joined",data);
          })

          socket.on("send_message",(data)=>{

               socket.join("default");
               io.in("default").emit("receive_message",data);
          })
     })
}
