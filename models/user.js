const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  avtar: {
    type: String,
    default: "https://aui.atlassian.com/aui/8.8/docs/images/avatar-person.svg",
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
});

const user = mongoose.model("user", userSchema);

module.exports = user;
