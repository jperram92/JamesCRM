/**
 * Queue service for background job processing in JamesCRM
 */
const Bull = require('bull');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Redis connection options
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: process.env.REDIS_QUEUE_DB || 1, // Use a different DB than cache
};

// Create queues
const emailQueue = new Bull('email', { redis: redisOptions });
const exportQueue = new Bull('export', { redis: redisOptions });
const importQueue = new Bull('import', { redis: redisOptions });
const reportQueue = new Bull('report', { redis: redisOptions });
const pdfQueue = new Bull('pdf', { redis: redisOptions });
const cleanupQueue = new Bull('cleanup', { redis: redisOptions });

// Configure queues
const configureQueue = (queue, concurrency = 1) => {
  // Set concurrency (number of jobs processed simultaneously)
  queue.process(concurrency, path.join(__dirname, '../jobs', `${queue.name}.js`));
  
  // Handle completed jobs
  queue.on('completed', (job, result) => {
    console.log(`Job ${queue.name}:${job.id} completed with result:`, result);
  });
  
  // Handle failed jobs
  queue.on('failed', (job, error) => {
    console.error(`Job ${queue.name}:${job.id} failed with error:`, error);
  });
  
  // Handle stalled jobs
  queue.on('stalled', (job) => {
    console.warn(`Job ${queue.name}:${job.id} stalled`);
  });
  
  return queue;
};

// Configure all queues
configureQueue(emailQueue, 5); // Higher concurrency for emails
configureQueue(exportQueue, 2);
configureQueue(importQueue, 1); // Lower concurrency for imports
configureQueue(reportQueue, 2);
configureQueue(pdfQueue, 3);
configureQueue(cleanupQueue, 1);

/**
 * Add a job to a queue
 * @param {String} queueName - Name of the queue
 * @param {Object} data - Job data
 * @param {Object} options - Job options
 * @returns {Promise<Job>} Created job
 */
const addJob = async (queueName, data, options = {}) => {
  // Get the queue
  const queue = getQueue(queueName);
  
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  // Add job to queue
  return queue.add(data, options);
};

/**
 * Get a queue by name
 * @param {String} queueName - Name of the queue
 * @returns {Bull} Queue instance
 */
const getQueue = (queueName) => {
  switch (queueName) {
    case 'email':
      return emailQueue;
    case 'export':
      return exportQueue;
    case 'import':
      return importQueue;
    case 'report':
      return reportQueue;
    case 'pdf':
      return pdfQueue;
    case 'cleanup':
      return cleanupQueue;
    default:
      return null;
  }
};

/**
 * Get job status
 * @param {String} queueName - Name of the queue
 * @param {String} jobId - Job ID
 * @returns {Promise<Object>} Job status
 */
const getJobStatus = async (queueName, jobId) => {
  const queue = getQueue(queueName);
  
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  const job = await queue.getJob(jobId);
  
  if (!job) {
    throw new Error(`Job ${jobId} not found in queue ${queueName}`);
  }
  
  const state = await job.getState();
  
  return {
    id: job.id,
    data: job.data,
    state,
    progress: job.progress,
    returnvalue: job.returnvalue,
    stacktrace: job.stacktrace,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    failedReason: job.failedReason
  };
};

/**
 * Get all jobs in a queue
 * @param {String} queueName - Name of the queue
 * @param {String} status - Job status (active, completed, failed, delayed, waiting)
 * @param {Number} start - Start index
 * @param {Number} end - End index
 * @returns {Promise<Array>} Jobs
 */
const getJobs = async (queueName, status = 'active', start = 0, end = 99) => {
  const queue = getQueue(queueName);
  
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  let jobs;
  
  switch (status) {
    case 'active':
      jobs = await queue.getActive(start, end);
      break;
    case 'completed':
      jobs = await queue.getCompleted(start, end);
      break;
    case 'failed':
      jobs = await queue.getFailed(start, end);
      break;
    case 'delayed':
      jobs = await queue.getDelayed(start, end);
      break;
    case 'waiting':
      jobs = await queue.getWaiting(start, end);
      break;
    default:
      throw new Error(`Invalid status: ${status}`);
  }
  
  return jobs.map(job => ({
    id: job.id,
    data: job.data,
    progress: job.progress,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    failedReason: job.failedReason
  }));
};

/**
 * Get queue statistics
 * @param {String} queueName - Name of the queue
 * @returns {Promise<Object>} Queue statistics
 */
const getQueueStats = async (queueName) => {
  const queue = getQueue(queueName);
  
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  const [
    jobCounts,
    failedCount,
    completedCount,
    activeCount,
    delayedCount,
    waitingCount
  ] = await Promise.all([
    queue.getJobCounts(),
    queue.getFailedCount(),
    queue.getCompletedCount(),
    queue.getActiveCount(),
    queue.getDelayedCount(),
    queue.getWaitingCount()
  ]);
  
  return {
    name: queue.name,
    counts: jobCounts,
    failed: failedCount,
    completed: completedCount,
    active: activeCount,
    delayed: delayedCount,
    waiting: waitingCount
  };
};

/**
 * Clean a queue
 * @param {String} queueName - Name of the queue
 * @param {String} status - Job status (completed, failed, delayed, active, waiting)
 * @param {Number} grace - Grace period in milliseconds
 * @returns {Promise<Number>} Number of removed jobs
 */
const cleanQueue = async (queueName, status = 'completed', grace = 5000) => {
  const queue = getQueue(queueName);
  
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  
  let count;
  
  switch (status) {
    case 'completed':
      count = await queue.clean(grace, 'completed');
      break;
    case 'failed':
      count = await queue.clean(grace, 'failed');
      break;
    case 'delayed':
      count = await queue.clean(grace, 'delayed');
      break;
    case 'active':
      count = await queue.clean(grace, 'active');
      break;
    case 'waiting':
      count = await queue.clean(grace, 'wait');
      break;
    default:
      throw new Error(`Invalid status: ${status}`);
  }
  
  return count;
};

// Export queues and functions
module.exports = {
  emailQueue,
  exportQueue,
  importQueue,
  reportQueue,
  pdfQueue,
  cleanupQueue,
  addJob,
  getQueue,
  getJobStatus,
  getJobs,
  getQueueStats,
  cleanQueue
};
