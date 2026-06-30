const jwt = require('jsonwebtoken');
const { SECRET_KEY, JWT_EXPIRES_IN } = require('../config/constants');

/**
 * Service to handle JWT operations
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: JWT_EXPIRES_IN });
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};
