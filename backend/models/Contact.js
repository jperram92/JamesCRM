const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['Customer', 'Partner', 'Prospect', 'Vendor', 'Employee', 'Other'],
    default: 'Prospect'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Lead', 'Opportunity', 'Customer', 'Churned'],
    default: 'Active'
  },
  source: {
    type: String,
    enum: ['Website', 'Referral', 'Advertisement', 'Event', 'Social Media', 'Email', 'Cold Call', 'Other'],
    default: 'Other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  birthday: {
    type: Date
  },
  preferredContactMethod: {
    type: String,
    enum: ['Email', 'Phone', 'Mobile', 'Mail', 'Any'],
    default: 'Email'
  },
  doNotContact: {
    type: Boolean,
    default: false
  },
  lastContactedDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Update the updatedAt field on save
ContactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full name
ContactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included when converting to JSON
ContactSchema.set('toJSON', { virtuals: true });
ContactSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contact', ContactSchema);
