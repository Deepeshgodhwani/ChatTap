const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/chat-app");
const db = mongoose.connection;
db.once("open", function (error) {
  if (error) {
    console.log("error in setting up mongodb", error);
  } else {
    console.log("database is connected");
  }
});
