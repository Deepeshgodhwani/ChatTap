const mongoose = require("mongoose");

const chatBoxSchema = mongoose.Schema(
  {
    chatname: {
      type: String,
      trim: true,
    },
    isGroupChat: { type: Boolean, default: false },
    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        unseenMsg: {
          type: Number,
          default: 0,
        },
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    },
    profilePic: {
      type: String,
      default:
        "https://cdn6.aptoide.com/imgs/1/2/2/1221bc0bdd2354b42b293317ff2adbcf_icon.png",
    },
  },
  {
    timestamps: true,
  }
);

const chatBox = mongoose.model("chat", chatBoxSchema);
module.exports = chatBox;
