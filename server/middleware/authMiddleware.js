const authService = require('../services/authService');
const { COOKIE_NAME } = require('../config/constants');

/**
 * Middleware to verify JWT cookie and attach user to request object
 */
module.exports = (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // Attach decoded user info to the request for the next handler to use
  req.user = decoded;
  next();
};
