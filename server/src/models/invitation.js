module.exports = (sequelize, DataTypes) => {
  const Invitation = sequelize.define('Invitation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'The user who was invited',
    },
    invited_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'The user who sent the invitation',
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status of invitation (pending, accepted, expired, revoked)',
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'user',
      comment: 'Role assigned to the invited user',
    },
    email_delivery_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'email_deliveries',
        key: 'id',
      },
      comment: 'Reference to the email delivery record',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When the invitation expires',
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the invitation was accepted',
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
    tableName: 'invitations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Invitation;
};
