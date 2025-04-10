const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contacts');
const { validateRequest } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

// Get all contacts
router.get('/', authenticate, contactController.getAllContacts);

// Get contact by ID
router.get('/:id', authenticate, contactController.getContactById);

// Create contact
router.post(
  '/',
  authenticate,
  [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional(),
    body('job_title').optional(),
    body('company_id').optional().isInt().withMessage('Valid company ID is required'),
    body('address').optional(),
    body('city').optional(),
    body('state').optional(),
    body('zip_code').optional(),
    body('country').optional(),
    body('notes').optional(),
  ],
  validateRequest,
  contactController.createContact
);

// Update contact
router.put(
  '/:id',
  authenticate,
  [
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional(),
    body('job_title').optional(),
    body('company_id').optional().isInt().withMessage('Valid company ID is required'),
    body('address').optional(),
    body('city').optional(),
    body('state').optional(),
    body('zip_code').optional(),
    body('country').optional(),
    body('notes').optional(),
  ],
  validateRequest,
  contactController.updateContact
);

// Delete contact
router.delete('/:id', authenticate, contactController.deleteContact);

// Get contact deals
router.get('/:id/deals', authenticate, contactController.getContactDeals);

// Get contact activities
router.get('/:id/activities', authenticate, contactController.getContactActivities);

module.exports = router;
