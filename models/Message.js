const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: String,
  from: String,
  value: String,
  id: Number,
  roleOfChat: String,
  likes: Number,
  dislikes: Number
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;