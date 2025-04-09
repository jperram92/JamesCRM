import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Logo from '../components/Logo';
import { useToastContext } from '../contexts/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showError, showSuccess } = useToastContext();

  // Get auth state from Redux
  const { loading: isLoading, error: authError, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if there's a saved email in localStorage
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save email to localStorage if remember me is checked
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    // For demo purposes, we'll handle the admin@example.com/password case specially
    if (email === 'admin@example.com' && password === 'password') {
      // Mock successful login with demo user
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        role: 'admin'
      }));
      showSuccess('Login successful!');
      navigate('/');
      return;
    }

    // Otherwise try to login through Redux action
    try {
      const resultAction = await dispatch(login({ email, password }));
      if (login.fulfilled.match(resultAction)) {
        showSuccess('Login successful!');
        navigate('/');
      } else if (login.rejected.match(resultAction)) {
        showError(resultAction.payload || 'Invalid email or password');
      }
    } catch (err) {
      showError('An error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="flex flex-col items-center">
          <Logo size="lg" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              create a new account
            </Link>
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="card p-6 mt-8"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email-address" className="form-label">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-danger"
              >
                {authError}
              </motion.div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`btn btn-primary w-full ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      </div>
    </PageTransition>
  );
};

export default Login;
