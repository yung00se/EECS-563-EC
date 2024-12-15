const { Router } = require('express')
const router = Router()

// get user controller functions
const { addChat, getChatHistory } = require('../controllers/chatController')

router.post('/chat-history', getChatHistory)

router.put('/send', addChat)

module.exports = router