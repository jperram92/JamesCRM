const { User, Invitation, EmailDelivery } = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// Create a new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password, // This will be hashed by the User model hook
      role: role || 'user',
    });

    // Return user data (without password)
    res.status(201).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract updatable fields
    const { first_name, last_name, email, role } = req.body;

    // Update user
    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      email: email || user.email,
      role: role || user.role
    });

    // Return updated user (without password)
    res.json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

// Reset user password (admin only)
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = new_password; // This will be hashed by the User model hook
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error while resetting password' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

// Invite a new user (admin only)
exports.inviteUser = async (req, res) => {
  try {
    const { first_name, last_name, email, role } = req.body;
    const invitedBy = req.user.id; // Get the current admin user's ID

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if there's an existing pending invitation for this email
    const existingInvitation = await Invitation.findOne({
      where: {
        status: 'pending',
        '$user.email$': email
      },
      include: [{ model: User, as: 'user', attributes: ['email'] }]
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'There is already a pending invitation for this email' });
    }

    // Generate a random temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex');

    // Create new user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password: tempPassword, // This will be hashed by the User model hook
      role: role || 'user',
      status: 'invited' // Mark the user as invited until they log in
    });

    // Generate invitation token
    const token = crypto.randomBytes(20).toString('hex');

    // Set expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
      // Send invitation email
      const emailDelivery = await emailService.sendUserInvitation(user, tempPassword);

      // Create invitation record
      const invitation = await Invitation.create({
        user_id: user.id,
        invited_by: invitedBy,
        token,
        status: 'pending',
        role: role || 'user',
        email_delivery_id: emailDelivery.id,
        expires_at: expiresAt
      });

      // Return success response
      res.status(201).json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        invitation_status: invitation.status,
        expires_at: invitation.expires_at,
        temp_password: tempPassword, // Only for demo purposes
        created_at: user.created_at
      });
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);

      // Even if email fails, we still created the user and invitation
      res.status(201).json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        temp_password: tempPassword,
        message: 'User created but invitation email could not be sent',
        created_at: user.created_at
      });
    }
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ message: 'Server error while inviting user' });
  }
};

// Get system logs (admin only)
exports.getSystemLogs = async (req, res) => {
  try {
    // In a real application, you would fetch logs from a database or log files
    // For this demo, we'll return mock data
    const logs = [
      { timestamp: '2025-04-13 10:30:15', level: 'INFO', message: 'System started' },
      { timestamp: '2025-04-13 10:31:22', level: 'INFO', message: 'User admin@example.com logged in' },
      { timestamp: '2025-04-13 10:45:18', level: 'INFO', message: 'New company "Acme Inc." created by admin@example.com' },
      { timestamp: '2025-04-13 11:02:45', level: 'ERROR', message: 'Database connection timeout' },
      { timestamp: '2025-04-13 11:03:12', level: 'INFO', message: 'Database connection restored' },
      { timestamp: '2025-04-13 11:15:30', level: 'INFO', message: 'User john@example.com created by admin@example.com' },
      { timestamp: '2025-04-13 11:22:45', level: 'INFO', message: 'User john@example.com logged in' },
      { timestamp: '2025-04-13 11:30:10', level: 'INFO', message: 'New contact "Jane Doe" created by john@example.com' },
      { timestamp: '2025-04-13 11:45:22', level: 'WARNING', message: 'High CPU usage detected' },
      { timestamp: '2025-04-13 12:00:05', level: 'INFO', message: 'Scheduled backup started' },
      { timestamp: '2025-04-13 12:05:30', level: 'INFO', message: 'Scheduled backup completed successfully' },
      { timestamp: '2025-04-13 13:10:15', level: 'INFO', message: 'User sarah@example.com logged in' },
      { timestamp: '2025-04-13 13:25:40', level: 'INFO', message: 'New deal "Website Redesign" created by sarah@example.com' },
      { timestamp: '2025-04-13 14:02:12', level: 'ERROR', message: 'Email sending failed to recipient client@example.com' },
      { timestamp: '2025-04-13 14:15:30', level: 'INFO', message: 'User admin@example.com logged out' }
    ];

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Server error while fetching logs' });
  }
};

// Get all invitations (admin only)
exports.getAllInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email', 'role'] },
        { model: User, as: 'inviter', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: EmailDelivery, as: 'emailDelivery', attributes: ['id', 'status', 'sent_at', 'delivered_at', 'opened_at'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Server error while fetching invitations' });
  }
};

// Resend invitation (admin only)
exports.resendInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the invitation
    const invitation = await Invitation.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: `Cannot resend invitation with status: ${invitation.status}` });
    }

    // Generate a new temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex');

    // Update the user's password
    await invitation.user.update({ password: tempPassword });

    // Send the invitation email
    const emailDelivery = await emailService.sendUserInvitation(invitation.user, tempPassword);

    // Update the invitation record
    await invitation.update({
      email_delivery_id: emailDelivery.id,
      updated_at: new Date()
    });

    res.json({
      message: 'Invitation resent successfully',
      invitation_id: invitation.id,
      user_id: invitation.user_id,
      email: invitation.user.email,
      temp_password: tempPassword // Only for demo purposes
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({ message: 'Server error while resending invitation' });
  }
};

// Revoke invitation (admin only)
exports.revokeInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the invitation
    const invitation = await Invitation.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: `Cannot revoke invitation with status: ${invitation.status}` });
    }

    // Update the invitation status
    await invitation.update({
      status: 'revoked',
      updated_at: new Date()
    });

    // Optionally, disable the user account
    await invitation.user.update({
      status: 'inactive'
    });

    res.json({
      message: 'Invitation revoked successfully',
      invitation_id: invitation.id,
      user_id: invitation.user_id
    });
  } catch (error) {
    console.error('Error revoking invitation:', error);
    res.status(500).json({ message: 'Server error while revoking invitation' });
  }
};

// Get invitation statistics (admin only)
exports.getInvitationStats = async (req, res) => {
  try {
    // Get counts by status
    const pendingCount = await Invitation.count({ where: { status: 'pending' } });
    const acceptedCount = await Invitation.count({ where: { status: 'accepted' } });
    const expiredCount = await Invitation.count({ where: { status: 'expired' } });
    const revokedCount = await Invitation.count({ where: { status: 'revoked' } });

    // Get counts by role
    const adminInvites = await Invitation.count({ where: { role: 'admin' } });
    const managerInvites = await Invitation.count({ where: { role: 'manager' } });
    const userInvites = await Invitation.count({ where: { role: 'user' } });

    // Get recent invitations
    const recentInvitations = await Invitation.findAll({
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      total: pendingCount + acceptedCount + expiredCount + revokedCount,
      by_status: {
        pending: pendingCount,
        accepted: acceptedCount,
        expired: expiredCount,
        revoked: revokedCount
      },
      by_role: {
        admin: adminInvites,
        manager: managerInvites,
        user: userInvites
      },
      recent: recentInvitations
    });
  } catch (error) {
    console.error('Error fetching invitation statistics:', error);
    res.status(500).json({ message: 'Server error while fetching invitation statistics' });
  }
};