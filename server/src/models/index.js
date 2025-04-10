const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'jamescrm',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

const db = {
  sequelize,
  Sequelize,
};

// Import models
db.User = require('./User')(sequelize);
db.Company = require('./Company')(sequelize);
db.Contact = require('./Contact')(sequelize);
db.Deal = require('./Deal')(sequelize);

// Define associations
db.Company.hasMany(db.Contact);
db.Contact.belongsTo(db.Company);

db.Company.hasMany(db.Deal);
db.Deal.belongsTo(db.Company);

db.Contact.hasMany(db.Deal);
db.Deal.belongsTo(db.Contact);

db.User.hasMany(db.Deal);
db.Deal.belongsTo(db.User, { as: 'owner' });

module.exports = db;
