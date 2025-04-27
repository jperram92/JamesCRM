const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { PERMISSIONS } = require('../utils/permissions');
const { validatePassword } = require('../utils/passwordValidator');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: function() { return this.status !== 'pending'; }
  },
  lastName: {
    type: String,
    required: function() { return this.status !== 'pending'; }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() { return this.status === 'active'; },
    validate: {
      validator: function(password) {
        // Skip validation for hashed passwords (when loading from DB)
        if (password && password.startsWith('$2a$') || password.startsWith('$2b$')) {
          return true;
        }

        // Validate password strength
        const validation = validatePassword(password);
        return validation.isValid;
      },
      message: props => {
        const validation = validatePassword(props.value);
        return validation.errors.join(', ');
      }
    }
  },
  passwordHistory: {
    type: [String],
    default: [],
    select: false
  },
  passwordLastChanged: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'user'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  // Custom permissions that override role-based permissions
  customPermissions: {
    type: [String],
    default: [],
    validate: {
      validator: function(permissions) {
        // Ensure all permissions are valid
        return permissions.every(permission =>
          Object.values(PERMISSIONS).includes(permission)
        );
      },
      message: props => `${props.value} contains invalid permissions`
    }
  },
  // Permissions that are explicitly denied for this user
  deniedPermissions: {
    type: [String],
    default: [],
    validate: {
      validator: function(permissions) {
        // Ensure all permissions are valid
        return permissions.every(permission =>
          Object.values(PERMISSIONS).includes(permission)
        );
      },
      message: props => `${props.value} contains invalid permissions`
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      }
    },
    dashboardLayout: {
      type: String,
      default: 'default'
    }
  },
  invitationToken: String,
  invitationExpires: Date,
  lastLogin: {
    type: Date,
    default: null
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  accountLockedUntil: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    // Check if the new password is in the password history
    if (this.passwordHistory && this.passwordHistory.length > 0) {
      // Check against the last 5 passwords
      const passwordsToCheck = this.passwordHistory.slice(-5);

      for (const oldPassword of passwordsToCheck) {
        const isMatch = await bcrypt.compare(this.password, oldPassword);
        if (isMatch) {
          const error = new Error('Password has been used recently. Please choose a different password.');
          return next(error);
        }
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(this.password, 10);

    // Add the current password to the history
    if (!this.passwordHistory) {
      this.passwordHistory = [];
    }

    // Add the new hashed password to history
    this.passwordHistory.push(hashedPassword);

    // Keep only the last 10 passwords in history
    if (this.passwordHistory.length > 10) {
      this.passwordHistory = this.passwordHistory.slice(-10);
    }

    // Update the password and last changed date
    this.password = hashedPassword;
    this.passwordLastChanged = Date.now();
  }

  next();
});

// Method to check if password matches
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add updatedAt timestamp before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if user has a specific permission
UserSchema.methods.hasPermission = function(permission) {
  const { getUserPermissions } = require('../utils/permissions');

  // Get all permissions based on role
  const rolePermissions = getUserPermissions({ role: this.role });

  // Check if permission is explicitly denied
  if (this.deniedPermissions && this.deniedPermissions.includes(permission)) {
    return false;
  }

  // Check if permission is in custom permissions
  if (this.customPermissions && this.customPermissions.includes(permission)) {
    return true;
  }

  // Check if permission is in role permissions
  return rolePermissions.includes(permission);
};

// Method to get all effective permissions for this user
UserSchema.methods.getEffectivePermissions = function() {
  const { getUserPermissions } = require('../utils/permissions');

  // Get all permissions based on role
  const rolePermissions = getUserPermissions({ role: this.role });

  // Add custom permissions
  const allPermissions = [...new Set([...rolePermissions, ...(this.customPermissions || [])])];

  // Remove denied permissions
  return allPermissions.filter(permission => !this.deniedPermissions.includes(permission));
};

// Method to handle failed login attempt
UserSchema.methods.registerFailedLogin = async function() {
  this.failedLoginAttempts += 1;

  // Lock account after 5 failed attempts
  if (this.failedLoginAttempts >= 5) {
    this.accountLocked = true;
    // Lock for 30 minutes
    this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
  }

  await this.save();
};

// Method to reset failed login attempts
UserSchema.methods.resetFailedLoginAttempts = async function() {
  this.failedLoginAttempts = 0;
  this.accountLocked = false;
  this.accountLockedUntil = null;
  await this.save();
};

// Method to check if account is locked
UserSchema.methods.isAccountLocked = function() {
  if (!this.accountLocked) {
    return false;
  }

  // Check if lock period has expired
  if (this.accountLockedUntil && this.accountLockedUntil < new Date()) {
    return false;
  }

  return true;
};

// Method to check if password needs to be changed
UserSchema.methods.passwordChangeRequired = function() {
  // If no password last changed date, assume it needs to be changed
  if (!this.passwordLastChanged) {
    return true;
  }

  // Check if password is older than 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  return this.passwordLastChanged < ninetyDaysAgo;
};

module.exports = mongoose.model('User', UserSchema);
