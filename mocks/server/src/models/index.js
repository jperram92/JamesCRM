/**
 * Mock models index
 */

const { Sequelize } = require('sequelize');

// Create a test sequelize instance
const sequelize = new Sequelize('sqlite::memory:', { logging: false });

// Import models
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Company = require('./company')(sequelize, Sequelize.DataTypes);

// Define associations
User.hasMany(Company, { foreignKey: 'created_by', as: 'companies' });
Company.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Export models and Sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  Company,
  // Mock additional models
  Contact: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Deal: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Activity: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  EmailDelivery: {
    create: jest.fn().mockResolvedValue({
      id: 1,
      to: 'to@example.com',
      subject: 'Test Subject',
      status: 'sent',
    }),
  },
  Invitation: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
};
