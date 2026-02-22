const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Include age + gender in token so the middleware can attach full user info
// without a DB lookup on every request
const signToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, age: user.age, gender: user.gender },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { username, password, age, gender } = req.body;
    if (!username || !password || age === undefined || !gender) {
      return res.status(400).json({ error: 'All fields are required: username, password, age, gender.' });
    }
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: 'Username already taken.' });
    }
    const user = await User.create({ username, password, age: parseInt(age), gender });
    const token = signToken(user);
    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: { id: user.id, username: user.username, age: user.age, gender: user.gender },
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    const token = signToken(user);
    return res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: { id: user.id, username: user.username, age: user.age, gender: user.gender },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /me
router.get('/me', authenticate, (req, res) => {
  return res.status(200).json({ user: req.user });
});

module.exports = router;