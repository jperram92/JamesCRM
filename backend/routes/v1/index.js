/**
 * API v1 routes for JamesCRM
 */
const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('../userRoutes');
const authRoutes = require('../authRoutes');
const companyRoutes = require('../companyRoutes');
const contactRoutes = require('../contactRoutes');
const dealRoutes = require('../dealRoutes');
const quoteRoutes = require('../quoteRoutes');
const auditRoutes = require('../auditRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/contacts', contactRoutes);
router.use('/deals', dealRoutes);
router.use('/quotes', quoteRoutes);
router.use('/audit', auditRoutes);

// API information route
router.get('/', (req, res) => {
  res.json({
    name: 'JamesCRM API',
    version: 'v1',
    status: 'active',
    documentation: '/api/v1/docs'
  });
});

// API documentation route
router.get('/docs', (req, res) => {
  res.json({
    message: 'API documentation',
    endpoints: {
      auth: {
        login: 'POST /api/v1/auth/login',
        completeRegistration: 'POST /api/v1/auth/complete-registration',
        validateInvitation: 'GET /api/v1/auth/validate-invitation'
      },
      users: {
        getAll: 'GET /api/v1/users',
        getById: 'GET /api/v1/users/:id',
        invite: 'POST /api/v1/users/invite',
        update: 'PUT /api/v1/users/:id',
        delete: 'DELETE /api/v1/users/:id'
      },
      companies: {
        getAll: 'GET /api/v1/companies',
        getById: 'GET /api/v1/companies/:id',
        create: 'POST /api/v1/companies',
        update: 'PUT /api/v1/companies/:id',
        delete: 'DELETE /api/v1/companies/:id',
        getNotes: 'GET /api/v1/companies/:id/notes',
        createNote: 'POST /api/v1/companies/:id/notes'
      },
      contacts: {
        getAll: 'GET /api/v1/contacts',
        getById: 'GET /api/v1/contacts/:id',
        create: 'POST /api/v1/contacts',
        update: 'PUT /api/v1/contacts/:id',
        delete: 'DELETE /api/v1/contacts/:id'
      },
      deals: {
        getAll: 'GET /api/v1/deals',
        getById: 'GET /api/v1/deals/:id',
        create: 'POST /api/v1/deals',
        update: 'PUT /api/v1/deals/:id',
        delete: 'DELETE /api/v1/deals/:id',
        getByCompany: 'GET /api/v1/deals/company/:companyId'
      },
      quotes: {
        getAll: 'GET /api/v1/quotes',
        getById: 'GET /api/v1/quotes/:id',
        create: 'POST /api/v1/quotes',
        update: 'PUT /api/v1/quotes/:id',
        delete: 'DELETE /api/v1/quotes/:id'
      },
      audit: {
        getAll: 'GET /api/v1/audit',
        getByUser: 'GET /api/v1/audit/user/:userId',
        getByEntity: 'GET /api/v1/audit/entity/:entityType/:entityId'
      }
    }
  });
});

module.exports = router;
