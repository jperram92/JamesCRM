const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const activityController = require('../controllers/activities');
const { validateRequest } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

// Get all activities
router.get('/', authenticate, activityController.getAllActivities);

// Get activity by ID
router.get('/:id', authenticate, activityController.getActivityById);

// Create activity
router.post(
  '/',
  authenticate,
  [
    body('type').notEmpty().withMessage('Activity type is required'),
    body('subject').notEmpty().withMessage('Activity subject is required'),
    body('description').optional(),
    body('due_date').optional().isISO8601().withMessage('Valid date is required'),
    body('contact_id').optional().isInt().withMessage('Valid contact ID is required'),
    body('company_id').optional().isInt().withMessage('Valid company ID is required'),
    body('deal_id').optional().isInt().withMessage('Valid deal ID is required'),
    body('assigned_to').optional().isInt().withMessage('Valid user ID is required'),
  ],
  validateRequest,
  activityController.createActivity
);

// Update activity
router.put(
  '/:id',
  authenticate,
  [
    body('type').optional().notEmpty().withMessage('Activity type cannot be empty'),
    body('subject').optional().notEmpty().withMessage('Activity subject cannot be empty'),
    body('description').optional(),
    body('due_date').optional().isISO8601().withMessage('Valid date is required'),
    body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
    body('completed_at').optional().isISO8601().withMessage('Valid date is required'),
    body('contact_id').optional().isInt().withMessage('Valid contact ID is required'),
    body('company_id').optional().isInt().withMessage('Valid company ID is required'),
    body('deal_id').optional().isInt().withMessage('Valid deal ID is required'),
    body('assigned_to').optional().isInt().withMessage('Valid user ID is required'),
  ],
  validateRequest,
  activityController.updateActivity
);

// Delete activity
router.delete('/:id', authenticate, activityController.deleteActivity);

// Mark activity as completed
router.post(
  '/:id/complete',
  authenticate,
  activityController.completeActivity
);

module.exports = router;
