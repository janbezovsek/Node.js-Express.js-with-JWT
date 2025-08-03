const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const mongoSanitizer = require('express-mongo-sanitize')
const authRouter = require("./routes/authRoutes")
const winston = require('winston')
dotenv.config();
const app = express()

//Setting HTTP security headers
app.use(helmet())

//Prevent DoS Attacks via body limiting
app.use(express.json({limit: "50kb"}))

// Logger setup
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
    new winston.transports.Console(),
  ],
})

//Rate limiter, preventing Brute Force and DoS Attacks
const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 60 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 60 minutes).
	message: "Too many requests, please try later"
})

//It's used for all routes in this case
app.use("/api", limiter)

//Prevent NoSQL query injections via data sanitization
app.use(mongoSanitizer())

//Prevent XSS attacks via data sanitization
app.use(xss())

//Routes
app.use("/api/v1/auth", authRouter)

// Centralized error handling middleware
app.use((error, req, res, next) => {
  const status = error.status || 500
  const message = error.message || 'Internal server error'
  const response = { error: { message } }

  // Include error details only in development
  if (process.env.NODE_ENV !== 'production' && error.details) {
    response.error.details = error.details;
  }

  logger.error('API error', {
    status,
    message,
    path: req.path,
    method: req.method,
  });

  res.status(status).json(response)
})

module.exports = app