const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { getMessages } = require('../controllers/messagecontroller');

router.get('/:conversationId', authMiddleware, getMessages);

module.exports = router;