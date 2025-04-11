/**
 * Mock User model
 */

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    first_name: {
      type: DataTypes.STRING,
      allowNull: function() { return this.status !== 'pending'; },
      validate: {
        notEmpty: function() { return this.status !== 'pending'; }
      }
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: function() { return this.status !== 'pending'; },
      validate: {
        notEmpty: function() { return this.status !== 'pending'; }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: function() { return this.status !== 'active'; },
      validate: {
        notEmpty: function() { return this.status === 'active'; }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'user'),
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      defaultValue: 'pending'
    },
    invitation_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    invitation_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};
