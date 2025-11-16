// controllers/conversationController.js
const Conversation = require('../models/conversation');

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      'participants.user': userId
    })
    .sort({ lastMessageAt: -1 })
    .populate('participants.user', 'username avatarUrl email');

    res.json(conversations);
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: "targetUserId is required" });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    // Check if conversation already exists
    let existing = await Conversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { user: userId } },
          { $elemMatch: { user: targetUserId } }
        ]
      }
    }).populate('participants.user', 'username avatarUrl');

    if (existing) {
      return res.json(existing);
    }

    // Create new conversation
    const convo = await Conversation.create({
      participants: [
        { user: userId },
        { user: targetUserId }
      ],
      lastMessage: "",
      lastMessageAt: new Date()
    });

    const newConvo = await Conversation.findById(convo._id)
      .populate('participants.user', 'username avatarUrl');

    res.status(201).json(newConvo);

  } catch (err) {
    console.error("createConversation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getConversations, createConversation };