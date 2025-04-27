/**
 * Query optimization utilities for MongoDB
 */
const mongoose = require('mongoose');

/**
 * Creates a lean query for better performance when you don't need the full Mongoose document
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query conditions
 * @param {Object} projection - Fields to include/exclude
 * @param {Object} options - Query options
 * @returns {Query} Mongoose query
 */
const createLeanQuery = (model, query = {}, projection = null, options = {}) => {
  return model.find(query, projection, { lean: true, ...options });
};

/**
 * Creates a paginated query with proper skip/limit optimization
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query conditions
 * @param {Object} options - Pagination options
 * @returns {Promise} Promise resolving to paginated results
 */
const createPaginatedQuery = async (model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    projection = null,
    populate = null,
    lean = true
  } = options;

  const skip = (page - 1) * limit;
  
  // Create base query
  let queryBuilder = model.find(query);
  
  // Apply projection if provided
  if (projection) {
    queryBuilder = queryBuilder.select(projection);
  }
  
  // Apply pagination
  queryBuilder = queryBuilder.skip(skip).limit(limit).sort(sort);
  
  // Apply population if needed
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(field => {
        queryBuilder = queryBuilder.populate(field);
      });
    } else {
      queryBuilder = queryBuilder.populate(populate);
    }
  }
  
  // Use lean for better performance if requested
  if (lean) {
    queryBuilder = queryBuilder.lean();
  }
  
  // Execute query and count in parallel
  const [results, totalCount] = await Promise.all([
    queryBuilder.exec(),
    model.countDocuments(query)
  ]);
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    results,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  };
};

/**
 * Optimizes a query by ensuring proper index usage
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query conditions
 * @param {Object} options - Query options
 * @returns {Object} Optimized query info
 */
const analyzeQueryPerformance = async (model, query = {}, options = {}) => {
  const { projection = null, sort = null } = options;
  
  // Create explain query
  let explainQuery = model.find(query);
  
  if (projection) {
    explainQuery = explainQuery.select(projection);
  }
  
  if (sort) {
    explainQuery = explainQuery.sort(sort);
  }
  
  // Get explain plan
  const explainPlan = await explainQuery.explain('executionStats');
  
  // Extract relevant performance metrics
  const executionStats = explainPlan.executionStats;
  const indexUsage = explainPlan.queryPlanner.winningPlan.inputStage.indexName || 'No index used';
  
  return {
    executionTimeMillis: executionStats.executionTimeMillis,
    totalDocsExamined: executionStats.totalDocsExamined,
    totalKeysExamined: executionStats.totalKeysExamined,
    indexUsage,
    isOptimal: executionStats.totalDocsExamined === executionStats.nReturned,
    suggestedIndexes: getSuggestedIndexes(model, query, sort)
  };
};

/**
 * Suggests indexes based on query patterns
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query conditions
 * @param {Object} sort - Sort conditions
 * @returns {Array} Suggested indexes
 */
const getSuggestedIndexes = (model, query, sort) => {
  const suggestedIndexes = [];
  const queryFields = Object.keys(query);
  
  // If we have query fields and sort, suggest a compound index
  if (queryFields.length > 0 && sort) {
    const sortFields = Object.keys(sort);
    if (sortFields.length > 0) {
      suggestedIndexes.push([...queryFields, ...sortFields]);
    }
  }
  
  // Suggest individual field indexes for query fields
  queryFields.forEach(field => {
    // Skip _id as it's already indexed
    if (field !== '_id') {
      suggestedIndexes.push([field]);
    }
  });
  
  // Suggest sort field indexes
  if (sort) {
    const sortFields = Object.keys(sort);
    sortFields.forEach(field => {
      if (field !== '_id' && !suggestedIndexes.some(idx => idx.includes(field))) {
        suggestedIndexes.push([field]);
      }
    });
  }
  
  return suggestedIndexes;
};

/**
 * Creates indexes for a model based on common query patterns
 * @param {Object} model - Mongoose model
 * @param {Array} indexes - Array of index definitions
 * @returns {Promise} Promise resolving when indexes are created
 */
const createOptimalIndexes = async (model, indexes) => {
  const results = [];
  
  for (const index of indexes) {
    try {
      if (Array.isArray(index)) {
        // Handle array format [field1, field2]
        const indexSpec = index.reduce((spec, field) => {
          spec[field] = 1;
          return spec;
        }, {});
        
        await model.collection.createIndex(indexSpec);
        results.push({ index, success: true });
      } else if (typeof index === 'object') {
        // Handle object format { field1: 1, field2: -1 }
        await model.collection.createIndex(index);
        results.push({ index, success: true });
      } else {
        // Handle string format "field"
        await model.collection.createIndex({ [index]: 1 });
        results.push({ index, success: true });
      }
    } catch (error) {
      results.push({ index, success: false, error: error.message });
    }
  }
  
  return results;
};

module.exports = {
  createLeanQuery,
  createPaginatedQuery,
  analyzeQueryPerformance,
  getSuggestedIndexes,
  createOptimalIndexes
};
