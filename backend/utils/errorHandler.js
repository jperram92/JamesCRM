/**
 * Centralized error handling utilities for JamesCRM
 */

// Custom error class for API errors
class APIError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
const ErrorTypes = {
  VALIDATION_ERROR: 'ValidationError',
  AUTHENTICATION_ERROR: 'AuthenticationError',
  AUTHORIZATION_ERROR: 'AuthorizationError',
  NOT_FOUND_ERROR: 'NotFoundError',
  DATABASE_ERROR: 'DatabaseError',
  EXTERNAL_SERVICE_ERROR: 'ExternalServiceError',
  INTERNAL_SERVER_ERROR: 'InternalServerError'
};

// Error handler middleware
const errorHandlerMiddleware = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    details: err.details || {},
    path: req.path,
    method: req.method,
    user: req.user ? req.user._id || req.user.id : 'unauthenticated'
  });

  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Prepare response based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const response = {
    success: false,
    error: {
      message,
      type: err.name || ErrorTypes.INTERNAL_SERVER_ERROR
    }
  };

  // Add details in development mode or if explicitly provided
  if (isDevelopment || err.details) {
    response.error.details = err.details || {};
  }

  // Add stack trace in development mode
  if (isDevelopment) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// Helper functions for common errors
const createNotFoundError = (resource = 'Resource') => {
  return new APIError(`${resource} not found`, 404, { resource });
};

const createValidationError = (details) => {
  return new APIError('Validation error', 400, details);
};

const createAuthenticationError = (message = 'Authentication required') => {
  return new APIError(message, 401);
};

const createAuthorizationError = (message = 'Insufficient permissions') => {
  return new APIError(message, 403);
};

const createDatabaseError = (originalError) => {
  return new APIError(
    'Database operation failed', 
    500, 
    process.env.NODE_ENV === 'development' ? { originalError: originalError.message } : null
  );
};

module.exports = {
  APIError,
  ErrorTypes,
  errorHandlerMiddleware,
  createNotFoundError,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createDatabaseError
};
