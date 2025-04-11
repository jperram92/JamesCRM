/**
 * Mock Auth Controller for testing
 */

const mockAuthController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user by email
      const user = await req.app.models.User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare password
      const isPasswordValid = await req.app.bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = req.app.jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        'jwt_secret',
        { expiresIn: '1h' }
      );

      // Return user data and token
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  },

  register: async (req, res) => {
    try {
      const { first_name, last_name, email, password } = req.body;

      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if user already exists
      const existingUser = await req.app.models.User.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Hash password
      const hashedPassword = await req.app.bcrypt.hash(password, 10);

      // Create user
      const user = await req.app.models.User.create({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        role: 'user',
        status: 'active',
        created_at: new Date()
      });

      // Generate token
      const token = req.app.jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        'jwt_secret',
        { expiresIn: '1h' }
      );

      // Return user data and token
      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  },

  validateInvitationToken: async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }

      // Find user with this invitation token
      const user = await req.app.models.User.findOne({
        where: {
          invitation_token: token,
          status: 'pending'
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired invitation token' });
      }

      // Check if token is expired
      const tokenExpiry = new Date(user.invitation_token_expires);
      if (tokenExpiry < new Date()) {
        return res.status(400).json({ message: 'Invitation token has expired' });
      }

      // Return user data
      res.json({
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Validate invitation token error:', error);
      res.status(500).json({ message: 'Server error during token validation' });
    }
  },

  completeRegistration: async (req, res) => {
    try {
      const { token, password, first_name, last_name } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
      }

      // Find user with this invitation token
      const user = await req.app.models.User.findOne({
        where: {
          invitation_token: token,
          status: 'pending'
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired invitation token' });
      }

      // Check if token is expired
      const tokenExpiry = new Date(user.invitation_token_expires);
      if (tokenExpiry < new Date()) {
        return res.status(400).json({ message: 'Invitation token has expired' });
      }

      // Hash password
      const hashedPassword = await req.app.bcrypt.hash(password, 10);

      // Update user
      await user.update({
        password: hashedPassword,
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        status: 'active',
        invitation_token: null,
        invitation_token_expires: null,
        updated_at: new Date()
      });

      // Generate token
      const authToken = req.app.jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        'jwt_secret',
        { expiresIn: '1h' }
      );

      // Return user data and token
      res.json({
        token: authToken,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Complete registration error:', error);
      res.status(500).json({ message: 'Server error during registration completion' });
    }
  }
};

module.exports = mockAuthController;
