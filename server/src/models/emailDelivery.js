module.exports = (sequelize, DataTypes) => {
  const EmailDelivery = sequelize.define('EmailDelivery', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'User associated with this email (if applicable)',
    },
    email_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Type of email (invitation, password_reset, etc.)',
    },
    recipient: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status of email delivery (pending, delivered, failed, etc.)',
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Email service provider (sendgrid, mailgun, smtp)',
    },
    provider_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Message ID from the email provider',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    opened_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    clicked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'email_deliveries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return EmailDelivery;
};
