/**
 * Express application for testing
 */

const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  if (req.headers.authorization === 'Bearer valid-token') {
    req.user = { id: 1, email: 'john.doe@example.com', role: 'admin' };
    next();
  } else if (req.path.startsWith('/api/auth')) {
    next();
  } else {
    res.status(401).json({ message: 'Authentication required' });
  }
});

// Mock routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  if (email === 'john.doe@example.com' && password === 'password123') {
    return res.json({
      token: 'valid-token',
      user: {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        role: 'admin',
      },
    });
  }
  
  res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/api/auth/validate-invitation', (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  
  if (token === 'valid-token') {
    return res.json({
      email: 'pending.user@example.com',
      token: 'valid-token',
    });
  }
  
  res.status(400).json({ message: 'Invalid or expired invitation token' });
});

app.post('/api/auth/complete-registration', (req, res) => {
  const { token, first_name, last_name, password } = req.body;
  
  if (!token || !first_name || !last_name || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (token === 'valid-token') {
    return res.json({
      token: 'valid-token',
      user: {
        id: 4,
        first_name,
        last_name,
        email: 'pending.user@example.com',
        role: 'user',
      },
    });
  }
  
  res.status(400).json({ message: 'Invalid or expired invitation token' });
});

app.get('/api/companies', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Acme Corporation',
      industry: 'Technology',
      created_by: 1,
    },
    {
      id: 2,
      name: 'Globex Corporation',
      industry: 'Manufacturing',
      created_by: 1,
    },
  ]);
});

app.get('/api/companies/:id', (req, res) => {
  const { id } = req.params;
  
  if (id === '1') {
    return res.json({
      id: 1,
      name: 'Acme Corporation',
      industry: 'Technology',
      created_by: 1,
    });
  }
  
  res.status(404).json({ message: 'Company not found' });
});

app.post('/api/companies', (req, res) => {
  const { name, industry } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  res.status(201).json({
    id: 3,
    name,
    industry,
    created_by: req.user.id,
  });
});

app.put('/api/companies/:id', (req, res) => {
  const { id } = req.params;
  const { name, industry } = req.body;
  
  if (id === '1') {
    return res.json({
      id: 1,
      name: name || 'Acme Corporation',
      industry: industry || 'Technology',
      created_by: 1,
    });
  }
  
  res.status(404).json({ message: 'Company not found' });
});

app.delete('/api/companies/:id', (req, res) => {
  const { id } = req.params;
  
  if (id === '1') {
    return res.json({ message: 'Company deleted successfully' });
  }
  
  res.status(404).json({ message: 'Company not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
