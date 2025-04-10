const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/admin');
const { validateRequest } = require('../middleware/validator');
const { authenticate, authorize } = require('../middleware/auth');

// Apply admin authorization to all routes
router.use(authenticate, authorize(['admin']));

// Get all users
router.get('/users', adminController.getAllUsers);

// Create a new user
router.post(
  '/users',
  [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .isIn(['admin', 'manager', 'user'])
      .withMessage('Role must be admin, manager, or user'),
  ],
  validateRequest,
  adminController.createUser
);

// Get user by ID
router.get('/users/:id', adminController.getUserById);

// Update user
router.put(
  '/users/:id',
  [
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('role')
      .optional()
      .isIn(['admin', 'manager', 'user'])
      .withMessage('Role must be admin, manager, or user'),
  ],
  validateRequest,
  adminController.updateUser
);

// Reset user password
router.post(
  '/users/:id/reset-password',
  [
    body('new_password')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  validateRequest,
  adminController.resetPassword
);

// Delete user
router.delete('/users/:id', adminController.deleteUser);

// Invite a new user
router.post(
  '/users/invite',
  [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role')
      .isIn(['admin', 'manager', 'user'])
      .withMessage('Role must be admin, manager, or user'),
  ],
  validateRequest,
  adminController.inviteUser
);

// Get system logs
router.get('/logs', adminController.getSystemLogs);

// Invitation management routes
router.get('/invitations', adminController.getAllInvitations);
router.post('/invitations/:id/resend', adminController.resendInvitation);
router.post('/invitations/:id/revoke', adminController.revokeInvitation);
router.get('/invitations/stats', adminController.getInvitationStats);

module.exports = router;
