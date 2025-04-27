const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const emailService = require('./services/emailService');
const { errorHandlerMiddleware } = require('./utils/errorHandler');
const { auditMiddleware } = require('./services/auditService');
const { createAuthRateLimiter, createAuthEndpointRateLimiter } = require('./middleware/rateLimiter');
const cacheService = require('./services/cacheService');
const queueService = require('./services/queueService');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dealRoutes = require('./routes/dealRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const auditRoutes = require('./routes/auditRoutes');
const jobRoutes = require('./routes/jobRoutes');

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add audit logging middleware
app.use(auditMiddleware());

// Apply general rate limiter to all routes
app.use(createAuthRateLimiter());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import versioned API routes
const apiV1Routes = require('./routes/v1');

// API Routes - Legacy (unversioned) endpoints for backward compatibility
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/jobs', jobRoutes);

// Versioned API Routes
app.use('/api/v1', apiV1Routes);

// API information route
app.get('/api', (req, res) => {
  res.json({
    name: 'JamesCRM API',
    currentVersion: 'v1',
    versions: {
      v1: '/api/v1'
    },
    documentation: '/api/v1/docs'
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorHandlerMiddleware);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jamescrm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Initialize services and start server
const startServer = async () => {
  try {
    // Initialize email service
    await emailService.initializeTransporter();
    console.log('Email service initialized');

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// For development without MongoDB
if (process.env.NODE_ENV === 'development' && process.env.SKIP_MONGODB === 'true') {
  console.log('Skipping MongoDB connection for development');
  startServer();
} else {
  // Connect to MongoDB and start server
  connectDB().then(() => {
    startServer();
  }).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    console.log('Starting server without MongoDB...');
    startServer();
  });
}
