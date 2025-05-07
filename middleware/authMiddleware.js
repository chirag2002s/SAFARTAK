// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model to find user by ID

// Middleware to protect routes by verifying JWT
const protect = async (req, res, next) => {
  // *** ADDED: Log query parameters upon entering middleware ***
  console.log(`[Protect Middleware] Path: ${req.originalUrl}, Query received:`, req.query);
  // **********************************************************

  let token;

  // 1. Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get token from header (remove 'Bearer ' prefix)
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[Protect Middleware] Token decoded successfully.'); // Log success

      // 4. Get user ID from decoded token payload and attach user to request
      // Ensure decoded.user.id exists
      if (!decoded.user || !decoded.user.id) {
          console.error('[Protect Middleware] Token payload missing user ID.');
          return res.status(401).json({ success: false, message: 'Not authorized, invalid token payload' });
      }
      req.user = await User.findById(decoded.user.id).select('-password');

      // Check if user still exists
      if (!req.user) {
          console.warn(`[Protect Middleware] User not found for ID: ${decoded.user.id}`);
          return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }
      console.log(`[Protect Middleware] User ${req.user._id} attached to request.`);

      // 5. Call next() to pass control to the next middleware or route handler
      next();

    } catch (error) {
      console.error('[Protect Middleware] Token verification failed:', error.message);
      if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ success: false, message: 'Not authorized, token expired' });
      }
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  // If no token is found in the header
  if (!token) {
    console.log('[Protect Middleware] No token found in Authorization header.');
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};


// Middleware for role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    // Assumes 'protect' middleware ran first and attached req.user
    console.log(`[Authorize Middleware] Path: ${req.originalUrl}, Checking role: ${req.user?.role}, Allowed: ${roles.join(', ')}`); // Log role check
    if (!req.user) {
      // This check might be redundant if protect always handles it, but safe to keep
      console.warn('[Authorize Middleware] No user attached to request.');
      return res.status(401).json({ success: false, message: 'Not authorized, user not found or token issue' });
    }

    if (!roles.includes(req.user.role)) {
      // User's role is not in the list of allowed roles
      console.warn(`[Authorize Middleware] Forbidden. User role '${req.user.role}' not in allowed roles [${roles.join(', ')}]`);
      return res.status(403).json({ // 403 Forbidden
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    // Role is authorized
    console.log(`[Authorize Middleware] Role '${req.user.role}' authorized.`);
    next();
  };
};


// Export both middleware functions
module.exports = { protect, authorize };
