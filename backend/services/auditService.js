/**
 * Audit logging service for JamesCRM
 */
const AuditLog = require('../models/AuditLog');

/**
 * Log an action in the audit log
 * @param {Object} options - Audit log options
 * @returns {Promise<Object>} Created audit log entry
 */
const logAction = async (options) => {
  const {
    user,
    action,
    entityType,
    entityId,
    entityName,
    changes,
    details,
    ipAddress,
    userAgent
  } = options;
  
  try {
    // Create audit log entry
    const auditLog = await AuditLog.create({
      user: user ? {
        id: user._id || user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim()
      } : null,
      action,
      entity: {
        type: entityType,
        id: entityId,
        name: entityName
      },
      changes,
      details,
      ipAddress,
      userAgent
    });
    
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit logging should not break the main flow
    return null;
  }
};

/**
 * Log a create action
 * @param {Object} options - Audit log options
 * @returns {Promise<Object>} Created audit log entry
 */
const logCreate = async (options) => {
  return logAction({
    ...options,
    action: 'CREATE',
    changes: {
      after: options.entity
    }
  });
};

/**
 * Log an update action
 * @param {Object} options - Audit log options
 * @returns {Promise<Object>} Created audit log entry
 */
const logUpdate = async (options) => {
  return logAction({
    ...options,
    action: 'UPDATE'
  });
};

/**
 * Log a delete action
 * @param {Object} options - Audit log options
 * @returns {Promise<Object>} Created audit log entry
 */
const logDelete = async (options) => {
  return logAction({
    ...options,
    action: 'DELETE',
    changes: {
      before: options.entity
    }
  });
};

/**
 * Log a login action
 * @param {Object} options - Audit log options
 * @returns {Promise<Object>} Created audit log entry
 */
const logLogin = async (options) => {
  return logAction({
    ...options,
    action: 'LOGIN',
    entityType: 'USER',
    entityId: options.user?._id || options.user?.id,
    entityName: options.user?.email
  });
};

/**
 * Log a failed login attempt
 * @param {Object} options - Audit log options
 * @returns {Promise<Object>} Created audit log entry
 */
const logFailedLogin = async (options) => {
  return logAction({
    ...options,
    action: 'FAILED_LOGIN',
    entityType: 'USER',
    entityName: options.email || 'Unknown'
  });
};

/**
 * Log a logout action
 * @param {Object} options - Audit log options
 * @returns {Promise<Object>} Created audit log entry
 */
const logLogout = async (options) => {
  return logAction({
    ...options,
    action: 'LOGOUT',
    entityType: 'USER',
    entityId: options.user?._id || options.user?.id,
    entityName: options.user?.email
  });
};

/**
 * Log a permission change
 * @param {Object} options - Audit log options
 * @returns {Promise<Object>} Created audit log entry
 */
const logPermissionChange = async (options) => {
  return logAction({
    ...options,
    action: 'PERMISSION_CHANGE',
    entityType: 'USER',
    entityId: options.targetUser?._id || options.targetUser?.id,
    entityName: options.targetUser?.email
  });
};

/**
 * Create middleware for audit logging
 * @returns {Function} Express middleware function
 */
const auditMiddleware = () => {
  return (req, res, next) => {
    // Store original end method
    const originalEnd = res.end;
    
    // Override end method to log after response is sent
    res.end = function(...args) {
      // Call original end method
      originalEnd.apply(res, args);
      
      // Don't log for certain paths (e.g., health checks, static files)
      const skipPaths = ['/health', '/favicon.ico', '/static'];
      if (skipPaths.some(path => req.path.startsWith(path))) {
        return;
      }
      
      // Determine action based on HTTP method
      let action;
      switch (req.method) {
        case 'GET':
          action = 'READ';
          break;
        case 'POST':
          action = 'CREATE';
          break;
        case 'PUT':
        case 'PATCH':
          action = 'UPDATE';
          break;
        case 'DELETE':
          action = 'DELETE';
          break;
        default:
          action = 'SYSTEM_EVENT';
      }
      
      // Determine entity type from path
      let entityType = 'SYSTEM';
      if (req.path.includes('/users')) entityType = 'USER';
      else if (req.path.includes('/companies')) entityType = 'COMPANY';
      else if (req.path.includes('/contacts')) entityType = 'CONTACT';
      else if (req.path.includes('/deals')) entityType = 'DEAL';
      else if (req.path.includes('/quotes')) entityType = 'QUOTE';
      else if (req.path.includes('/activities')) entityType = 'ACTIVITY';
      else if (req.path.includes('/settings')) entityType = 'SETTINGS';
      
      // Extract entity ID from path
      const pathParts = req.path.split('/');
      const entityId = pathParts.length > 2 ? pathParts[2] : null;
      
      // Log the action
      logAction({
        user: req.user,
        action,
        entityType,
        entityId: entityId && entityId.match(/^[0-9a-fA-F]{24}$/) ? entityId : null,
        details: {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          query: req.query,
          body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }).catch(err => console.error('Error in audit middleware:', err));
    };
    
    next();
  };
};

/**
 * Sanitize request body to remove sensitive information
 * @param {Object} body - Request body
 * @returns {Object} Sanitized body
 */
const sanitizeRequestBody = (body) => {
  if (!body) return {};
  
  // Create a copy of the body
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeRequestBody(sanitized[key]);
    }
  });
  
  return sanitized;
};

/**
 * Get audit logs with filtering and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated audit logs
 */
const getAuditLogs = async (options) => {
  const {
    userId,
    entityType,
    entityId,
    action,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sort = { timestamp: -1 }
  } = options;
  
  // Build query
  const query = {};
  
  if (userId) {
    query['user.id'] = userId;
  }
  
  if (entityType) {
    query['entity.type'] = entityType;
  }
  
  if (entityId) {
    query['entity.id'] = entityId;
  }
  
  if (action) {
    query.action = action;
  }
  
  // Date range
  if (startDate || endDate) {
    query.timestamp = {};
    
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Execute query
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query)
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  
  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

module.exports = {
  logAction,
  logCreate,
  logUpdate,
  logDelete,
  logLogin,
  logFailedLogin,
  logLogout,
  logPermissionChange,
  auditMiddleware,
  getAuditLogs
};
