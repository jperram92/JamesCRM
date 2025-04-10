const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const dealController = require('../controllers/deals');
const { validateRequest } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

// Get all deals
router.get('/', authenticate, dealController.getAllDeals);

// Get deal by ID
router.get('/:id', authenticate, dealController.getDealById);

// Create deal
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Deal title is required'),
    body('description').optional(),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('stage').notEmpty().withMessage('Deal stage is required'),
    body('close_date').optional().isISO8601().withMessage('Valid date is required'),
    body('probability').optional().isInt({ min: 0, max: 100 }).withMessage('Probability must be between 0 and 100'),
    body('company_id').notEmpty().isInt().withMessage('Valid company ID is required'),
    body('contact_id').optional().isInt().withMessage('Valid contact ID is required'),
  ],
  validateRequest,
  dealController.createDeal
);

// Update deal
router.put(
  '/:id',
  authenticate,
  [
    body('title').optional().notEmpty().withMessage('Deal title cannot be empty'),
    body('description').optional(),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('stage').optional().notEmpty().withMessage('Deal stage cannot be empty'),
    body('close_date').optional().isISO8601().withMessage('Valid date is required'),
    body('probability').optional().isInt({ min: 0, max: 100 }).withMessage('Probability must be between 0 and 100'),
    body('company_id').optional().isInt().withMessage('Valid company ID is required'),
    body('contact_id').optional().isInt().withMessage('Valid contact ID is required'),
  ],
  validateRequest,
  dealController.updateDeal
);

// Delete deal
router.delete('/:id', authenticate, dealController.deleteDeal);

// Get deal activities
router.get('/:id/activities', authenticate, dealController.getDealActivities);

module.exports = router;
