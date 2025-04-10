const mongoose = require('mongoose');
const Deal = require('../models/Deal');
const Company = require('../models/Company');
const Contact = require('../models/Contact');
const User = require('../models/User');

// Mock data storage for development without MongoDB
const mockDeals = [
  {
    _id: '1',
    name: 'Website Development Project',
    quoteNumber: 'Q2301-0001',
    company: {
      _id: '1',
      name: 'Acme Inc.',
      industry: 'Technology',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      }
    },
    contact: {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@acme.com',
      phone: '+1 (555) 123-4567'
    },
    billingContact: {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@acme.com',
      phone: '+1 (555) 123-4567'
    },
    status: 'Draft',
    stage: 'Proposal',
    amount: 5000,
    currency: 'USD',
    discountType: 'Percentage',
    discountValue: 0,
    taxRate: 0,
    subtotal: 5000,
    taxAmount: 0,
    totalAmount: 5000,
    lineItems: [
      {
        description: 'Website Design',
        quantity: 1,
        unitPrice: 2000,
        discount: 0,
        tax: 0,
        total: 2000
      },
      {
        description: 'Website Development',
        quantity: 1,
        unitPrice: 3000,
        discount: 0,
        tax: 0,
        total: 3000
      }
    ],
    notes: 'This quote includes the design and development of a new website.',
    terms: 'Payment due within 30 days of invoice.',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    signatureRequired: true,
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
    name: 'Marketing Campaign',
    quoteNumber: 'Q2301-0002',
    company: {
      _id: '2',
      name: 'Globex Corporation',
      industry: 'Manufacturing',
      address: {
        street: '456 Market St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      }
    },
    contact: {
      _id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@globex.com',
      phone: '+1 (555) 987-6543'
    },
    status: 'Sent',
    stage: 'Negotiation',
    amount: 10000,
    currency: 'USD',
    discountType: 'Percentage',
    discountValue: 10,
    taxRate: 5,
    subtotal: 10000,
    taxAmount: 450,
    totalAmount: 9450,
    lineItems: [
      {
        description: 'Social Media Campaign',
        quantity: 1,
        unitPrice: 5000,
        discount: 0,
        tax: 0,
        total: 5000
      },
      {
        description: 'Email Marketing',
        quantity: 1,
        unitPrice: 3000,
        discount: 0,
        tax: 0,
        total: 3000
      },
      {
        description: 'Content Creation',
        quantity: 1,
        unitPrice: 2000,
        discount: 0,
        tax: 0,
        total: 2000
      }
    ],
    notes: 'This quote includes a comprehensive marketing campaign.',
    terms: 'Payment due within 15 days of invoice.',
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    signatureRequired: true,
    createdBy: {
      _id: '1',
      firstName: 'Admin',
      lastName: 'User'
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// @desc    Get all deals
// @route   GET /api/deals
// @access  Private
exports.getAllDeals = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Get All Deals - Using mock data (SKIP_MONGODB=true)');
      console.log(`Get All Deals - Returning ${mockDeals.length} mock deals`);

      return res.json(mockDeals);
    }

    const deals = await Deal.find()
      .populate('company', 'name industry')
      .populate('contact', 'firstName lastName email')
      .populate('billingContact', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get deal by ID
// @route   GET /api/deals/:id
// @access  Private
exports.getDealById = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Get Deal By ID - Using mock data (SKIP_MONGODB=true)');
      console.log('Get Deal By ID - Requested ID:', req.params.id);

      const deal = mockDeals.find(d => d._id === req.params.id);

      if (!deal) {
        console.log('Get Deal By ID - Deal not found in mock data');
        return res.status(404).json({ message: 'Deal not found' });
      }

      console.log('Get Deal By ID - Found deal:', deal.name);
      return res.json(deal);
    }

    const deal = await Deal.findById(req.params.id)
      .populate('company', 'name industry address')
      .populate('contact', 'firstName lastName email phone')
      .populate('billingContact', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new deal
// @route   POST /api/deals
// @access  Private
exports.createDeal = async (req, res) => {
  try {
    console.log('Create Deal - Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Create Deal - User:', req.user);

    const {
      name,
      company,
      contact,
      billingContact,
      assignedTo,
      status,
      stage,
      currency,
      discountType,
      discountValue,
      taxRate,
      lineItems,
      notes,
      terms,
      expiryDate,
      signatureRequired
    } = req.body;

    console.log('Create Deal - Extracted Fields:');
    console.log('- name:', name);
    console.log('- company:', company);
    console.log('- contact:', contact);
    console.log('- billingContact:', billingContact);
    console.log('- lineItems:', JSON.stringify(lineItems, null, 2));

    // Validate required fields
    if (!name || !company || !lineItems || lineItems.length === 0) {
      console.log('Create Deal - Validation Failed');
      return res.status(400).json({
        message: 'Please provide name, company, and at least one line item'
      });
    }

    // Create new deal with initial values
    console.log('Create Deal - Creating new deal object');

    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Create Deal - Using mock data (SKIP_MONGODB=true)');

      // Get company details if only ID is provided
      let companyObj = company;
      if (typeof company === 'string') {
        const mockCompany = {
          _id: company,
          name: company === '1' ? 'Acme Inc.' : company === '2' ? 'Globex Corporation' : 'Mock Company',
          industry: 'Technology',
          address: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          }
        };
        companyObj = mockCompany;
      }

      // Get contact details if only ID is provided
      let contactObj = null;
      if (contact) {
        if (typeof contact === 'string') {
          contactObj = {
            _id: contact,
            firstName: contact === '1' ? 'John' : 'Jane',
            lastName: contact === '1' ? 'Doe' : 'Smith',
            email: contact === '1' ? 'john.doe@acme.com' : 'jane.smith@globex.com',
            phone: contact === '1' ? '+1 (555) 123-4567' : '+1 (555) 987-6543'
          };
        } else {
          contactObj = contact;
        }
      }

      // Get billing contact details if only ID is provided
      let billingContactObj = null;
      if (billingContact) {
        if (typeof billingContact === 'string') {
          billingContactObj = {
            _id: billingContact,
            firstName: billingContact === '1' ? 'John' : 'Jane',
            lastName: billingContact === '1' ? 'Doe' : 'Smith',
            email: billingContact === '1' ? 'john.doe@acme.com' : 'jane.smith@globex.com',
            phone: billingContact === '1' ? '+1 (555) 123-4567' : '+1 (555) 987-6543'
          };
        } else {
          billingContactObj = billingContact;
        }
      }

      // Create a mock deal with the provided data
      const newId = (mockDeals.length + 1).toString();
      const mockDeal = {
        _id: newId,
        name,
        quoteNumber: `Q${new Date().getFullYear().toString().substr(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        company: companyObj,
        contact: contactObj,
        billingContact: billingContactObj,
        status: status || 'Draft',
        stage: stage || 'Qualification',
        currency: currency || 'USD',
        discountType: discountType || 'Percentage',
        discountValue: discountValue || 0,
        taxRate: taxRate || 0,
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: item.quantity * item.unitPrice
        })),
        notes,
        terms,
        expiryDate,
        signatureRequired: signatureRequired !== undefined ? signatureRequired : true,
        createdBy: { _id: req.user?.id || '1', firstName: 'Admin', lastName: 'User' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Calculate totals
        subtotal: lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        taxAmount: 0, // Would be calculated based on subtotal and tax rate
        totalAmount: lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0), // Simplified calculation
        amount: lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      };

      // Add the new deal to the mockDeals array
      mockDeals.push(mockDeal);

      console.log('Create Deal - Mock Deal Created:', JSON.stringify(mockDeal, null, 2));
      console.log(`Create Deal - Total mock deals: ${mockDeals.length}`);
      return res.status(201).json(mockDeal);
    }

    const newDeal = new Deal({
      name,
      company,
      contact,
      billingContact,
      assignedTo,
      status: status || 'Draft',
      stage: stage || 'Qualification',
      currency: currency || 'USD',
      discountType: discountType || 'Percentage',
      discountValue: discountValue || 0,
      taxRate: taxRate || 0,
      lineItems: lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax || 0,
        total: item.quantity * item.unitPrice // Will be recalculated in pre-save hook
      })),
      notes,
      terms,
      expiryDate,
      signatureRequired: signatureRequired !== undefined ? signatureRequired : true,
      createdBy: req.user.id,
      // These will be calculated in pre-save hook
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      amount: 0
    });

    console.log('Create Deal - New Deal Object:', JSON.stringify(newDeal, null, 2));

    try {
      const deal = await newDeal.save();
      console.log('Create Deal - Deal Saved Successfully:', JSON.stringify(deal, null, 2));
      res.status(201).json(deal);
    } catch (saveError) {
      console.error('Create Deal - Error Saving Deal:', saveError);
      throw saveError;
    }
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update deal
// @route   PUT /api/deals/:id
// @access  Private
exports.updateDeal = async (req, res) => {
  try {
    console.log('Update Deal - Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Update Deal - Deal ID:', req.params.id);

    const {
      name,
      company,
      contact,
      billingContact,
      assignedTo,
      status,
      stage,
      currency,
      discountType,
      discountValue,
      taxRate,
      lineItems,
      notes,
      terms,
      expiryDate,
      signatureRequired
    } = req.body;

    console.log('Update Deal - Extracted Fields:');
    console.log('- name:', name);
    console.log('- company:', company);
    console.log('- contact:', contact);
    console.log('- billingContact:', billingContact);
    console.log('- lineItems:', JSON.stringify(lineItems, null, 2));

    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      console.log('Update Deal - Using mock data (SKIP_MONGODB=true)');
      console.log('Update Deal - Requested ID:', req.params.id);

      // Find the deal in the mockDeals array
      const dealIndex = mockDeals.findIndex(d => d._id === req.params.id);

      if (dealIndex === -1) {
        console.log('Update Deal - Deal not found in mock data');
        return res.status(404).json({ message: 'Deal not found' });
      }

      // Get company details if only ID is provided
      let companyObj = company;
      if (typeof company === 'string') {
        const mockCompany = {
          _id: company,
          name: company === '1' ? 'Acme Inc.' : company === '2' ? 'Globex Corporation' : 'Mock Company',
          industry: 'Technology',
          address: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          }
        };
        companyObj = mockCompany;
      }

      // Get contact details if only ID is provided
      let contactObj = null;
      if (contact) {
        if (typeof contact === 'string') {
          contactObj = {
            _id: contact,
            firstName: contact === '1' ? 'John' : 'Jane',
            lastName: contact === '1' ? 'Doe' : 'Smith',
            email: contact === '1' ? 'john.doe@acme.com' : 'jane.smith@globex.com',
            phone: contact === '1' ? '+1 (555) 123-4567' : '+1 (555) 987-6543'
          };
        } else {
          contactObj = contact;
        }
      }

      // Get billing contact details if only ID is provided
      let billingContactObj = null;
      if (billingContact) {
        if (typeof billingContact === 'string') {
          billingContactObj = {
            _id: billingContact,
            firstName: billingContact === '1' ? 'John' : 'Jane',
            lastName: billingContact === '1' ? 'Doe' : 'Smith',
            email: billingContact === '1' ? 'john.doe@acme.com' : 'jane.smith@globex.com',
            phone: billingContact === '1' ? '+1 (555) 123-4567' : '+1 (555) 987-6543'
          };
        } else {
          billingContactObj = billingContact;
        }
      }

      // Create the updated deal
      const updatedDeal = {
        ...mockDeals[dealIndex],
        name,
        company: companyObj,
        contact: contactObj,
        billingContact: billingContactObj,
        status: status || mockDeals[dealIndex].status,
        stage: stage || mockDeals[dealIndex].stage,
        currency: currency || mockDeals[dealIndex].currency,
        discountType: discountType || mockDeals[dealIndex].discountType,
        discountValue: discountValue !== undefined ? discountValue : mockDeals[dealIndex].discountValue,
        taxRate: taxRate !== undefined ? taxRate : mockDeals[dealIndex].taxRate,
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: item.quantity * item.unitPrice
        })),
        notes,
        terms,
        expiryDate,
        signatureRequired: signatureRequired !== undefined ? signatureRequired : mockDeals[dealIndex].signatureRequired,
        updatedAt: new Date().toISOString(),
        // Calculate totals
        subtotal: lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        taxAmount: 0,
        totalAmount: lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        amount: lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      };

      // Update the deal in the mockDeals array
      mockDeals[dealIndex] = updatedDeal;

      console.log('Update Deal - Mock Deal Updated:', updatedDeal.name);
      return res.json(updatedDeal);
    }

    // Find deal
    let deal = await Deal.findById(req.params.id);

    if (!deal) {
      console.log('Update Deal - Deal not found');
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Check if user is authorized to update
    // Only creator, assigned user, or admin can update
    if (
      deal.createdBy.toString() !== req.user.id &&
      (!deal.assignedTo || deal.assignedTo.toString() !== req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this deal' });
    }

    // Update fields
    if (name) deal.name = name;
    if (company) deal.company = company;
    if (contact !== undefined) deal.contact = contact;
    if (billingContact !== undefined) deal.billingContact = billingContact;
    if (assignedTo !== undefined) deal.assignedTo = assignedTo;
    if (status) deal.status = status;
    if (stage) deal.stage = stage;
    if (currency) deal.currency = currency;
    if (discountType) deal.discountType = discountType;
    if (discountValue !== undefined) deal.discountValue = discountValue;
    if (taxRate !== undefined) deal.taxRate = taxRate;
    if (lineItems && lineItems.length > 0) {
      deal.lineItems = lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax || 0,
        total: item.quantity * item.unitPrice // Will be recalculated in pre-save hook
      }));
    }
    if (notes !== undefined) deal.notes = notes;
    if (terms !== undefined) deal.terms = terms;
    if (expiryDate !== undefined) deal.expiryDate = expiryDate;
    if (signatureRequired !== undefined) deal.signatureRequired = signatureRequired;

    // Save updated deal
    const updatedDeal = await deal.save();

    res.json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete deal
// @route   DELETE /api/deals/:id
// @access  Private
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Check if user is authorized to delete
    // Only creator or admin can delete
    if (deal.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this deal' });
    }

    await deal.remove();

    res.json({ message: 'Deal removed' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get deals by company
// @route   GET /api/deals/company/:companyId
// @access  Private
exports.getDealsByCompany = async (req, res) => {
  try {
    const deals = await Deal.find({ company: req.params.companyId })
      .populate('contact', 'firstName lastName email')
      .populate('billingContact', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(deals);
  } catch (error) {
    console.error('Error fetching company deals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update deal status
// @route   PUT /api/deals/:id/status
// @access  Private
exports.updateDealStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.status = status;

    // If status is Accepted, update signature date
    if (status === 'Accepted' && !deal.signatureDate) {
      deal.signatureDate = new Date();
    }

    const updatedDeal = await deal.save();

    res.json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal status:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update deal signature
// @route   PUT /api/deals/:id/signature
// @access  Private
exports.updateDealSignature = async (req, res) => {
  try {
    const { name, email, title, signatureImage } = req.body;

    if (!name || !email || !signatureImage) {
      return res.status(400).json({
        message: 'Name, email, and signature image are required'
      });
    }

    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.signedBy = {
      name,
      email,
      title,
      signatureImage
    };
    deal.signatureDate = new Date();
    deal.status = 'Accepted';

    const updatedDeal = await deal.save();

    res.json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal signature:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update PDF URL
// @route   PUT /api/deals/:id/pdf
// @access  Private
exports.updatePdfUrl = async (req, res) => {
  try {
    const { pdfUrl } = req.body;

    if (!pdfUrl) {
      return res.status(400).json({ message: 'PDF URL is required' });
    }

    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.pdfUrl = pdfUrl;

    const updatedDeal = await deal.save();

    res.json(updatedDeal);
  } catch (error) {
    console.error('Error updating PDF URL:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Export mockDeals for use in other controllers
exports.mockDeals = mockDeals;