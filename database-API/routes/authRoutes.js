const { Router } = require('express')
const router = Router()

// get user controller functions
const {
  addUser,
  authenticateUser,
} = require('../controllers/userController')

router.post('/signup', addUser)

router.post('/login', authenticateUser)

module.exports = router