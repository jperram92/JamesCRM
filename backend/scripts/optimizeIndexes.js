/**
 * Script to optimize database indexes for JamesCRM
 * Run with: node scripts/optimizeIndexes.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { createOptimalIndexes } = require('../utils/queryOptimizer');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Company = require('../models/Company');
const Contact = require('../models/Contact');
const Deal = require('../models/Deal');
const Message = require('../models/Message');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jamescrm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Define optimal indexes for each model
const indexDefinitions = {
  User: [
    { email: 1 },
    { status: 1 },
    { role: 1 },
    { 'invitationToken': 1 },
    { createdAt: -1 }
  ],
  Company: [
    { name: 1 },
    { 'createdBy': 1 },
    { industry: 1 },
    { createdAt: -1 },
    { updatedAt: -1 }
  ],
  Contact: [
    { email: 1 },
    { 'company': 1 },
    { 'createdBy': 1 },
    { firstName: 1, lastName: 1 },
    { createdAt: -1 }
  ],
  Deal: [
    { 'company': 1 },
    { 'contact': 1 },
    { 'assignedTo': 1 },
    { status: 1 },
    { stage: 1 },
    { amount: -1 },
    { createdAt: -1 }
  ],
  Message: [
    { 'entityType': 1, 'entityId': 1 },
    { 'createdBy': 1 },
    { 'mentions': 1 },
    { createdAt: -1 }
  ]
};

// Apply indexes to all models
const optimizeAllIndexes = async () => {
  try {
    console.log('Starting index optimization...');
    
    // Create indexes for User model
    console.log('Optimizing User indexes...');
    const userResults = await createOptimalIndexes(User, indexDefinitions.User);
    console.log('User indexes created:', userResults);
    
    // Create indexes for Company model
    console.log('Optimizing Company indexes...');
    const companyResults = await createOptimalIndexes(Company, indexDefinitions.Company);
    console.log('Company indexes created:', companyResults);
    
    // Create indexes for Contact model
    console.log('Optimizing Contact indexes...');
    const contactResults = await createOptimalIndexes(Contact, indexDefinitions.Contact);
    console.log('Contact indexes created:', contactResults);
    
    // Create indexes for Deal model
    console.log('Optimizing Deal indexes...');
    const dealResults = await createOptimalIndexes(Deal, indexDefinitions.Deal);
    console.log('Deal indexes created:', dealResults);
    
    // Create indexes for Message model
    console.log('Optimizing Message indexes...');
    const messageResults = await createOptimalIndexes(Message, indexDefinitions.Message);
    console.log('Message indexes created:', messageResults);
    
    console.log('Index optimization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error optimizing indexes:', error);
    process.exit(1);
  }
};

// Run the optimization
optimizeAllIndexes();
