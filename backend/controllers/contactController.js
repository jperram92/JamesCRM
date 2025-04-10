const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const Company = require('../models/Company');
const Note = require('../models/Note');
const File = require('../models/File');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
exports.getAllContacts = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock contacts
      const mockContacts = [
        {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '(555) 123-4567',
          mobile: '(555) 987-6543',
          jobTitle: 'CEO',
          department: 'Executive',
          company: {
            _id: '1',
            name: 'Acme Inc.'
          },
          address: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          },
          type: 'Customer',
          status: 'Active',
          source: 'Referral',
          tags: ['VIP', 'Decision Maker'],
          createdBy: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          },
          assignedTo: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '(555) 222-3333',
          mobile: '(555) 444-5555',
          jobTitle: 'Marketing Director',
          department: 'Marketing',
          company: {
            _id: '2',
            name: 'XYZ Corp'
          },
          address: {
            street: '456 Market St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          type: 'Prospect',
          status: 'Lead',
          source: 'Website',
          tags: ['Marketing', 'Potential'],
          createdBy: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          },
          assignedTo: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      return res.json(mockContacts);
    }

    // Get all contacts with populated fields
    const contacts = await Contact.find()
      .populate('company', 'name industry')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get contact by ID
// @route   GET /api/contacts/:id
// @access  Private
exports.getContactById = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock contact
      const mockContact = {
        _id: req.params.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        mobile: '(555) 987-6543',
        jobTitle: 'CEO',
        department: 'Executive',
        company: {
          _id: '1',
          name: 'Acme Inc.',
          industry: 'Technology'
        },
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        },
        description: 'Key decision maker for all technology purchases.',
        type: 'Customer',
        status: 'Active',
        source: 'Referral',
        tags: ['VIP', 'Decision Maker'],
        socialMedia: {
          linkedin: 'https://linkedin.com/in/johndoe',
          twitter: 'https://twitter.com/johndoe'
        },
        birthday: new Date('1980-06-15').toISOString(),
        preferredContactMethod: 'Email',
        doNotContact: false,
        lastContactedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User'
        },
        assignedTo: {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.json(mockContact);
    }

    // Get contact by ID with populated fields
    const contact = await Contact.findById(req.params.id)
      .populate('company', 'name industry website')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error getting contact:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create contact
