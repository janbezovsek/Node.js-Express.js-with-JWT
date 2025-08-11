const express = require('express')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const helmet = require('helmet')
const mongoSanitizer = require('express-mongo-sanitize')
const {  errorHandler } = require('./middleware/errorMiddleware')
const authRouter = require("./routes/authRoutes")
const winston = require('winston')
const app = express()

app.use(cors())

//Setting HTTP security headers
app.use(helmet())

//Prevent DoS Attacks via body limiting
app.use(express.json({limit: "50kb"}))

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// Log all incoming requests
app.use((req, res, next) => {
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
logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
})
console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
})

  // Log responses
const originalSend = res.send;
res.send = function (body) {
    logger.info('Response sent', {
    status: res.statusCode,
    path: req.path,
    body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    console.log('Response sent:', {
    status: res.statusCode,
    path: req.path,
    body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    return originalSend.call(this, body)
}
next()
})

//Rate limiter, preventing Brute Force and DoS Attacks
const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 60 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 60 minutes).
	message: "Too many requests, please try later"
})

app.get('/',(req, res) => {
res.send('backend is alive')
})

//It's used for all routes in this case
app.use("/api", limiter)

//Prevent NoSQL query injections via data sanitization
//app.use(mongoSanitizer())

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    )
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    )
    next()
})

//Routes
app.use("/api/v1", authRouter)

//error handlers
app.use(errorHandler)

// Catch-all route for unmatched requests
app.use((req, res, next) => {
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
logger.info('Unmatched route', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
})
    console.log('Unmatched route:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
})
res.status(404).json({ error: { message: 'Route not found' } });
})

// Error handling middleware
app.use((error, req, res, next) => {
const status = error.status || 500
const message = error.message || 'Internal server error'
const response = { error: { message } }

if (process.env.NODE_ENV !== 'production' && error.details) {
    response.error.details = error.details
}

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
logger.error('API error', {
    status,
    message,
    path: req.path,
    method: req.method,
})

res.status(status).json(response)
})




module.exports = app