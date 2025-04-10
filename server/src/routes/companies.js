const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const companyController = require('../controllers/companies');
const { validateRequest } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

// Get all companies
router.get('/', authenticate, companyController.getAllCompanies);

// Get company by ID
router.get('/:id', authenticate, companyController.getCompanyById);

// Create company
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().withMessage('Company name is required'),
    body('industry').optional(),
    body('website').optional().isURL().withMessage('Valid website URL is required'),
    body('phone').optional(),
    body('address').optional(),
    body('city').optional(),
    body('state').optional(),
    body('zip_code').optional(),
    body('country').optional(),
    body('notes').optional(),
  ],
  validateRequest,
  companyController.createCompany
);

// Update company
router.put(
  '/:id',
  authenticate,
  [
    body('name').optional().notEmpty().withMessage('Company name cannot be empty'),
    body('industry').optional(),
    body('website').optional().isURL().withMessage('Valid website URL is required'),
    body('phone').optional(),
    body('address').optional(),
    body('city').optional(),
    body('state').optional(),
    body('zip_code').optional(),
    body('country').optional(),
    body('notes').optional(),
  ],
  validateRequest,
  companyController.updateCompany
);

// Delete company
router.delete('/:id', authenticate, companyController.deleteCompany);

// Get company contacts
router.get('/:id/contacts', authenticate, companyController.getCompanyContacts);

// Get company deals
router.get('/:id/deals', authenticate, companyController.getCompanyDeals);

// Get company activities
router.get('/:id/activities', authenticate, companyController.getCompanyActivities);

module.exports = router;
