import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import PageTransition from '../components/PageTransition';
import { useToastContext } from '../contexts/ToastContext';
import Modal from '../components/Modal';
import {
  UsersIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  CogIcon,
  ServerIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import DataTable from '../components/DataTable';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const { showSuccess, showError } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user'
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // For demo/development without backend
      if (!token || process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        console.log('Using mock data for users');
        setUsers(mockUsers);
        setIsLoading(false);
        return;
      }

      // Call the real API
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to load users: ' + (error.response?.data?.message || error.message));
      setIsLoading(false);

      // Fallback to mock data if API call fails
      setUsers(mockUsers);
    }
  };

  // Handle invite form input changes
  const handleInviteInputChange = (e) => {
    setInviteForm({
      ...inviteForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle user invitation
  const handleInviteUser = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // For demo/development without backend
      if (!token || process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        console.log('Using mock data for user invitation');

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add the new user to our mock data with pending status
        const newUser = {
          id: Date.now(),
          first_name: inviteForm.firstName,
          last_name: inviteForm.lastName,
          email: inviteForm.email,
          role: inviteForm.role,
          status: 'pending',
          last_login: null
        };

        setUsers([...users, newUser]);
        showSuccess('User invitation sent successfully (Mock)');
        setShowInviteModal(false);
        setInviteForm({ email: '', firstName: '', lastName: '', role: 'user' });
        setIsLoading(false);
        return;
      }

      // Call the real API
      console.log('Sending invitation request to API...');
      console.log('Request data:', {
        email: inviteForm.email,
        firstName: inviteForm.firstName,
        lastName: inviteForm.lastName,
        role: inviteForm.role
      });

      let response;
      try {
        response = await axios.post('http://localhost:5000/api/users/invite', {
          email: inviteForm.email,
          firstName: inviteForm.firstName,
          lastName: inviteForm.lastName,
          role: inviteForm.role
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('API response:', response.data);
      } catch (apiError) {
        console.error('API error:', apiError);
        throw apiError;
      }

      // Check if there's an email preview URL (for development with Ethereal)
      if (response && response.data && response.data.emailPreviewUrl) {
        showSuccess(
          <div>
            User invitation sent successfully!
            <br />
            <a
              href={response.data.emailPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 underline"
            >
              View Email Preview
            </a>
          </div>
        );
      }
      // If using SendGrid
      else if (response && response.data && response.data.emailProvider === 'SendGrid') {
        showSuccess(
          <div>
            User invitation sent successfully!
            <br />
            <span className="text-success-600">Email sent via SendGrid to {inviteForm.email}</span>
          </div>
        );
      }
      // Default success message
      else {
        showSuccess('User invitation sent successfully!');
      }

      // Refresh the user list
      fetchUsers();

      // Reset form and close modal
      setShowInviteModal(false);
      setInviteForm({ email: '', firstName: '', lastName: '', role: 'user' });
      setIsLoading(false);
    } catch (error) {
      console.error('Error inviting user:', error);
      showError(error.response?.data?.message || 'Failed to send invitation');
      setIsLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setIsLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        // For demo/development without backend
        if (!token || process.env.REACT_APP_USE_MOCK_DATA === 'true') {
          console.log('Using mock data for user deletion');

          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Filter out the deleted user
          setUsers(users.filter(user => user.id !== userId));
          showSuccess('User deleted successfully (Mock)');
          setIsLoading(false);
          return;
        }

        // Call the real API
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        showSuccess('User deleted successfully');

        // Refresh the user list
        fetchUsers();
        setIsLoading(false);
      } catch (error) {
        console.error('Error deleting user:', error);
        showError(error.response?.data?.message || 'Failed to delete user');
        setIsLoading(false);
      }
    }
  };

  // Handle user edit
  const handleEditUser = (userId) => {
    showSuccess(`Edit user with ID: ${userId} (functionality to be implemented)`);
  };

  // Mock data for users
  const mockUsers = [
    {
      id: 1,
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      last_login: '2023-06-15T10:30:00',
    },
    {
      id: 2,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      role: 'user',
      status: 'active',
      last_login: '2023-06-14T15:45:00',
    },
    {
      id: 3,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      role: 'manager',
      status: 'active',
      last_login: '2023-06-13T09:20:00',
    },
    {
      id: 4,
      first_name: 'Robert',
      last_name: 'Johnson',
      email: 'robert.johnson@example.com',
      role: 'user',
      status: 'inactive',
      last_login: '2023-05-28T11:15:00',
    },
    {
      id: 5,
      first_name: 'Emily',
      last_name: 'Williams',
      email: 'emily.williams@example.com',
      role: 'user',
      status: 'pending',
      last_login: null,
    },
  ];

  // Mock data for system logs
  const systemLogs = [
    {
      id: 1,
      timestamp: '2023-06-15T14:30:00',
      level: 'info',
      message: 'User login: admin@example.com',
      source: 'auth',
    },
    {
      id: 2,
      timestamp: '2023-06-15T14:25:00',
      level: 'warning',
      message: 'Failed login attempt: unknown@example.com',
      source: 'auth',
    },
    {
      id: 3,
      timestamp: '2023-06-15T13:45:00',
      level: 'error',
      message: 'Database connection timeout',
      source: 'database',
    },
    {
      id: 4,
      timestamp: '2023-06-15T12:30:00',
      level: 'info',
      message: 'Scheduled backup completed successfully',
      source: 'system',
    },
    {
      id: 5,
      timestamp: '2023-06-15T10:15:00',
      level: 'info',
      message: 'User created: emily.williams@example.com',
      source: 'users',
    },
  ];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // User table columns
  const userColumns = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => `${row.first_name} ${row.last_name}`,
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <span className={`badge ${
          row.role === 'admin'
            ? 'badge-primary'
            : row.role === 'manager'
              ? 'badge-secondary'
              : 'badge-accent'
        }`}>
          {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`badge ${
          row.status === 'active'
            ? 'badge-success'
            : row.status === 'inactive'
              ? 'badge-danger'
              : 'badge-warning'
        }`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'last_login',
      header: 'Last Login',
      render: (row) => formatDate(row.last_login),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
            onClick={() => handleEditUser(row.id)}
          >
            Edit
          </button>
          <button
            className="text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300"
            onClick={() => handleDeleteUser(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // System logs table columns
  const logColumns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (row) => formatDate(row.timestamp),
    },
    {
      key: 'level',
      header: 'Level',
      render: (row) => (
        <span className={`badge ${
          row.level === 'info'
            ? 'badge-primary'
            : row.level === 'warning'
              ? 'badge-warning'
              : 'badge-danger'
        }`}>
          {row.level.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'message',
      header: 'Message',
    },
    {
      key: 'source',
      header: 'Source',
      render: (row) => (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {row.source}
        </span>
      ),
    },
  ];

  // Handle system actions
  const handleSystemAction = (action) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showSuccess(`${action} completed successfully`);
    }, 1500);
  };

  // Tabs configuration
  const tabs = [
    { id: 'users', label: 'Users', icon: <UsersIcon className="h-5 w-5" /> },
    { id: 'roles', label: 'Roles & Permissions', icon: <ShieldCheckIcon className="h-5 w-5" /> },
    { id: 'system', label: 'System', icon: <ServerIcon className="h-5 w-5" /> },
    { id: 'email', label: 'Email Templates', icon: <EnvelopeIcon className="h-5 w-5" /> },
    { id: 'logs', label: 'Logs', icon: <DocumentTextIcon className="h-5 w-5" /> },
    { id: 'settings', label: 'Admin Settings', icon: <CogIcon className="h-5 w-5" /> },
  ];

  // Invite User Modal
  const renderInviteUserModal = () => {
    return (
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite New User"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowInviteModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleInviteUser}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : 'Send Invitation'}
            </button>
          </div>
        }
      >
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="form-input"
              value={inviteForm.email}
              onChange={handleInviteInputChange}
            />
          </div>

          <div>
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="form-input"
              value={inviteForm.firstName}
              onChange={handleInviteInputChange}
            />
          </div>

          <div>
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="form-input"
              value={inviteForm.lastName}
              onChange={handleInviteInputChange}
            />
          </div>

          <div>
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              name="role"
              className="form-input"
              value={inviteForm.role}
              onChange={handleInviteInputChange}
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </form>
      </Modal>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Management</h3>
              <button
                className="btn btn-primary flex items-center"
                onClick={() => setShowInviteModal(true)}
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Invite User
              </button>
            </div>

            <DataTable
              columns={userColumns}
              data={users}
              isLoading={isLoading}
              emptyMessage="No users found"
            />

            {renderInviteUserModal()}
          </div>
        );
      case 'logs':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Logs</h3>
              <div className="flex space-x-2">
                <select className="form-input py-1 px-2">
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
                <button className="btn btn-outline py-1 px-3">
                  Filter
                </button>
              </div>
            </div>

            <DataTable
              columns={logColumns}
              data={systemLogs}
              emptyMessage="No logs found"
            />
          </div>
        );
      case 'system':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-header">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">System Status</h4>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Database</span>
                      <span className="badge badge-success">Connected</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Email Service</span>
                      <span className="badge badge-success">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Storage</span>
                      <span className="badge badge-warning">78% Used</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Cache</span>
                      <span className="badge badge-success">Optimized</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Last Backup</span>
                      <span className="text-sm text-gray-900 dark:text-white">June 15, 2023 12:30 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">System Actions</h4>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <button
                      className="btn btn-primary w-full flex items-center justify-center"
                      onClick={() => handleSystemAction('Backup')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ServerIcon className="h-4 w-4 mr-2" />
                          Create Backup
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-outline w-full flex items-center justify-center"
                      onClick={() => handleSystemAction('Cache clear')}
                      disabled={isLoading}
                    >
                      <CogIcon className="h-4 w-4 mr-2" />
                      Clear Cache
                    </button>
                    <button
                      className="btn btn-outline w-full flex items-center justify-center"
                      onClick={() => handleSystemAction('System check')}
                      disabled={isLoading}
                    >
                      <ShieldCheckIcon className="h-4 w-4 mr-2" />
                      Run System Check
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-300">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar */}
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-300">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                          activeTab === tab.id
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 border-l-4 border-primary-500'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="mr-3">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300"
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Admin;
