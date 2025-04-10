const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Return mock users
      const mockUsers = [
        {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          lastLogin: new Date().toISOString()
        },
        {
          _id: '2',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: 'user',
          status: 'active',
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          role: 'manager',
          status: 'active',
          lastLogin: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '4',
          firstName: 'Robert',
          lastName: 'Johnson',
          email: 'robert.johnson@example.com',
          role: 'user',
          status: 'inactive',
          lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '5',
          firstName: 'Emily',
          lastName: 'Williams',
          email: 'emily.williams@example.com',
          role: 'user',
          status: 'pending',
          lastLogin: null
        }
      ];

      return res.json(mockUsers);
    }

    // Regular MongoDB query
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Invite a new user
// @route   POST /api/users/invite
// @access  Private/Admin
exports.inviteUser = async (req, res) => {
  console.log('Invite user request received:', req.body);
  const { email, firstName, lastName, role } = req.body;

  try {
    // For development without MongoDB
    if (process.env.SKIP_MONGODB === 'true') {
      // Generate invitation token
      const invitationToken = crypto.randomBytes(20).toString('hex');

      // Create mock user
      const mockUser = {
        _id: Date.now().toString(),
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        role: role || 'user',
        status: 'pending',
        invitationToken,
        invitationExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Send invitation email
      console.log('Preparing to send invitation email to (mock):', email);
      const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?token=${invitationToken}`;
      console.log('Invitation URL (mock):', inviteUrl);

      let emailResult;
      try {
        emailResult = await emailService.sendInvitationEmail(email, inviteUrl, firstName);
        console.log('Email service result (mock):', JSON.stringify(emailResult, null, 2));
      } catch (emailError) {
        console.error('Error in email service (mock):', emailError);
        throw emailError;
      }

      // Include email details in response
      const response = {
        message: 'Invitation sent successfully',
        user: mockUser
      };

      // Add email preview URL if available (Ethereal)
      if (emailResult.provider === 'ethereal' && emailResult.previewUrl) {
        response.emailPreviewUrl = emailResult.previewUrl;
      }

      // Add SendGrid info if that was used
      if (emailResult.provider === 'sendgrid') {
        response.emailProvider = 'SendGrid';
        response.emailSent = true;
      }

      return res.json(response);
    }

    // Regular MongoDB flow
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiration = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Create new user with pending status
    user = new User({
      email,
      firstName,
      lastName,
      role: role || 'user',
      status: 'pending',
      invitationToken,
      invitationExpires: tokenExpiration
    });

    await user.save();

    // Send invitation email
    console.log('Preparing to send invitation email to:', email);
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?token=${invitationToken}`;
    console.log('Invitation URL:', inviteUrl);

    let emailResult;
    try {
      emailResult = await emailService.sendInvitationEmail(email, inviteUrl, firstName);
      console.log('Email service result:', JSON.stringify(emailResult, null, 2));
    } catch (emailError) {
      console.error('Error in email service:', emailError);
      throw emailError;
    }

    // Include email details in response
    const response = {
      message: 'Invitation sent successfully',
      user
    };

    // Add email preview URL if available (Ethereal)
    if (emailResult.provider === 'ethereal' && emailResult.previewUrl) {
      response.emailPreviewUrl = emailResult.previewUrl;
    }

    // Add SendGrid info if that was used
    if (emailResult.provider === 'sendgrid') {
      response.emailProvider = 'SendGrid';
      response.emailSent = true;
    }

    res.json(response);
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  const { firstName, lastName, email, role, status } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;

    const updatedUser = await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();

    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
