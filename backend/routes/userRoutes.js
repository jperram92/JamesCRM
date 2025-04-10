const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes that require authentication and admin privileges
router.get('/', protect, admin, userController.getAllUsers);
router.post('/invite', protect, admin, userController.inviteUser);
router.put('/:id', protect, admin, userController.updateUser);
router.delete('/:id', protect, admin, userController.deleteUser);

module.exports = router;
