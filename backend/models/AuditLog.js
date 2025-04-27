/**
 * Audit Log model for tracking system actions
 */
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  // User who performed the action
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    name: String
  },
  
  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'READ', 'UPDATE', 'DELETE', 
      'LOGIN', 'LOGOUT', 'FAILED_LOGIN',
      'PERMISSION_CHANGE', 'SETTINGS_CHANGE',
      'PASSWORD_RESET', 'PASSWORD_CHANGE',
      'EXPORT', 'IMPORT', 'SYSTEM_EVENT'
    ]
  },
  
  // Entity that was acted upon
  entity: {
    type: {
      type: String,
      required: true,
      enum: [
        'USER', 'COMPANY', 'CONTACT', 'DEAL', 
        'QUOTE', 'ACTIVITY', 'SYSTEM', 'SETTINGS'
      ]
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  
  // Changes made (for UPDATE actions)
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  
  // Additional details about the action
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // IP address of the user
  ipAddress: String,
  
  // User agent information
  userAgent: String,
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
AuditLogSchema.index({ 'user.id': 1 });
AuditLogSchema.index({ 'entity.type': 1, 'entity.id': 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
