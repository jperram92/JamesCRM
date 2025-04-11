/**
 * Express application for testing
 */

const express = require('express');
const cors = require('cors');
const { authenticate } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const contactRoutes = require('./routes/contacts');
const dealRoutes = require('./routes/deals');
const activityRoutes = require('./routes/activities');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/companies', authenticate, companyRoutes);
app.use('/api/contacts', authenticate, contactRoutes);
app.use('/api/deals', authenticate, dealRoutes);
app.use('/api/activities', authenticate, activityRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
