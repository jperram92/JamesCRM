/**
 * Audit log routes for JamesCRM
 */
const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../services/auditService');
const { protect, admin } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../utils/permissions');
const { requirePermission } = require('../utils/permissions');

/**
 * @route   GET /api/audit
 * @desc    Get audit logs with filtering and pagination
 * @access  Admin only
 */
router.get('/', protect, requirePermission(PERMISSIONS.SYSTEM_LOGS), async (req, res) => {
  try {
    const {
      userId,
      entityType,
      entityId,
      action,
      startDate,
      endDate,
      page,
      limit,
      sortField = 'timestamp',
      sortOrder = 'desc'
    } = req.query;
    
    // Create sort object
    const sort = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    
    // Get audit logs
    const result = await getAuditLogs({
      userId,
      entityType,
      entityId,
      action,
      startDate,
      endDate,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/audit/user/:userId
 * @desc    Get audit logs for a specific user
 * @access  Admin only
 */
router.get('/user/:userId', protect, requirePermission(PERMISSIONS.SYSTEM_LOGS), async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page,
      limit,
      sortField = 'timestamp',
      sortOrder = 'desc'
    } = req.query;
    
    // Create sort object
    const sort = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    
    // Get audit logs for user
    const result = await getAuditLogs({
      userId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error getting user audit logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/audit/entity/:entityType/:entityId
 * @desc    Get audit logs for a specific entity
 * @access  Admin only
 */
router.get('/entity/:entityType/:entityId', protect, requirePermission(PERMISSIONS.SYSTEM_LOGS), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const {
      page,
      limit,
      sortField = 'timestamp',
      sortOrder = 'desc'
    } = req.query;
    
    // Create sort object
    const sort = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    
    // Get audit logs for entity
    const result = await getAuditLogs({
      entityType,
      entityId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sort
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error getting entity audit logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
