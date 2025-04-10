const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { User } = require('../models');

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Admin routes
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
