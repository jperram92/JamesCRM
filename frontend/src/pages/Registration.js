import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useToastContext } from '../contexts/ToastContext';
import PageTransition from '../components/PageTransition';
import Logo from '../components/Logo';

const Registration = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { showSuccess, showError } = useToastContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Get token from URL query params
  const token = new URLSearchParams(location.search).get('token');

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      showError('Invalid or missing invitation token');
      navigate('/login');
      return;
    }

    const validateToken = async () => {
      setIsLoading(true);
      try {
        // For demo/development without backend
        if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
          console.log('Using mock data for token validation');

          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          setTokenValid(true);
          setUserEmail('invited.user@example.com');
          setIsLoading(false);
          return;
        }

        // Call the real API
        const response = await axios.get(`http://localhost:5000/api/auth/validate-invitation?token=${token}`);

        setTokenValid(true);
        setUserEmail(response.data.email);
        setFirstName(response.data.firstName || '');
        setLastName(response.data.lastName || '');
        setIsLoading(false);
      } catch (error) {
        console.error('Error validating token:', error);
        showError(error.response?.data?.message || 'Invalid or expired invitation token');
        navigate('/login');
      }
    };

    validateToken();
  }, [token, navigate, showError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // For demo/development without backend
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        console.log('Using mock data for registration completion');

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        showSuccess('Registration completed successfully! You can now log in.');
        navigate('/login');
        return;
      }

      // Call the real API
      await axios.post('http://localhost:5000/api/auth/complete-registration', {
        token,
        firstName,
        lastName,
        password
      });

      showSuccess('Registration completed successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      showError(error.response?.data?.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  if (isLoading && !tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Validating invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-center">
            <Logo size="lg" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Complete Your Registration
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              You've been invited to join JamesCRM
            </p>
          </div>

          <div className="card p-6 mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  disabled
                  className="form-input bg-gray-100 dark:bg-gray-700"
                  value={userEmail}
                />
              </div>

              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <label htmlFor="first-name" className="form-label">
                    First name
                  </label>
                  <input
                    id="first-name"
                    name="firstName"
                    type="text"
                    required
                    className="form-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="last-name" className="form-label">
                    Last name
                  </label>
                  <input
                    id="last-name"
                    name="lastName"
                    type="text"
                    required
                    className="form-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Registration;
