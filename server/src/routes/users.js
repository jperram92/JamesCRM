const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/users');
const { validateRequest } = require('../middleware/validator');
const { authenticate, authorize } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);

// Get user by ID
router.get('/:id', authenticate, userController.getUserById);

// Update user
router.put(
  '/:id',
  authenticate,
  [
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
  ],
  validateRequest,
  userController.updateUser
);

// Delete user (admin only)
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);

// Change password
router.post(
  '/change-password',
  authenticate,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  validateRequest,
  userController.changePassword
);

module.exports = router;
