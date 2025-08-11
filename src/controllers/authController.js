const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator')
const User = require('../models/userModel')
const winston = require('winston')

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
    new winston.transports.Console(),
  ],
})

//token generate
const generateToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET, {
        expiresIn: "30d",
    })
}

//controller for register 
const registerUser = asyncHandler(async (req,res)=>{

//destructuring this variables from User model
const { username, email, password, confirmPassword } = req.body


if(!username || !email || !password || !confirmPassword) {
  res.status(400)
  throw new Error("Please enter all of the fields")
}

const errors = validationResult(req);

if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

//email must be unique
const userExists = await User.findOne({email})

if(userExists) {
  res.status(400)
  throw new Error("User already exists")
}

//if user doesnt exist we create a new user
const user = await User.create({
      username,
      email,
      password,
})

if(user){
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
     // token: generateToken(user._id),
})
} else {
res.status(400)
throw new Error("Failed to create the user")
}
})

//controller for login
const authUser = asyncHandler(async (req,res) => {

const { email, password } = req.body

const errors = validationResult(req);

if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

if(!email || !password ) {
  res.status(400)
  throw new Error("Please enter all of the fields")
}

const user = await User.findOne({email})

//user must exist and password must match
if(user.password && (await user.matchPassword(password))) {
  res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
      })
} else {
  res.status(401)
    throw new Error("Invalid email or password")
}
})

module.exports={registerUser, authUser}