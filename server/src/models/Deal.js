const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Deal = sequelize.define('Deal', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    stage: {
      type: DataTypes.ENUM('lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'),
      defaultValue: 'lead',
    },
    closeDate: {
      type: DataTypes.DATE,
    },
    probability: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 100,
      },
    },
    notes: {
      type: DataTypes.TEXT,
    },
  });

  return Deal;
};
