const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'system'],
    default: 'text',
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent',
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
