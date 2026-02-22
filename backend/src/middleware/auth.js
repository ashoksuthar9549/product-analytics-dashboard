const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT authentication middleware.
 * Decodes the Bearer token and attaches the payload to req.user.
 * Avoids a DB round-trip on every request — the JWT payload already
 * contains id, username, age, and gender signed at login time.
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables!');
      return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET missing.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to req.user — contains id, username, age, gender
    req.user = {
      id:       decoded.id,
      username: decoded.username,
      age:      decoded.age,
      gender:   decoded.gender,
    };

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Authentication failed.' });
  }
};

module.exports = authenticate;
