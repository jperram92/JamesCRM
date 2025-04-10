import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useTheme } from '../components/ThemeProvider';
import { useToastContext } from '../contexts/ToastContext';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  UserIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  SwatchIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { darkMode, toggleDarkMode, setTheme, useSystemTheme } = useTheme();
  const { showSuccess } = useToastContext();
  const [activeTab, setActiveTab] = useState('appearance');

  // Handle theme change
  const handleThemeChange = (theme) => {
    if (theme === 'system') {
      // We need to rename this variable to avoid React hooks error
      const applySystemTheme = useSystemTheme;
      applySystemTheme();
    } else {
      setTheme(theme);
    }
    showSuccess('Theme settings updated successfully');
  };

  // Tabs configuration
  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <SwatchIcon className="h-5 w-5" /> },
    { id: 'account', label: 'Account', icon: <UserIcon className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon className="h-5 w-5" /> },
    { id: 'security', label: 'Security', icon: <LockClosedIcon className="h-5 w-5" /> },
    { id: 'language', label: 'Language & Region', icon: <GlobeAltIcon className="h-5 w-5" /> },
    { id: 'sync', label: 'Sync & Backup', icon: <ArrowPathIcon className="h-5 w-5" /> },
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose how JamesCRM looks to you. Select a theme or sync with your system settings.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`relative flex flex-col items-center p-4 border rounded-lg transition-colors ${
                    !darkMode && localStorage.getItem('theme') === 'light'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3">
                    <SunIcon className="h-6 w-6 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Light</span>
                  {!darkMode && localStorage.getItem('theme') === 'light' && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary-500"></div>
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`relative flex flex-col items-center p-4 border rounded-lg transition-colors ${
                    darkMode && localStorage.getItem('theme') === 'dark'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center mb-3">
                    <MoonIcon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Dark</span>
                  {darkMode && localStorage.getItem('theme') === 'dark' && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary-500"></div>
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange('system')}
                  className={`relative flex flex-col items-center p-4 border rounded-lg transition-colors ${
                    !localStorage.getItem('theme')
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-white to-gray-900 border border-gray-200 flex items-center justify-center mb-3">
                    <ComputerDesktopIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">System</span>
                  {!localStorage.getItem('theme') && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary-500"></div>
                  )}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Accent Color</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose the primary color for buttons and interactive elements.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {['blue', 'purple', 'pink', 'orange', 'green', 'red'].map((color) => (
                  <button
                    key={color}
                    className={`h-8 w-8 rounded-full border-2 ${
                      color === 'blue' ? 'border-white dark:border-gray-800 ring-2 ring-primary-500' : 'border-white dark:border-gray-800'
                    }`}
                    style={{
                      backgroundColor: {
                        blue: '#0ea5e9',
                        purple: '#8b5cf6',
                        pink: '#ec4899',
                        orange: '#f97316',
                        green: '#22c55e',
                        red: '#ef4444',
                      }[color],
                    }}
                  ></button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Font Size</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Adjust the size of text throughout the application.
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">A</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    defaultValue="3"
                    className="w-full mx-4 accent-primary-500"
                  />
                  <span className="text-lg font-bold text-gray-500 dark:text-gray-400">A</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your account information and how others see you on the platform.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-6 gap-x-4">
                <div className="sm:col-span-3">
                  <label htmlFor="first-name" className="form-label">
                    First name
                  </label>
                  <input
                    type="text"
                    name="first-name"
                    id="first-name"
                    defaultValue="John"
                    className="form-input"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="last-name" className="form-label">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="last-name"
                    id="last-name"
                    defaultValue="Doe"
                    className="form-input"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    defaultValue="john.doe@example.com"
                    className="form-input"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="photo" className="form-label">
                    Photo
                  </label>
                  <div className="mt-1 flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      JD
                    </div>
                    <button
                      type="button"
                      className="ml-5 btn btn-outline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-outline mr-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => showSuccess('Profile updated successfully')}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notification Preferences</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Decide which communications you'd like to receive and how.
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="email-notifications"
                      name="email-notifications"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="email-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                      Email notifications
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Get notified when someone mentions you, assigns you, or requests your review.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="browser-notifications"
                      name="browser-notifications"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="browser-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                      Browser notifications
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Receive browser notifications for activity in your account.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="marketing-emails"
                      name="marketing-emails"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="marketing-emails" className="font-medium text-gray-700 dark:text-gray-300">
                      Marketing emails
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Receive emails about new features, product updates, and company news.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => showSuccess('Notification preferences updated')}
                >
                  Save
                </button>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
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

export default Settings;
