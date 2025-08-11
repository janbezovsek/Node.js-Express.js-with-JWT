const jwt = require("jsonwebtoken")

//user must be loged in so this function can verify the token and procced
// Protected route controller (JWT verification)
const protect = (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
}

// Middleware for JWT verification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

if (!token) {
    const error = new Error('Access token required');
    error.status = 401
    return next(error)
}

jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
        const error = new Error('Invalid or expired token')
        error.status = 403;
        return next(error);
    }
    req.user = user
    next()
})
}

module.exports = { protect,authenticateToken }  