const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/login', authController.login);
router.post('/complete-registration', authController.completeRegistration);
router.get('/validate-invitation', authController.validateInvitationToken);

module.exports = router;
