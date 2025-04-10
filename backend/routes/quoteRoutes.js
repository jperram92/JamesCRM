const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generatePdf,
  sendSignatureRequest,
  verifySignatureToken,
  processSignature
} = require('../controllers/quoteController');

// @route   POST /api/quotes/:id/generate-pdf
// @desc    Generate PDF for a deal
// @access  Private
router.post('/:id/generate-pdf', protect, generatePdf);

// @route   POST /api/quotes/:id/send-signature
// @desc    Send signature request
// @access  Private
router.post('/:id/send-signature', protect, sendSignatureRequest);

// @route   GET /api/quotes/verify-signature/:token
// @desc    Verify signature token
// @access  Public
router.get('/verify-signature/:token', verifySignatureToken);

// @route   POST /api/quotes/process-signature/:token
// @desc    Process signature
// @access  Public
router.post('/process-signature/:token', processSignature);

module.exports = router;
