const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { createAuthEndpointRateLimiter } = require('../middleware/rateLimiter');

// Apply stricter rate limiting to authentication endpoints
const authRateLimiter = createAuthEndpointRateLimiter();

// Public routes
router.post('/login', authRateLimiter, authController.login);
router.post('/complete-registration', authRateLimiter, authController.completeRegistration);
router.get('/validate-invitation', authController.validateInvitationToken);

module.exports = router;
