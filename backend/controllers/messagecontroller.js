// controllers/messagecontroller.js
const Message = require('../models/message');
const Conversation = require('../models/conversation');

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': userId,
    });

    if (!conversation) {
      return res.status(403).json({ message: "Not authorized to access this conversation" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 'asc' })
      .populate('sender', 'username avatarUrl');

    res.json(messages);
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getMessages };
