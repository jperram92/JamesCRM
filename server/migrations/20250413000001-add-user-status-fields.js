'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // All fields are already added in the initial migration
    // This migration is now a no-op
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    // No-op
    return Promise.resolve();
  }
};
