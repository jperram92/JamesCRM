/**
 * Cache invalidation utilities for JamesCRM
 */
const { delByPattern } = require('../services/cacheService');

/**
 * Invalidate company-related caches
 * @param {String} companyId - Company ID (optional)
 * @returns {Promise<Boolean>} Success status
 */
const invalidateCompanyCaches = async (companyId) => {
  try {
    // If company ID is provided, invalidate only that company's caches
    if (companyId) {
      await Promise.all([
        delByPattern(`cache:/api/companies/${companyId}*`),
        delByPattern(`cache:/api/v1/companies/${companyId}*`),
        delByPattern(`cache:company:${companyId}*`)
      ]);
    } else {
      // Otherwise invalidate all company caches
      await Promise.all([
        delByPattern('cache:/api/companies*'),
        delByPattern('cache:/api/v1/companies*'),
        delByPattern('cache:company:*')
      ]);
    }
    return true;
  } catch (error) {
    console.error('Error invalidating company caches:', error);
    return false;
  }
};

/**
 * Invalidate contact-related caches
 * @param {String} contactId - Contact ID (optional)
 * @returns {Promise<Boolean>} Success status
 */
const invalidateContactCaches = async (contactId) => {
  try {
    // If contact ID is provided, invalidate only that contact's caches
    if (contactId) {
      await Promise.all([
        delByPattern(`cache:/api/contacts/${contactId}*`),
        delByPattern(`cache:/api/v1/contacts/${contactId}*`),
        delByPattern(`cache:contact:${contactId}*`)
      ]);
    } else {
      // Otherwise invalidate all contact caches
      await Promise.all([
        delByPattern('cache:/api/contacts*'),
        delByPattern('cache:/api/v1/contacts*'),
        delByPattern('cache:contact:*')
      ]);
    }
    return true;
  } catch (error) {
    console.error('Error invalidating contact caches:', error);
    return false;
  }
};

/**
 * Invalidate deal-related caches
 * @param {String} dealId - Deal ID (optional)
 * @returns {Promise<Boolean>} Success status
 */
const invalidateDealCaches = async (dealId) => {
  try {
    // If deal ID is provided, invalidate only that deal's caches
    if (dealId) {
      await Promise.all([
        delByPattern(`cache:/api/deals/${dealId}*`),
        delByPattern(`cache:/api/v1/deals/${dealId}*`),
        delByPattern(`cache:deal:${dealId}*`)
      ]);
    } else {
      // Otherwise invalidate all deal caches
      await Promise.all([
        delByPattern('cache:/api/deals*'),
        delByPattern('cache:/api/v1/deals*'),
        delByPattern('cache:deal:*')
      ]);
    }
    return true;
  } catch (error) {
    console.error('Error invalidating deal caches:', error);
    return false;
  }
};

/**
 * Invalidate user-related caches
 * @param {String} userId - User ID (optional)
 * @returns {Promise<Boolean>} Success status
 */
const invalidateUserCaches = async (userId) => {
  try {
    // If user ID is provided, invalidate only that user's caches
    if (userId) {
      await Promise.all([
        delByPattern(`cache:/api/users/${userId}*`),
        delByPattern(`cache:/api/v1/users/${userId}*`),
        delByPattern(`cache:user:${userId}*`)
      ]);
    } else {
      // Otherwise invalidate all user caches
      await Promise.all([
        delByPattern('cache:/api/users*'),
        delByPattern('cache:/api/v1/users*'),
        delByPattern('cache:user:*')
      ]);
    }
    return true;
  } catch (error) {
    console.error('Error invalidating user caches:', error);
    return false;
  }
};

module.exports = {
  invalidateCompanyCaches,
  invalidateContactCaches,
  invalidateDealCaches,
  invalidateUserCaches
};
