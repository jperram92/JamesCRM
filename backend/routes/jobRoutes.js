/**
 * Job queue routes for JamesCRM
 */
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { requirePermission } = require('../utils/permissions');
const { PERMISSIONS } = require('../utils/permissions');
const {
  addJob,
  getQueue,
  getJobStatus,
  getJobs,
  getQueueStats,
  cleanQueue
} = require('../services/queueService');

/**
 * @route   GET /api/jobs/queues
 * @desc    Get all queues
 * @access  Admin only
 */
router.get('/queues', protect, requirePermission(PERMISSIONS.SYSTEM_LOGS), async (req, res) => {
  try {
    const queues = ['email', 'export', 'import', 'report', 'pdf', 'cleanup'];
    const stats = await Promise.all(queues.map(queue => getQueueStats(queue)));
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting queues:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/jobs/queues/:name
 * @desc    Get queue stats
 * @access  Admin only
 */
router.get('/queues/:name', protect, requirePermission(PERMISSIONS.SYSTEM_LOGS), async (req, res) => {
  try {
    const { name } = req.params;
    const stats = await getQueueStats(name);
    
    res.json(stats);
  } catch (error) {
    console.error(`Error getting queue ${req.params.name}:`, error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/jobs/queues/:name/jobs/:status
 * @desc    Get jobs in a queue by status
 * @access  Admin only
 */
router.get('/queues/:name/jobs/:status', protect, requirePermission(PERMISSIONS.SYSTEM_LOGS), async (req, res) => {
  try {
    const { name, status } = req.params;
    const { start = 0, end = 99 } = req.query;
    
    const jobs = await getJobs(name, status, parseInt(start), parseInt(end));
    
    res.json(jobs);
  } catch (error) {
    console.error(`Error getting jobs for queue ${req.params.name}:`, error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/jobs/:queue/:id
 * @desc    Get job status
 * @access  Admin only
 */
router.get('/:queue/:id', protect, requirePermission(PERMISSIONS.SYSTEM_LOGS), async (req, res) => {
  try {
    const { queue, id } = req.params;
    const status = await getJobStatus(queue, id);
    
    res.json(status);
  } catch (error) {
    console.error(`Error getting job ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/jobs/:queue
 * @desc    Add a job to a queue
 * @access  Admin only
 */
router.post('/:queue', protect, requirePermission(PERMISSIONS.SYSTEM_LOGS), async (req, res) => {
  try {
    const { queue } = req.params;
    const { data, options } = req.body;
    
    const job = await addJob(queue, data, options);
    
    res.json({
      id: job.id,
      queue,
      data: job.data,
      options: job.opts
    });
  } catch (error) {
    console.error(`Error adding job to queue ${req.params.queue}:`, error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/jobs/queues/:name/clean/:status
 * @desc    Clean a queue
 * @access  Admin only
 */
router.delete('/queues/:name/clean/:status', protect, requirePermission(PERMISSIONS.SYSTEM_LOGS), async (req, res) => {
  try {
    const { name, status } = req.params;
    const { grace = 5000 } = req.query;
    
    const count = await cleanQueue(name, status, parseInt(grace));
    
    res.json({
      queue: name,
      status,
      removed: count
    });
  } catch (error) {
    console.error(`Error cleaning queue ${req.params.name}:`, error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
