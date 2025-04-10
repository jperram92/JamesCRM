const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

// Company CRUD routes
router.get('/', protect, companyController.getAllCompanies);
router.get('/:id', protect, companyController.getCompanyById);
router.post('/', protect, companyController.createCompany);
router.put('/:id', protect, companyController.updateCompany);
router.delete('/:id', protect, companyController.deleteCompany);

// Company notes routes
router.get('/:id/notes', protect, companyController.getCompanyNotes);
router.post('/:id/notes', protect, companyController.createCompanyNote);

// Company files routes
router.get('/:id/files', protect, companyController.getCompanyFiles);

// Company messages (internal chat) routes
router.get('/:id/messages', protect, companyController.getCompanyMessages);
router.post('/:id/messages', protect, companyController.createCompanyMessage);
router.post('/:id/messages/read', protect, companyController.markCompanyMessagesAsRead);

module.exports = router;
