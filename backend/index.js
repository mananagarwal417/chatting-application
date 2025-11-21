// index.js (server entry)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectToDatabase = require('./connection');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

connectToDatabase(process.env.MONGODB_URL);

app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth'); // login/register
const userRoutes = require('./routes/userRoute'); // profile
const conversationRouter = require('./routes/conversation');
const messageRouter = require('./routes/message');

app.use('/api/auth', authRoutes);       // optional: keep auth under /api/auth or /api/users/login depending on prior usage
app.use('/api/users', userRoutes);      // profile: GET /api/users/profile
app.use('/api/conversations', conversationRouter);
app.use('/api/messages', messageRouter);

// If you previously used app.use('/api/users', Router) for auth,
// keep same prefix or adjust front-end accordingly. The Dashboard was calling /api/users/profile,
// so we provide /api/users/profile now.

// Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const Message = require('./models/message');
const Conversation = require('./models/conversation');

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  const userId = socket.handshake.query?.userId;
  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room.`);
  }

  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined room ${conversationId}`);
  });

  socket.on('sendMessage', async (messageData) => {
  try {
    // --- Normalize content so it is ALWAYS a clean JSON string if encrypted ---
    const normalizeContent = (input) => {
      if (typeof input === 'object' && input !== null) {
        // If object → stringify once
        return JSON.stringify(input);
      }

      if (typeof input === 'string') {
        let s = input.trim();

        // If string is double-quoted → unescape once
        if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
          try {
            s = JSON.parse(s);
          } catch {
            // ignore
          }
        }

        if (typeof s === 'object' && s !== null) {
          return JSON.stringify(s);
        }

        return String(s);
      }

      return String(input);
    };

    const cleanContent = normalizeContent(messageData.content);

    // --- Save message in DB ---
    const newMessage = new Message({
      conversation: messageData.conversationId,
      sender: messageData.sender,
      content: cleanContent,
      type: messageData.type || 'text',
    });

    const savedMessage = await newMessage.save();

    await Conversation.findByIdAndUpdate(messageData.conversationId, {
      lastMessage: savedMessage.content,
      lastMessageAt: savedMessage.createdAt,
    });

    // --- Populate sender ---
    const populatedMessage = await savedMessage.populate('sender', '_id username avatarUrl');

    // --- Emit to room ---
    io.to(messageData.conversationId).emit('receiveMessage', populatedMessage);

  } catch (error) {
    console.error("Error handling message:", error);
  }
});


  socket.on('notifyNewConversation', (newConvo) => {
    const targetParticipant = newConvo.participants.find(p => p.user._id !== newConvo.creatorId);
    if (targetParticipant) {
      io.to(targetParticipant.user._id).emit('newConversation', newConvo);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
