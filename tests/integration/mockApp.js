/**
 * Mock Express app for integration tests
 */

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create a mock Express app
const createMockApp = () => {
  const app = express();
  
  // Middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Mock models
  app.models = {
    User: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    },
    Company: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    }
  };
  
  // Mock bcrypt and jwt
  app.bcrypt = bcrypt;
  app.jwt = jwt;
  
  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email) {
        return res.status(400).json({ errors: [{ path: 'email', msg: 'Valid email is required' }] });
      }
      
      if (!password) {
        return res.status(400).json({ errors: [{ path: 'password', msg: 'Password is required' }] });
      }
      
      const user = await app.models.User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        'jwt_secret',
        { expiresIn: '1h' }
      );
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  });
  
  // Auth validation route
  app.get('/api/auth/validate-invitation', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
      
      const user = await app.models.User.findOne({
        where: {
          invitation_token: token,
          status: 'pending'
        }
      });
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired invitation token' });
      }
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Validate invitation token error:', error);
      res.status(500).json({ message: 'Server error during token validation' });
    }
  });
  
  // Companies routes
  app.get('/api/companies', async (req, res) => {
    try {
      // Check for authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const companies = await app.models.Company.findAll();
      res.json(companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ message: 'Server error while fetching companies' });
    }
  });
  
  app.get('/api/companies/:id', async (req, res) => {
    try {
      // Check for authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const company = await app.models.Company.findByPk(req.params.id);
      
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      
      res.json(company);
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({ message: 'Server error while fetching company' });
    }
  });
  
  app.post('/api/companies', async (req, res) => {
    try {
      // Check for authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }
      
      const company = await app.models.Company.create(req.body);
      res.status(201).json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({ message: 'Server error while creating company' });
    }
  });
  
  app.put('/api/companies/:id', async (req, res) => {
    try {
      // Check for authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const company = await app.models.Company.findByPk(req.params.id);
      
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      
      await company.update(req.body);
      res.json(company);
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({ message: 'Server error while updating company' });
    }
  });
  
  app.delete('/api/companies/:id', async (req, res) => {
    try {
      // Check for authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const company = await app.models.Company.findByPk(req.params.id);
      
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      
      await company.destroy();
      res.json({ message: 'Company deleted successfully' });
    } catch (error) {
      console.error('Error deleting company:', error);
      res.status(500).json({ message: 'Server error while deleting company' });
    }
  });
  
  return app;
};

module.exports = createMockApp;
