const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealsByCompany,
  updateDealStatus,
  updateDealSignature,
  updatePdfUrl
} = require('../controllers/dealController');

// @route   GET /api/deals
// @desc    Get all deals
// @access  Private
router.get('/', protect, getAllDeals);

// @route   GET /api/deals/company/:companyId
// @desc    Get deals by company
// @access  Private
router.get('/company/:companyId', protect, getDealsByCompany);

// @route   GET /api/deals/:id
// @desc    Get deal by ID
// @access  Private
router.get('/:id', protect, getDealById);

// @route   POST /api/deals
// @desc    Create deal
// @access  Private
router.post('/', protect, createDeal);

// @route   PUT /api/deals/:id
// @desc    Update deal
// @access  Private
router.put('/:id', protect, updateDeal);

// @route   DELETE /api/deals/:id
// @desc    Delete deal
// @access  Private
router.delete('/:id', protect, deleteDeal);

// @route   PUT /api/deals/:id/status
// @desc    Update deal status
// @access  Private
router.put('/:id/status', protect, updateDealStatus);

// @route   PUT /api/deals/:id/signature
// @desc    Update deal signature
// @access  Private
router.put('/:id/signature', protect, updateDealSignature);

// @route   PUT /api/deals/:id/pdf
// @desc    Update PDF URL
// @access  Private
router.put('/:id/pdf', protect, updatePdfUrl);

module.exports = router;
