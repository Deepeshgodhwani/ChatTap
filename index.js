const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const exp = require("constants");
const connectDB = require("./config/mongoos");
const app = express();
const PORT = process.env.PORT;



connectDB();

app.use(cors());
app.use(express.json());
dotenv;
//setting up chat socket //
const chatServer = require("http").Server(app);
const chatSocket = require("./config/chatSocket").chatSocket(chatServer);

app.use("/uploads", express.static(__dirname + "/uploads"));


chatServer.listen(4000, (err) => {
  if (err) {
    ("error in listening chat server");
  } else {
    console.log("chat server is running successfully on port : 4000");
  }
});



//api for authentication  //
app.use("/api/auth", require("./routes/auth"));
//api for chat //
app.use("/api/chat", require("./routes/chat"));

// ------------------------Deployment---------------

const __dirname1 = path.resolve();
 

app.use(express.static(path.join(__dirname1,'frontend_build')))

app.get('*',(req,res)=>{
  res.sendFile(path.resolve(__dirname1,"frontend_build","index.html"))
});





//------------------------Deployment-----------

app.listen(PORT, function (err) {
  if (err) {
    console.log("error in running server", PORT);
  } else {
    console.log("server is running succefully on port:", PORT);
  }
});
