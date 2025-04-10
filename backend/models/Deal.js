const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const DealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quoteNumber: {
    type: String,
    required: true,
    unique: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  billingContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired', 'Converted'],
    default: 'Draft'
  },
  stage: {
    type: String,
    enum: ['Qualification', 'Proposal', 'Negotiation', 'Closing', 'Won', 'Lost'],
    default: 'Qualification'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  discountType: {
    type: String,
    enum: ['Percentage', 'Fixed'],
    default: 'Percentage'
  },
  discountValue: {
    type: Number,
    default: 0,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  lineItems: [LineItemSchema],
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  signatureRequired: {
    type: Boolean,
    default: true
  },
  signatureDate: {
    type: Date
  },
  signedBy: {
    name: String,
    email: String,
    title: String,
    signatureImage: String
  },
  pdfUrl: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update timestamps
DealSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to calculate totals
DealSchema.pre('save', function(next) {
  // Calculate line item totals
  if (this.lineItems && this.lineItems.length > 0) {
    this.lineItems.forEach(item => {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = subtotal * (item.discount / 100);
      const taxAmount = (subtotal - discountAmount) * (item.tax / 100);
      item.total = subtotal - discountAmount + taxAmount;
    });
  }

  // Calculate deal subtotal
  this.subtotal = this.lineItems.reduce((sum, item) => sum + item.total, 0);

  // Apply deal-level discount
  let discountedSubtotal = this.subtotal;
  if (this.discountValue > 0) {
    if (this.discountType === 'Percentage') {
      discountedSubtotal = this.subtotal * (1 - (this.discountValue / 100));
    } else {
      discountedSubtotal = this.subtotal - this.discountValue;
    }
  }

  // Calculate tax
  this.taxAmount = discountedSubtotal * (this.taxRate / 100);

  // Calculate total
  this.totalAmount = discountedSubtotal + this.taxAmount;
  this.amount = this.totalAmount; // For easier querying

  next();
});

// Generate quote number
DealSchema.pre('save', async function(next) {
  if (!this.quoteNumber) {
    const Deal = mongoose.model('Deal', DealSchema);
    const count = await Deal.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.quoteNumber = `Q${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Deal', DealSchema);
