const mongoose = require('mongoose');
const Company = require('../models/Company');
const Note = require('../models/Note');
const File = require('../models/File');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
exports.getAllCompanies = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock companies
      const mockCompanies = [
        {
          _id: '1',
          name: 'Acme Inc.',
          industry: 'Technology',
          website: 'https://acme.com',
          phone: '+1 (555) 123-4567',
          email: 'info@acme.com',
          address: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          },
          status: 'Customer',
          createdAt: new Date().toISOString(),
          assignedTo: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          }
        },
        {
          _id: '2',
          name: 'Globex Corporation',
          industry: 'Manufacturing',
          website: 'https://globex.com',
          phone: '+1 (555) 987-6543',
          email: 'info@globex.com',
          address: {
            street: '456 Market St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          status: 'Lead',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: {
            _id: '2',
            firstName: 'John',
            lastName: 'Doe'
          }
        },
        {
          _id: '3',
          name: 'Initech',
          industry: 'Finance',
          website: 'https://initech.com',
          phone: '+1 (555) 456-7890',
          email: 'info@initech.com',
          address: {
            street: '789 Park Ave',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          },
          status: 'Opportunity',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          }
        }
      ];

      return res.json(mockCompanies);
    }

    // Get query parameters for filtering
    const { status, industry, assignedTo, search } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (industry) {
      filter.industry = industry;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.country': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get companies with populated assignedTo field
    const companies = await Company.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Private
exports.getCompanyById = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock company
      const mockCompany = {
        _id: req.params.id,
        name: 'Acme Inc.',
        industry: 'Technology',
        website: 'https://acme.com',
        phone: '+1 (555) 123-4567',
        email: 'info@acme.com',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        },
        description: 'A leading technology company specializing in innovative solutions.',
        size: '51-200',
        type: 'Customer',
        status: 'Active',
        tags: ['tech', 'innovation', 'software'],
        socialMedia: {
          linkedin: 'https://linkedin.com/company/acme',
          twitter: 'https://twitter.com/acme'
        },
        assignedTo: {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com'
        },
        createdBy: {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.json(mockCompany);
    }

    const company = await Company.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a company
// @route   POST /api/companies
// @access  Private
exports.createCompany = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock created company
      const mockCompany = {
        _id: Math.floor(Math.random() * 1000).toString(),
        ...req.body,
        createdBy: {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.status(201).json(mockCompany);
    }

    // We don't need to check for demo users anymore since we're using valid ObjectIds in authMiddleware

    const company = new Company({
      ...req.body,
      createdBy: req.user._id,
      assignedTo: req.body.assignedTo || req.user._id
    });

    const createdCompany = await company.save();

    // Populate user fields
    await createdCompany.populate('assignedTo', 'firstName lastName email');
    await createdCompany.populate('createdBy', 'firstName lastName email');

    res.status(201).json(createdCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a company
// @route   PUT /api/companies/:id
// @access  Private
exports.updateCompany = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock updated company
      const mockCompany = {
        _id: req.params.id,
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      return res.json(mockCompany);
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      company[key] = req.body[key];
    });

    company.updatedAt = Date.now();

    const updatedCompany = await company.save();

    // Populate user fields
    await updatedCompany.populate('assignedTo', 'firstName lastName email');
    await updatedCompany.populate('createdBy', 'firstName lastName email');

    res.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a company
// @route   DELETE /api/companies/:id
// @access  Private
exports.deleteCompany = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      return res.json({ message: 'Company deleted successfully' });
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await company.remove();

    // Also delete related notes, files, and messages
    await Note.deleteMany({ entityType: 'Company', entityId: req.params.id });
    await File.deleteMany({ entityType: 'Company', entityId: req.params.id });
    await Message.deleteMany({ entityType: 'Company', entityId: req.params.id });

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get company notes
// @route   GET /api/companies/:id/notes
// @access  Private
exports.getCompanyNotes = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock notes
      const mockNotes = [
        {
          _id: '1',
          content: 'Initial contact made with the CEO.',
          entityType: 'Company',
          entityId: req.params.id,
          createdBy: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          content: 'Scheduled a demo for next week.',
          entityType: 'Company',
          entityId: req.params.id,
          createdBy: {
            _id: '2',
            firstName: 'John',
            lastName: 'Doe'
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      return res.json(mockNotes);
    }

    const notes = await Note.find({
      entityType: 'Company',
      entityId: req.params.id
    })
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Error fetching company notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create company note
// @route   POST /api/companies/:id/notes
// @access  Private
exports.createCompanyNote = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock created note
      const mockNote = {
        _id: Math.floor(Math.random() * 1000).toString(),
        content: req.body.content,
        entityType: 'Company',
        entityId: req.params.id,
        createdBy: {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.status(201).json(mockNote);
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const note = new Note({
      content: req.body.content,
      entityType: 'Company',
      entityId: req.params.id,
      createdBy: req.user._id
    });

    const createdNote = await note.save();

    // Populate user fields
    await createdNote.populate('createdBy', 'firstName lastName email');

    res.status(201).json(createdNote);
  } catch (error) {
    console.error('Error creating company note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get company files
// @route   GET /api/companies/:id/files
// @access  Private
exports.getCompanyFiles = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock files
      const mockFiles = [
        {
          _id: '1',
          filename: 'contract_acme_2023.pdf',
          originalName: 'Contract_Acme_2023.pdf',
          mimeType: 'application/pdf',
          size: 2457621,
          path: '/uploads/contract_acme_2023.pdf',
          entityType: 'Company',
          entityId: req.params.id,
          createdBy: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          },
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          filename: 'meeting_notes.docx',
          originalName: 'Meeting_Notes.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 1245789,
          path: '/uploads/meeting_notes.docx',
          entityType: 'Company',
          entityId: req.params.id,
          createdBy: {
            _id: '2',
            firstName: 'John',
            lastName: 'Doe'
          },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      return res.json(mockFiles);
    }

    const files = await File.find({
      entityType: 'Company',
      entityId: req.params.id
    })
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    console.error('Error fetching company files:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get company messages (internal chat)
// @route   GET /api/companies/:id/messages
// @access  Private
exports.getCompanyMessages = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock messages
      const mockMessages = [
        {
          _id: '1',
          content: 'I just had a call with their CEO, very positive feedback.',
          entityType: 'Company',
          entityId: req.params.id,
          createdBy: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          },
          mentions: [],
          readBy: [
            {
              user: {
                _id: '1',
                firstName: 'Admin',
                lastName: 'User'
              },
              readAt: new Date().toISOString()
            },
            {
              user: {
                _id: '2',
                firstName: 'John',
                lastName: 'Doe'
              },
              readAt: new Date().toISOString()
            }
          ],
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          content: 'Great! Let\'s schedule a follow-up meeting next week.',
          entityType: 'Company',
          entityId: req.params.id,
          createdBy: {
            _id: '2',
            firstName: 'John',
            lastName: 'Doe'
          },
          mentions: [
            {
              _id: '1',
              firstName: 'Admin',
              lastName: 'User'
            }
          ],
          readBy: [
            {
              user: {
                _id: '2',
                firstName: 'John',
                lastName: 'Doe'
              },
              readAt: new Date().toISOString()
            }
          ],
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ];

      return res.json(mockMessages);
    }

    const messages = await Message.find({
      entityType: 'Company',
      entityId: req.params.id
    })
    .populate('createdBy', 'firstName lastName email')
    .populate('mentions', 'firstName lastName email')
    .populate('readBy.user', 'firstName lastName email')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching company messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create company message
// @route   POST /api/companies/:id/messages
// @access  Private
exports.createCompanyMessage = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock created message
      const mockMessage = {
        _id: Math.floor(Math.random() * 1000).toString(),
        content: req.body.content,
        entityType: 'Company',
        entityId: req.params.id,
        createdBy: {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User'
        },
        mentions: req.body.mentions || [],
        readBy: [
          {
            user: {
              _id: '1',
              firstName: 'Admin',
              lastName: 'User'
            },
            readAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      };

      return res.status(201).json(mockMessage);
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const message = new Message({
      content: req.body.content,
      entityType: 'Company',
      entityId: req.params.id,
      createdBy: req.user._id,
      mentions: req.body.mentions || [],
      readBy: [{ user: req.user._id }]
    });

    const createdMessage = await message.save();

    // Populate user fields
    await createdMessage.populate('createdBy', 'firstName lastName email');
    await createdMessage.populate('mentions', 'firstName lastName email');
    await createdMessage.populate('readBy.user', 'firstName lastName email');

    res.status(201).json(createdMessage);
  } catch (error) {
    console.error('Error creating company message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark company messages as read
// @route   POST /api/companies/:id/messages/read
// @access  Private
exports.markCompanyMessagesAsRead = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      return res.json({ message: 'Messages marked as read' });
    }

    // Update all unread messages for this company
    await Message.updateMany(
      {
        entityType: 'Company',
        entityId: req.params.id,
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
