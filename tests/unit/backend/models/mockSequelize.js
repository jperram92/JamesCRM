/**
 * Mock Sequelize for testing models
 */

// Import mock Sequelize module
const { Sequelize, DataTypes } = require('../../../mocks/modules/sequelize');

// Create an in-memory SQLite database for testing
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',  // Use in-memory SQLite database
  logging: false,       // Disable logging
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  role: DataTypes.ENUM('admin', 'user'),
  status: DataTypes.ENUM('active', 'inactive', 'pending'),
  invitation_token: DataTypes.STRING,
  invitation_expires: DataTypes.DATE
});

// Add mock methods
User.associate = jest.fn();
User.findOne = jest.fn();
User.create = jest.fn();
User.update = jest.fn();
User.destroy = jest.fn();

// Define the Company model
const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  industry: DataTypes.STRING,
  website: DataTypes.STRING,
  phone: DataTypes.STRING,
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  zip_code: DataTypes.STRING,
  country: DataTypes.STRING,
  description: DataTypes.TEXT,
  created_by: DataTypes.INTEGER
});

// Add mock methods
Company.associate = jest.fn();
Company.findOne = jest.fn();
Company.findByPk = jest.fn();
Company.findAll = jest.fn();
Company.create = jest.fn();
Company.update = jest.fn();
Company.destroy = jest.fn();

// Define mock models for associations
const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  company_id: DataTypes.INTEGER,
  owner_id: DataTypes.INTEGER
});

const Deal = sequelize.define('Deal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  amount: DataTypes.DECIMAL,
  stage: DataTypes.STRING,
  close_date: DataTypes.DATE,
  company_id: DataTypes.INTEGER,
  owner_id: DataTypes.INTEGER
});

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  due_date: DataTypes.DATE,
  status: DataTypes.STRING,
  assignee_id: DataTypes.INTEGER
});

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: DataTypes.STRING,
  description: DataTypes.TEXT,
  date: DataTypes.DATE,
  user_id: DataTypes.INTEGER
});

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  file_path: DataTypes.STRING,
  file_type: DataTypes.STRING,
  entity_type: DataTypes.STRING,
  entity_id: DataTypes.INTEGER
});

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: DataTypes.TEXT,
  entity_type: DataTypes.STRING,
  entity_id: DataTypes.INTEGER,
  user_id: DataTypes.INTEGER
});

// Set up associations
User.hasMany(Company, { foreignKey: 'created_by' });
Company.belongsTo(User, { foreignKey: 'created_by' });

Company.hasMany(Contact, { foreignKey: 'company_id' });
Contact.belongsTo(Company, { foreignKey: 'company_id' });

Company.hasMany(Deal, { foreignKey: 'company_id' });
Deal.belongsTo(Company, { foreignKey: 'company_id' });

// Mock the associate methods
User.associate = jest.fn();
Company.associate = jest.fn();

// Export the models and sequelize instance
module.exports = {
  sequelize,
  User,
  Company,
  Contact,
  Deal,
  Task,
  Activity,
  Document,
  Note
};
