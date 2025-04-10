const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getContactNotes,
  createContactNote,
  getContactMessages,
  createContactMessage,
  markContactMessagesAsRead,
  getContactsByCompany
} = require('../controllers/contactController');

// @route   GET /api/contacts
// @desc    Get all contacts
// @access  Private
router.get('/', protect, getAllContacts);

// @route   GET /api/contacts/company/:companyId
// @desc    Get contacts by company
// @access  Private
router.get('/company/:companyId', protect, getContactsByCompany);

// @route   GET /api/contacts/:id
// @desc    Get contact by ID
// @access  Private
router.get('/:id', protect, getContactById);

// @route   POST /api/contacts
// @desc    Create contact
// @access  Private
router.post('/', protect, createContact);

// @route   PUT /api/contacts/:id
// @desc    Update contact
// @access  Private
router.put('/:id', protect, updateContact);

// @route   DELETE /api/contacts/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', protect, deleteContact);

// @route   GET /api/contacts/:id/notes
// @desc    Get contact notes
// @access  Private
router.get('/:id/notes', protect, getContactNotes);

// @route   POST /api/contacts/:id/notes
// @desc    Create contact note
// @access  Private
router.post('/:id/notes', protect, createContactNote);

// @route   GET /api/contacts/:id/messages
// @desc    Get contact messages
// @access  Private
router.get('/:id/messages', protect, getContactMessages);

// @route   POST /api/contacts/:id/messages
// @desc    Create contact message
// @access  Private
router.post('/:id/messages', protect, createContactMessage);

// @route   POST /api/contacts/:id/messages/read
// @desc    Mark contact messages as read
// @access  Private
router.post('/:id/messages/read', protect, markContactMessagesAsRead);

module.exports = router;
