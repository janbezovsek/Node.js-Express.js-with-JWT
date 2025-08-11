const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { registerUser, authUser } = require('../controllers/authController')
const { authenticateToken, protect } = require("../middleware/authMiddleware")

// Validation rules
const validateRegister = [
  body('username').isLength({ min: 3 }).trim().withMessage('Username must be at least 3 characters'),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const validateLogin = [
  body('email').isEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]


//API endpoint for registering a new user
router.route('/register').post(validateRegister, registerUser)
//API endpoint for login
router.route('/login').post(validateLogin , authUser)
//API for loged in users
router.route('/protected').get(authenticateToken, protect)

module.exports = router