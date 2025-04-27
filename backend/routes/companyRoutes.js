const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../services/cacheService');

// Cache durations in seconds
const CACHE_SHORT = 60; // 1 minute
const CACHE_MEDIUM = 300; // 5 minutes
const CACHE_LONG = 3600; // 1 hour

// Company CRUD routes
router.get('/', protect, cacheMiddleware(CACHE_MEDIUM), companyController.getAllCompanies);
router.get('/:id', protect, cacheMiddleware(CACHE_SHORT), companyController.getCompanyById);
router.post('/', protect, companyController.createCompany);
router.put('/:id', protect, companyController.updateCompany);
router.delete('/:id', protect, companyController.deleteCompany);

// Company notes routes
router.get('/:id/notes', protect, cacheMiddleware(CACHE_SHORT), companyController.getCompanyNotes);
router.post('/:id/notes', protect, companyController.createCompanyNote);

// Company files routes
router.get('/:id/files', protect, cacheMiddleware(CACHE_MEDIUM), companyController.getCompanyFiles);

// Company messages (internal chat) routes
router.get('/:id/messages', protect, cacheMiddleware(CACHE_SHORT), companyController.getCompanyMessages);
router.post('/:id/messages', protect, companyController.createCompanyMessage);
router.post('/:id/messages/read', protect, companyController.markCompanyMessagesAsRead);

module.exports = router;
