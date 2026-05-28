const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// GET /api/user/profile — any authenticated user
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user/all — admin only
router.get('/all', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/user/:id — admin only
router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
