/**
 * Mock implementation of sequelize module
 */

// Mock Sequelize class
class MockSequelize {
  constructor(options) {
    this.options = options;
  }

  define(modelName, attributes, options = {}) {
    const model = {
      modelName,
      attributes,
      options,
      associate: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),

      // Association methods
      hasMany: jest.fn().mockReturnThis(),
      belongsTo: jest.fn().mockReturnThis(),
      hasOne: jest.fn().mockReturnThis(),
      belongsToMany: jest.fn().mockReturnThis()
    };

    // Add instance methods
    model.prototype = {
      update: jest.fn().mockImplementation(function(data) {
        Object.assign(this, data);
        return Promise.resolve(this);
      }),
      destroy: jest.fn().mockImplementation(function() {
        return Promise.resolve(true);
      })
    };

    return model;
  }

  sync() {
    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }
}

// Mock DataTypes
const DataTypes = {
  STRING: 'STRING',
  TEXT: 'TEXT',
  INTEGER: 'INTEGER',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  DECIMAL: 'DECIMAL',
  ENUM: (...values) => ({ values })
};

module.exports = {
  Sequelize: MockSequelize,
  DataTypes
};
