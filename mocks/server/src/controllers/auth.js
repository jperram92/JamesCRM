/**
 * Mock authentication controller
 */

// Mock login function
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  if (email === 'john.doe@example.com' && password === 'password123') {
    return res.json({
      token: 'valid-token',
      user: {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        role: 'admin',
      },
    });
  }
  
  res.status(401).json({ message: 'Invalid credentials' });
};

// Mock register function
exports.register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (email === 'john.doe@example.com') {
    return res.status(400).json({ message: 'Email already in use' });
  }
  
  res.status(201).json({
    token: 'valid-token',
    user: {
      id: 5,
      first_name,
      last_name,
      email,
      role: 'user',
    },
  });
};

// Mock validateInvitationToken function
exports.validateInvitationToken = async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  
  if (token === 'valid-token') {
    return res.json({
      email: 'pending.user@example.com',
      token: 'valid-token',
    });
  }
  
  res.status(400).json({ message: 'Invalid or expired invitation token' });
};

// Mock completeRegistration function
exports.completeRegistration = async (req, res) => {
  const { token, first_name, last_name, password } = req.body;
  
  if (!token || !first_name || !last_name || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (token === 'valid-token') {
    return res.json({
      token: 'valid-token',
      user: {
        id: 4,
        first_name,
        last_name,
        email: 'pending.user@example.com',
        role: 'user',
      },
    });
  }
  
  res.status(400).json({ message: 'Invalid or expired invitation token' });
};

// Mock forgotPassword function
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  res.json({ message: 'If your email is registered, you will receive a password reset link' });
};

// Mock resetPassword function
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }
  
  if (token === 'valid-token') {
    return res.json({ message: 'Password has been reset successfully' });
  }
  
  res.status(400).json({ message: 'Invalid or expired reset token' });
};
