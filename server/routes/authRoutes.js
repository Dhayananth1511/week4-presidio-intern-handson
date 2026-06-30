const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { signupSchema, loginSchema } = require('../validators/authValidator');

// Public Routes
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected Routes (Uses Middleware)
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
