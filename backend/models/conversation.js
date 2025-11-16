const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  title: String,
  type: {
    type: String,
    enum: ['one-to-one', 'group'],
    default: 'one-to-one',
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  participants: [participantSchema],
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
