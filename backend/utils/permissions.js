/**
 * Enhanced permission system for JamesCRM
 */

// Define permission constants
const PERMISSIONS = {
  // User permissions
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_INVITE: 'user:invite',
  
  // Company permissions
  COMPANY_VIEW: 'company:view',
  COMPANY_CREATE: 'company:create',
  COMPANY_EDIT: 'company:edit',
  COMPANY_DELETE: 'company:delete',
  
  // Contact permissions
  CONTACT_VIEW: 'contact:view',
  CONTACT_CREATE: 'contact:create',
  CONTACT_EDIT: 'contact:edit',
  CONTACT_DELETE: 'contact:delete',
  
  // Deal permissions
  DEAL_VIEW: 'deal:view',
  DEAL_CREATE: 'deal:create',
  DEAL_EDIT: 'deal:edit',
  DEAL_DELETE: 'deal:delete',
  
  // Quote permissions
  QUOTE_VIEW: 'quote:view',
  QUOTE_CREATE: 'quote:create',
  QUOTE_EDIT: 'quote:edit',
  QUOTE_DELETE: 'quote:delete',
  QUOTE_APPROVE: 'quote:approve',
  
  // Activity permissions
  ACTIVITY_VIEW: 'activity:view',
  ACTIVITY_CREATE: 'activity:create',
  ACTIVITY_EDIT: 'activity:edit',
  ACTIVITY_DELETE: 'activity:delete',
  
  // Report permissions
  REPORT_VIEW: 'report:view',
  REPORT_CREATE: 'report:create',
  REPORT_EXPORT: 'report:export',
  
  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  
  // System permissions
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore'
};

// Define role permission mappings
const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS), // Admins have all permissions
  
  manager: [
    // User permissions
    PERMISSIONS.USER_VIEW,
    
    // Company permissions
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.COMPANY_CREATE,
    PERMISSIONS.COMPANY_EDIT,
    
    // Contact permissions
    PERMISSIONS.CONTACT_VIEW,
    PERMISSIONS.CONTACT_CREATE,
    PERMISSIONS.CONTACT_EDIT,
    
    // Deal permissions
    PERMISSIONS.DEAL_VIEW,
    PERMISSIONS.DEAL_CREATE,
    PERMISSIONS.DEAL_EDIT,
    
    // Quote permissions
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.QUOTE_CREATE,
    PERMISSIONS.QUOTE_EDIT,
    PERMISSIONS.QUOTE_APPROVE,
    
    // Activity permissions
    PERMISSIONS.ACTIVITY_VIEW,
    PERMISSIONS.ACTIVITY_CREATE,
    PERMISSIONS.ACTIVITY_EDIT,
    PERMISSIONS.ACTIVITY_DELETE,
    
    // Report permissions
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_CREATE,
    PERMISSIONS.REPORT_EXPORT,
    
    // Settings permissions
    PERMISSIONS.SETTINGS_VIEW
  ],
  
  user: [
    // Company permissions
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.COMPANY_CREATE,
    
    // Contact permissions
    PERMISSIONS.CONTACT_VIEW,
    PERMISSIONS.CONTACT_CREATE,
    PERMISSIONS.CONTACT_EDIT,
    
    // Deal permissions
    PERMISSIONS.DEAL_VIEW,
    PERMISSIONS.DEAL_CREATE,
    PERMISSIONS.DEAL_EDIT,
    
    // Quote permissions
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.QUOTE_CREATE,
    PERMISSIONS.QUOTE_EDIT,
    
    // Activity permissions
    PERMISSIONS.ACTIVITY_VIEW,
    PERMISSIONS.ACTIVITY_CREATE,
    PERMISSIONS.ACTIVITY_EDIT,
    
    // Report permissions
    PERMISSIONS.REPORT_VIEW
  ]
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role property
 * @param {String} permission - Permission to check
 * @returns {Boolean} Whether the user has the permission
 */
const hasPermission = (user, permission) => {
  if (!user || !user.role) {
    return false;
  }
  
  // Get permissions for the user's role
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  
  // Check if the permission is in the role's permissions
  return rolePermissions.includes(permission);
};

/**
 * Get all permissions for a user
 * @param {Object} user - User object with role property
 * @returns {Array} Array of permission strings
 */
const getUserPermissions = (user) => {
  if (!user || !user.role) {
    return [];
  }
  
  return ROLE_PERMISSIONS[user.role] || [];
};

/**
 * Middleware to check if a user has a specific permission
 * @param {String} permission - Permission to check
 * @returns {Function} Express middleware function
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

/**
 * Middleware to check if a user has any of the specified permissions
 * @param {Array} permissions - Array of permissions to check
 * @returns {Function} Express middleware function
 */
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userPermissions = getUserPermissions(req.user);
    const hasAnyPermission = permissions.some(permission => userPermissions.includes(permission));
    
    if (!hasAnyPermission) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

/**
 * Middleware to check if a user has all of the specified permissions
 * @param {Array} permissions - Array of permissions to check
 * @returns {Function} Express middleware function
 */
const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userPermissions = getUserPermissions(req.user);
    const hasAllPermissions = permissions.every(permission => userPermissions.includes(permission));
    
    if (!hasAllPermissions) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  getUserPermissions,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions
};
