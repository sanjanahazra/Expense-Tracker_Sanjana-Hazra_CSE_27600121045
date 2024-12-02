// routes/protected.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(403).json({ message: 'Access denied, no token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Protected route to access user data (example)
router.get('/protected', authenticateJWT, (req, res) => {
  // Here, you can fetch the user from the database or return some protected data
  res.json({ message: 'This is protected content', user: req.user });
});

module.exports = router;
