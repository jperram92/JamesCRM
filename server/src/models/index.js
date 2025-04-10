const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Determine environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions,
  }
);

// Import models
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Company = require('./company')(sequelize, Sequelize.DataTypes);
const Contact = require('./contact')(sequelize, Sequelize.DataTypes);
const Deal = require('./deal')(sequelize, Sequelize.DataTypes);
const Activity = require('./activity')(sequelize, Sequelize.DataTypes);
const EmailDelivery = require('./emailDelivery')(sequelize, Sequelize.DataTypes);
const Invitation = require('./invitation')(sequelize, Sequelize.DataTypes);

// Define associations
User.hasMany(Company, { foreignKey: 'created_by', as: 'companies' });
Company.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Contact, { foreignKey: 'created_by', as: 'contacts' });
Contact.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Company.hasMany(Contact, { foreignKey: 'company_id', as: 'contacts' });
Contact.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Company.hasMany(Deal, { foreignKey: 'company_id', as: 'deals' });
Deal.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Contact.hasMany(Deal, { foreignKey: 'contact_id', as: 'deals' });
Deal.belongsTo(Contact, { foreignKey: 'contact_id', as: 'contact' });

User.hasMany(Deal, { foreignKey: 'owner_id', as: 'deals' });
Deal.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Contact.hasMany(Activity, { foreignKey: 'contact_id', as: 'activities' });
Activity.belongsTo(Contact, { foreignKey: 'contact_id', as: 'contact' });

Company.hasMany(Activity, { foreignKey: 'company_id', as: 'activities' });
Activity.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Deal.hasMany(Activity, { foreignKey: 'deal_id', as: 'activities' });
Activity.belongsTo(Deal, { foreignKey: 'deal_id', as: 'deal' });

User.hasMany(Activity, { foreignKey: 'assigned_to', as: 'assignedActivities' });
Activity.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

User.hasMany(Activity, { foreignKey: 'created_by', as: 'createdActivities' });
Activity.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Define additional associations
User.hasMany(EmailDelivery, { foreignKey: 'user_id', as: 'emailDeliveries' });
EmailDelivery.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Invitation, { foreignKey: 'user_id', as: 'invitations' });
Invitation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Invitation, { foreignKey: 'invited_by', as: 'sentInvitations' });
Invitation.belongsTo(User, { foreignKey: 'invited_by', as: 'inviter' });

EmailDelivery.hasOne(Invitation, { foreignKey: 'email_delivery_id', as: 'invitation' });
Invitation.belongsTo(EmailDelivery, { foreignKey: 'email_delivery_id', as: 'emailDelivery' });

// Export models and Sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  Company,
  Contact,
  Deal,
  Activity,
  EmailDelivery,
  Invitation,
};
