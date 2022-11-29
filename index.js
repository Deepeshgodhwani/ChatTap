const express = require("express");
const port = 7000;
const db = require("./config/mongoos");
const cors = require('cors');
const app = express();


app.use(cors());

app.use(express.json());



app.use("/api/auth", require("./routes/auth"));
app.use("/api/chat",require('./routes/chat'));

app.listen(port, function (err) {
  if (err) {
    console.log("error in running server", port);
  } else {
    console.log("server is running succefully on port:", port);
  }
});
