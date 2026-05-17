const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

  room: String,

  sender: {
    type: String
  },

  text: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Message", messageSchema);