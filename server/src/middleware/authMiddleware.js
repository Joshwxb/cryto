const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in the headers (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get token from header
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Get user from the token and attach to the request
      req.user = await User.findById(decoded.id).select('-password');

      // CRITICAL: use 'return' to stop execution after calling next
      return next(); 
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      // Use return to ensure only one response is sent
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // 5. If no token was found at all
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };