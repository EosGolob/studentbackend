const mongoose = require('mongoose');


const MessageSchema = new mongoose.Schema({
    sender: String,
    content: String,
    timestamp: Date,
  });
  const Message = mongoose.model('Message', MessageSchema);