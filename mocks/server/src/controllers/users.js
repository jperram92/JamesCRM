/**
 * Mock users controller
 */

// Mock getAllUsers function
exports.getAllUsers = async (req, res) => {
  res.json([
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
    },
    {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      role: 'manager',
      status: 'active',
    },
    {
      id: 3,
      first_name: 'Bob',
      last_name: 'Johnson',
      email: 'bob.johnson@example.com',
      role: 'user',
      status: 'active',
    },
  ]);
};

// Mock getUserById function
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  
  if (id === '1') {
    return res.json({
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      status: 'active',
    });
  }
  
  res.status(404).json({ message: 'User not found' });
};

// Mock createUser function
exports.createUser = async (req, res) => {
  const { first_name, last_name, email, role } = req.body;
  
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ message: 'First name, last name, and email are required' });
  }
  
  if (email === 'john.doe@example.com') {
    return res.status(400).json({ message: 'Email already in use' });
  }
  
  res.status(201).json({
    id: 4,
    first_name,
    last_name,
    email,
    role: role || 'user',
    status: 'pending',
  });
};

// Mock updateUser function
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, role } = req.body;
  
  if (id === '1') {
    return res.json({
      id: 1,
      first_name: first_name || 'John',
      last_name: last_name || 'Doe',
      email: 'john.doe@example.com',
      role: role || 'admin',
      status: 'active',
    });
  }
  
  res.status(404).json({ message: 'User not found' });
};

// Mock deleteUser function
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  
  if (id === '1') {
    return res.json({ message: 'User deleted successfully' });
  }
  
  res.status(404).json({ message: 'User not found' });
};

// Mock inviteUser function
exports.inviteUser = async (req, res) => {
  const { email, role } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  if (email === 'john.doe@example.com') {
    return res.status(400).json({ message: 'Email already in use' });
  }
  
  res.status(201).json({
    id: 4,
    email,
    role: role || 'user',
    status: 'pending',
    invitation_token: 'valid-token',
    invitation_expires: new Date(Date.now() + 86400000), // 24 hours from now
  });
};
