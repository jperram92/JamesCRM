const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const companyRoutes = require('./companies');
const contactRoutes = require('./contacts');
const dealRoutes = require('./deals');
const activityRoutes = require('./activities');
const adminRoutes = require('./admin');

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Company routes
router.use('/companies', companyRoutes);

// Contact routes
router.use('/contacts', contactRoutes);

// Deal routes
router.use('/deals', dealRoutes);

// Activity routes
router.use('/activities', activityRoutes);

// Admin routes
router.use('/admin', adminRoutes);

module.exports = router;
