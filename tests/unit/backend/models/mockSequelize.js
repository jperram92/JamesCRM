/**
 * Mock Sequelize for testing models
 */

const { Sequelize, DataTypes } = require('sequelize');

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
const User = require('../../../../server/src/models/user')(sequelize, DataTypes);

// Define the Company model
const Company = require('../../../../server/src/models/company')(sequelize, DataTypes);

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
User.associate({ Company, Contact, Deal, Task, Activity });
Company.associate({ User, Contact, Deal, Document, Note });

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
