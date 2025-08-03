const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/protected', authController.authenticateToken, authController.protect)

module.exports = router