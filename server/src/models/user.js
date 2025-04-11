/**
 * User model definition
 */

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
      validate: {
        isIn: {
          args: [['user', 'admin']],
          msg: 'Role must be either user or admin'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending', 'invited'),
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'inactive', 'pending', 'invited']],
          msg: 'Status must be active, inactive, pending, or invited'
        }
      }
    },
    invitation_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    invitation_token_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'users'
  });

  // Define associations
  User.associate = (models) => {
    User.hasMany(models.Company, { foreignKey: 'owner_id' });
    User.hasMany(models.Contact, { foreignKey: 'owner_id' });
    User.hasMany(models.Deal, { foreignKey: 'owner_id' });
    User.hasMany(models.Task, { foreignKey: 'assignee_id' });
    User.hasMany(models.Activity, { foreignKey: 'user_id' });
  };

  return User;
};
