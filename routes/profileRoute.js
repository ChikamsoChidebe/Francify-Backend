const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../model/user'); // Adjust path as needed
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate user by token
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// PUT /profile - update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash'); // Exclude passwordHash from returned data

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

module.exports = router;
