const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Special case for demo login
    if (email === 'admin@example.com' && password === 'password') {
      // Find admin user or create one if it doesn't exist
      let adminUser = await User.findOne({ email: 'admin@example.com' });

      if (!adminUser) {
        // Create admin user if it doesn't exist
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password', salt);

        adminUser = new User({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin',
          status: 'active',
          lastLogin: new Date()
        });

        await adminUser.save();
        console.log('Admin user created on login');
      }

      // Update last login time
      adminUser.lastLogin = Date.now();
      await adminUser.save();

      return res.json({
        _id: adminUser._id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        role: adminUser.role,
        status: adminUser.status,
        token: generateToken(adminUser._id)
      });
    }

    // Regular login flow
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({ message: 'Account is not active' });
      }

      // Update last login time
      user.lastLogin = Date.now();
      await user.save();

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Validate invitation token
// @route   GET /api/auth/validate-invitation
// @access  Public
exports.validateInvitationToken = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Find user with this invitation token
    const user = await User.findOne({
      invitationToken: token,
      invitationExpires: { $gt: Date.now() },
      status: 'pending'
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }

    res.json({
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete user registration from invitation
// @route   POST /api/auth/complete-registration
// @access  Public
exports.completeRegistration = async (req, res) => {
  const { token, firstName, lastName, password } = req.body;

  if (!token || !firstName || !lastName || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Find user with this invitation token
    const user = await User.findOne({
      invitationToken: token,
      invitationExpires: { $gt: Date.now() },
      status: 'pending'
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }

    // Update user information
    user.firstName = firstName;
    user.lastName = lastName;
    user.password = password;
    user.status = 'active';
    user.invitationToken = undefined;
    user.invitationExpires = undefined;

    await user.save();

    res.json({ message: 'Registration completed successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
