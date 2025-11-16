const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { getConversations, createConversation } = require('../controllers/conversationController');

router.get('/', authMiddleware, getConversations);
router.post('/', authMiddleware, createConversation);

module.exports = router;