// @route   POST /api/contacts
// @access  Private
exports.createContact = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock created contact
      const mockContact = {
        _id: Math.floor(Math.random() * 1000).toString(),
        ...req.body,
        createdBy: {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User'
        },
        assignedTo: {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.status(201).json(mockContact);
    }

    // Check if company exists if company ID is provided
    if (req.body.company) {
      const company = await Company.findById(req.body.company);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    // Create contact
    const contact = new Contact({
      ...req.body,
      createdBy: req.user._id,
      assignedTo: req.body.assignedTo || req.user._id
    });

    await contact.save();

    // Populate fields for response
    const populatedContact = await Contact.findById(contact._id)
      .populate('company', 'name industry')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    res.status(201).json(populatedContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
exports.updateContact = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock updated contact
      const mockContact = {
        _id: req.params.id,
        ...req.body,
        createdBy: {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User'
        },
        assignedTo: {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User'
        },
        updatedAt: new Date().toISOString()
      };

      return res.json(mockContact);
    }

    // Check if company exists if company ID is provided
    if (req.body.company) {
      const company = await Company.findById(req.body.company);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    // Find contact and update
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      contact[key] = req.body[key];
    });

    // Update updatedAt
    contact.updatedAt = Date.now();

    await contact.save();

    // Populate fields for response
    const populatedContact = await Contact.findById(contact._id)
      .populate('company', 'name industry')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    res.json(populatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
exports.deleteContact = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      return res.json({ message: 'Contact removed' });
    }

    // Find contact
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Delete contact
    await contact.remove();

    res.json({ message: 'Contact removed' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get contact notes
// @route   GET /api/contacts/:id/notes
// @access  Private
exports.getContactNotes = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock notes
      const mockNotes = [
        {
          _id: '1',
          content: 'Had a great meeting with John about the new project.',
          entityType: 'Contact',
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
          content: 'John expressed interest in our premium package.',
          entityType: 'Contact',
          entityId: req.params.id,
          createdBy: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      return res.json(mockNotes);
    }

    // Get notes for contact
    const notes = await Note.find({
      entityType: 'Contact',
      entityId: req.params.id
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Error getting contact notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create contact note
// @route   POST /api/contacts/:id/notes
// @access  Private
exports.createContactNote = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock created note
      const mockNote = {
        _id: Math.floor(Math.random() * 1000).toString(),
        content: req.body.content,
        entityType: 'Contact',
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

    // Check if contact exists
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Create note
    const note = new Note({
      content: req.body.content,
      entityType: 'Contact',
      entityId: req.params.id,
      createdBy: req.user._id
    });

    await note.save();

    // Populate fields for response
    const populatedNote = await Note.findById(note._id)
      .populate('createdBy', 'firstName lastName');

    res.status(201).json(populatedNote);
  } catch (error) {
    console.error('Error creating contact note:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get contact messages
// @route   GET /api/contacts/:id/messages
// @access  Private
exports.getContactMessages = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock messages
      const mockMessages = [
        {
          _id: '1',
          content: 'I just spoke with John and he wants to schedule a demo next week.',
          entityType: 'Contact',
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
            }
          ],
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          content: 'Great! I can handle the demo. What time works best for him?',
          entityType: 'Contact',
          entityId: req.params.id,
          createdBy: {
            _id: '2',
            firstName: 'Jane',
            lastName: 'Smith'
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
                firstName: 'Jane',
                lastName: 'Smith'
              },
              readAt: new Date().toISOString()
            }
          ],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];

      return res.json(mockMessages);
    }

    // Get messages for contact
    const messages = await Message.find({
      entityType: 'Contact',
      entityId: req.params.id
    })
      .populate('createdBy', 'firstName lastName')
      .populate('mentions', 'firstName lastName')
      .populate('readBy.user', 'firstName lastName')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error getting contact messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create contact message
// @route   POST /api/contacts/:id/messages
// @access  Private
exports.createContactMessage = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock created message
      const mockMessage = {
        _id: Math.floor(Math.random() * 1000).toString(),
        content: req.body.content,
        entityType: 'Contact',
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

    // Check if contact exists
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Create message
    const message = new Message({
      content: req.body.content,
      entityType: 'Contact',
      entityId: req.params.id,
      createdBy: req.user._id,
      mentions: req.body.mentions || [],
      readBy: [{ user: req.user._id }]
    });

    await message.save();

    // Populate fields for response
    const populatedMessage = await Message.findById(message._id)
      .populate('createdBy', 'firstName lastName')
      .populate('mentions', 'firstName lastName')
      .populate('readBy.user', 'firstName lastName');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error creating contact message:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark contact messages as read
// @route   POST /api/contacts/:id/messages/read
// @access  Private
exports.markContactMessagesAsRead = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      return res.json({ message: 'Messages marked as read' });
    }

    // Update all unread messages for this contact
    await Message.updateMany(
      { 
        entityType: 'Contact', 
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

// @desc    Get contacts by company
// @route   GET /api/contacts/company/:companyId
// @access  Private
exports.getContactsByCompany = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock contacts for company
      const mockContacts = [
        {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '(555) 123-4567',
          jobTitle: 'CEO',
          company: {
            _id: req.params.companyId,
            name: 'Acme Inc.'
          },
          type: 'Customer',
          status: 'Active',
          createdBy: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          },
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          phone: '(555) 333-4444',
          jobTitle: 'CTO',
          company: {
            _id: req.params.companyId,
            name: 'Acme Inc.'
          },
          type: 'Customer',
          status: 'Active',
          createdBy: {
            _id: '1',
            firstName: 'Admin',
            lastName: 'User'
          },
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      return res.json(mockContacts);
    }

    // Get contacts for company
    const contacts = await Contact.find({ company: req.params.companyId })
      .populate('company', 'name industry')
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (error) {
    console.error('Error getting contacts by company:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};
