const express = require("express");
const port = 7000;
const db = require("./config/mongoos");
const cors = require('cors');
const app = express();


app.use(cors());

app.use(express.json());

const chatServer=require('http').Server(app);

const chatSocket=require('./config/chatSocket').chatSocket(chatServer);

chatServer.listen(4000,(err)=>{
        if(err){"error in listening chat server"}else{
          console.log("chat server is running successfully on port : 4000");
        }                     
})





app.use("/api/auth", require("./routes/auth"));
app.use("/api/chat",require('./routes/chat'));

app.listen(port, function (err) {
  if (err) {
    console.log("error in running server", port);
  } else {
    console.log("server is running succefully on port:", port);
  }
});
