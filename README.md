# Chatting Application 💬

A full-stack, real-time chatting application built with modern technologies for connecting people worldwide. This application enables users to communicate seamlessly with real-time message delivery, read receipts, and conversation management.

**Live Demo:** [https://chatting-application-olive.vercel.app](https://chatting-application-olive.vercel.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Socket.IO Events](#socketio-events)
- [Database Schema](#database-schema)
- [Contributing](#contributing)

---

## 🎯 Overview

This chatting application provides a comprehensive solution for real-time communication between users. It combines a **Node.js/Express backend** with a **React frontend** to deliver a smooth, interactive messaging experience. The application uses **WebSocket** (Socket.IO) for real-time message delivery and **MongoDB** for persistent data storage.

### Key Objectives:
- ✅ Enable real-time messaging between users
- ✅ Support conversation management and history
- ✅ Implement message delivery and read status tracking
- ✅ Provide user authentication and profile management
- ✅ Create a responsive, intuitive user interface

---

## ✨ Features

### User Management
- User registration and authentication with JWT tokens
- Secure password encryption using bcrypt
- User profile management
- Email verification and notifications

### Messaging
- Real-time message sending and receiving
- Message delivery status tracking
- Read receipts (seen/delivered status)
- Support for different message types (text, attachments, etc.)
- Emoji support in messages

### Conversations
- Create and manage conversations
- View conversation history
- Last message preview
- Participant management

### UI/UX
- Clean, modern interface with Tailwind CSS
- Responsive design for mobile and desktop
- Real-time updates without page refresh
- Emoji picker for enhanced communication
- Smooth animations with Framer Motion

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js (v5.1.0)
- **Database:** MongoDB with Mongoose (v8.19.2)
- **Real-time:** Socket.IO (v4.8.1)
- **Authentication:** JWT (jsonwebtoken v9.0.2)
- **Security:** bcrypt (v6.0.0)
- **Email:** Nodemailer (v7.0.10), Resend (v6.4.2), Twilio (v5.10.5)
- **CORS:** Enabled for cross-origin requests
- **Environment:** dotenv (v17.2.3)

### Frontend
- **Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.7
- **Routing:** React Router DOM v7.9.5
- **HTTP Client:** Axios (v1.13.1)
- **Real-time:** Socket.IO Client (v4.8.1)
- **Styling:** Tailwind CSS (v4.1.16)
- **Animations:** Framer Motion (v12.23.24)
- **UI Components:** Headless UI
- **Extras:** Emoji Picker React (v4.15.1)

---

## 🏗 Architecture

The application follows a **client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  - User Interface Components                                │
│  - State Management                                         │
│  - Socket.IO Client Events                                  │
│  - API Requests (Axios)                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────┴─────────┐
                    │                │
         ┌──────────▼────────┐  ┌────▼──────────┐
         │   HTTP/REST API   │  │  WebSocket    │
         │   (REST Routes)   │  │ (Socket.IO)   │
         │                   │  │               │
         └──────────────────┬┘  └────────┬──────┘
                           │            │
         ┌─────────────────┴────────────┴──────────────┐
         │                                             │
         │         BACKEND (Node.js/Express)          │
         │                                             │
         │  ┌───────────────────────────────────┐    │
         │  │      Routes & Controllers         │    │
         │  │  - Auth Routes                    │    │
         │  │  - User Routes                    │    │
         │  │  - Conversation Routes            │    │
         │  │  - Message Routes                 │    │
         │  └───────────────────────────────────┘    │
         │                                             │
         │  ┌───────────────────────────────────┐    │
         │  │      Socket.IO Server             │    │
         │  │  - Real-time Events Handling      │    │
         │  │  - Message Broadcasting           │    │
         │  │  - Status Updates                 │    │
         │  └───────────────────────────────────┘    │
         │                                             │
         │  ┌───────────────────────────────────┐    │
         │  │      Middlewares                  │    │
         │  │  - Authentication                 │    │
         │  │  - Error Handling                 │    │
         │  │  - Request Validation             │    │
         │  └───────────────────────────────────┘    │
         │                                             │
         │  ┌───────────────────────────────────┐    │
         │  │      Models/Schemas               │    │
         │  │  - User Model                     │    │
         │  │  - Conversation Model             │    │
         │  │  - Message Model                  │    │
         │  └───────────────────────────────────┘    │
         │                                             │
         └───────────────────┬───────────────────────┘
                             │
                ┌────────────┴─────────────┐
                │                          │
        ┌───────▼────────┐      ┌──────────▼─────┐
        │    MongoDB     │      │  External APIs │
        │    Database    │      │  (Email, SMS)  │
        └────────────────┘      └────────────────┘
```

### Architectural Layers:

1. **Presentation Layer (Frontend)**
   - React components for user interface
   - State management for application state
   - Socket.IO client for real-time events

2. **API Layer (Backend)**
   - Express routes for HTTP requests
   - RESTful endpoints for CRUD operations
   - Request validation and error handling

3. **Business Logic Layer**
   - Controllers handling business logic
   - Services for reusable operations
   - Socket.IO events for real-time communication

4. **Data Access Layer**
   - Mongoose models and schemas
   - Database queries and operations
   - Data validation at schema level

5. **Data Storage Layer**
   - MongoDB for persistent data
   - Collections for users, conversations, and messages

---

## 📊 Data Flow

### 1. **User Registration/Authentication Flow**

```
User Input (Frontend)
    ↓
POST /api/auth/register
    ↓
Validation & Password Hash (bcrypt)
    ↓
Create User in MongoDB
    ↓
Generate JWT Token
    ↓
Return Token to Frontend
    ↓
Store Token (localStorage/sessionStorage)
    ↓
User Authenticated ✓
```

### 2. **Message Sending Flow (Real-time)**

```
User Types Message (Frontend)
    ↓
Click Send
    ↓
emit('sendMessage', messageData) → Socket.IO
    ↓
Backend receives event
    ↓
Validate Message Data
    ↓
Normalize Content (handle objects/strings)
    ↓
Create Message Document (Status: 'delivered')
    ↓
Save to MongoDB
    ↓
Update Conversation (lastMessage, lastMessageAt)
    ↓
Populate Sender Information
    ↓
Broadcast to Room: emit('receiveMessage', populatedMessage)
    ↓
Emit to Conversation Participants
    ↓
Frontend Updates Message List (Real-time)
```

### 3. **Message Status Flow (Delivery & Read Receipts)**

```
┌─── Message Created (Status: 'delivered') ───┐
│                                              │
│  Saved in DB                                 │
│  Broadcasted to Conversation Room            │
│                                              │
│  Frontend shows: ✓ (Single tick)            │
└──────────────────────────────────────────────┘

                    ↓

User Opens Conversation (Focus)
    ↓
emit('markSeen', { conversationId, userId })
    ↓
Backend Query: Find unseen messages from other sender
    ↓
Update All Unseen Messages (Status: 'seen')
    ↓
For Each Message → emit('messageSeen', messageId)
    ↓
Frontend Updates: ✓✓ (Double tick - seen)
```

### 4. **Conversation Management Flow**

```
Create New Conversation (Frontend)
    ↓
POST /api/conversations/create
    ↓
Validate Participants
    ↓
Create Conversation Document in MongoDB
    ↓
emit('notifyNewConversation', newConversation)
    ↓
Backend identifies target participant
    ↓
emit('newConversation', newConversation) to their room
    ↓
Target User Receives Notification (Real-time)
    ↓
Both Users See Conversation ✓
```

### 5. **Profile Management Flow**

```
User Updates Profile (Frontend)
    ↓
GET/PUT /api/users/profile
    ↓
Authenticate with JWT Token
    ↓
Validate and Update User Document
    ↓
Return Updated Profile
    ↓
Frontend Reflects Changes
```

---

## 📁 Project Structure

```
chatting-application/
├── backend/                          # Node.js/Express Server
│   ├── controllers/                  # Request handlers
│   ├── models/                       # Mongoose schemas
│   │   ├── User
│   │   ├── Conversation
│   │   └── Message
│   ├── routes/                       # API endpoints
│   │   ├── auth.js                   # Authentication routes
│   │   ├── userRoute.js              # User profile routes
│   │   ├── conversation.js           # Conversation routes
│   │   └── message.js                # Message routes
│   ├── middlewares/                  # Express middlewares
│   ├── services/                     # Reusable business logic
│   ├── connection.js                 # MongoDB connection
│   ├── index.js                      # Server entry point
│   ├── package.json                  # Dependencies
│   └── .env                          # Environment variables (not committed)
│
├── frontend/                         # React Application
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── pages/                    # Page components
│   │   ├── App.jsx                   # Main App component
│   │   └── main.jsx                  # Entry point
│   ├── public/                       # Static assets
│   ├── index.html                    # HTML template
│   ├── package.json                  # Dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   └── eslint.config.js              # ESLint configuration
│
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file with required variables:**
   ```env
   PORT=8000
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/chatting-app
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   
   # Optional: Email/SMS services
   RESEND_API_KEY=your_resend_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` (if needed):**
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_SOCKET_URL=http://localhost:8000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Run Both Simultaneously
From root directory:
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## 📡 API Documentation

### Authentication Routes
```
POST /api/auth/register          - Register new user
POST /api/auth/login             - Login user
POST /api/auth/logout            - Logout user
POST /api/auth/refresh-token     - Refresh JWT token
```

### User Routes
```
GET  /api/users/profile          - Get user profile
PUT  /api/users/profile          - Update user profile
GET  /api/users/:userId          - Get specific user info
```

### Conversation Routes
```
GET  /api/conversations          - Get all conversations
POST /api/conversations/create   - Create new conversation
GET  /api/conversations/:id      - Get conversation details
PUT  /api/conversations/:id      - Update conversation
DELETE /api/conversations/:id    - Delete conversation
```

### Message Routes
```
GET  /api/messages/:conversationId    - Get messages in conversation
POST /api/messages/send               - Send message
PUT  /api/messages/:id/mark-seen      - Mark message as seen
DELETE /api/messages/:id              - Delete message
```

---

## 🔌 Socket.IO Events

### Client → Server Events:
```javascript
// Join user's personal room
emit('connect', { userId })

// Join conversation room
emit('joinRoom', conversationId)

// Send message
emit('sendMessage', {
  conversationId: string,
  sender: userId,
  content: string,
  type: 'text' | 'image' | 'file'
})

// Mark messages as seen
emit('markSeen', {
  conversationId: string,
  userId: string
})

// Notify new conversation
emit('notifyNewConversation', newConversation)
```

### Server → Client Events:
```javascript
// Receive new message
on('receiveMessage', message)

// Message marked as seen
on('messageSeen', messageId)

// New conversation notification
on('newConversation', conversation)

// User connection status
on('userOnline', userId)
on('userOffline', userId)
```

---

## 💾 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  avatarUrl: String,
  bio: String,
  isOnline: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Model
```javascript
{
  _id: ObjectId,
  participants: [{
    user: ObjectId (ref: User),
    joinedAt: Date
  }],
  lastMessage: String,
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  conversation: ObjectId (ref: Conversation),
  sender: ObjectId (ref: User),
  content: String,
  type: String (text, image, file),
  status: String (delivered, seen, failed),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📦 Building for Production

### Backend Production Build:
```bash
cd backend
npm start
# Uses production environment from .env
```

### Frontend Production Build:
```bash
cd frontend
npm run build
# Creates optimized build in dist/
npm run preview
# Preview production build locally
```

### Deploy to Vercel (Frontend):
```bash
# Frontend is already configured for Vercel
# See frontend/vercel.json
```

---

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Ensure backend is running on correct port
- Check CORS configuration in backend
- Verify Socket.IO client URL in frontend

### MongoDB Connection Errors
- Verify `MONGODB_URL` in `.env`
- Check MongoDB Atlas network access settings
- Ensure database user credentials are correct

### JWT Authentication Issues
- Clear browser localStorage
- Check `JWT_SECRET` is set in `.env`
- Verify token expiration time

### Real-time Message Not Appearing
- Check browser console for Socket.IO errors
- Verify user is in correct conversation room
- Check backend logs for message save errors

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Manan Agarwal**
- GitHub: [@mananagarwal417](https://github.com/mananagarwal417)
- Repository: [chatting-application](https://github.com/mananagarwal417/chatting-application)

---

## 🔗 Links

- **Live Demo:** [https://chatting-application-olive.vercel.app](https://chatting-application-olive.vercel.app)
- **Repository:** [https://github.com/mananagarwal417/chatting-application](https://github.com/mananagarwal417/chatting-application)

---

## 📞 Support

For support, open an issue on the GitHub repository or reach out to the author.

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Status:** Active Development ✨
