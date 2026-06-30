const bcrypt = require('bcryptjs');
const authService = require('../services/authService');
const users = require('../models/userStore');
const { COOKIE_NAME, COOKIE_MAX_AGE } = require('../config/constants');

/**
 * --- REAL SIGNUP ---
 * Hashes the password and saves the user.
 */
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // 3. Hash the password (Security Best Practice)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save to our "database"
    const newUser = { email, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: 'Error during signup' });
  }
};

/**
 * --- REAL LOGIN ---
 * Verifies email and compares hashed passwords.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // 2. Compare Passwords (Bcrypt verifies the hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // 3. Generate Token
    const token = authService.generateToken({ email: user.email });

    // 4. Set Cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE
    });

    res.json({ message: 'Login successful', user: email.split('@')[0] });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Error during login' });
  }
};

exports.getMe = (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  res.json({ user: req.user.email.split('@')[0] });
};

exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: 'Logged out successfully' });
};
