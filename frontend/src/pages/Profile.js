import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useToastContext } from '../contexts/ToastContext';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import UserAvatar from '../components/UserAvatar';
import Modal from '../components/Modal';

const Profile = () => {
  const { showSuccess } = useToastContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Mock user data
  const user = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    position: 'Sales Manager',
    department: 'Sales',
    location: 'New York, NY',
    joined_date: '2021-06-15',
    bio: 'Experienced sales professional with over 8 years in B2B software sales. Passionate about building relationships and helping businesses grow through technology solutions.',
    skills: ['Sales Strategy', 'CRM Software', 'Lead Generation', 'Negotiation', 'Client Relationship Management'],
    social_links: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
    },
  };

  // Activity data
  const activities = [
    {
      id: 1,
      type: 'deal',
      title: 'Closed deal with Acme Inc.',
      date: '2023-06-10T14:30:00',
      amount: '$75,000',
    },
    {
      id: 2,
      type: 'call',
      title: 'Call with Jane Smith from Tech Solutions',
      date: '2023-06-08T11:15:00',
      duration: '45 minutes',
    },
    {
      id: 3,
      type: 'email',
      title: 'Sent proposal to Global Enterprises',
      date: '2023-06-05T09:30:00',
    },
    {
      id: 4,
      type: 'meeting',
      title: 'Product demo for New Horizons LLC',
      date: '2023-06-02T15:00:00',
      duration: '1 hour',
    },
    {
      id: 5,
      type: 'note',
      title: 'Added notes about Sunshine Corp requirements',
      date: '2023-05-30T10:45:00',
    },
  ];

  // Performance data
  const performanceData = {
    deals_closed: 28,
    deals_value: 450000,
    conversion_rate: 68,
    average_deal_size: 16071,
    meetings_scheduled: 45,
    calls_made: 112,
    emails_sent: 230,
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle save profile
  const handleSaveProfile = () => {
    setIsEditModalOpen(false);
    showSuccess('Profile updated successfully');
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-300">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">About</h3>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">{user.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">{user.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Work Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">{user.position}, {user.department}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">Joined {formatDate(user.joined_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-300">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activities.map((activity) => (
                  <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDateTime(activity.date)}
                          {activity.duration && ` • ${activity.duration}`}
                          {activity.amount && ` • ${activity.amount}`}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.type === 'deal'
                          ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300'
                          : activity.type === 'call' || activity.type === 'meeting'
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deals Closed</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{performanceData.deals_closed}</p>
                  <p className="ml-2 text-sm font-medium text-success-600 dark:text-success-400">+12%</p>
                </div>
                <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Value</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{formatCurrency(performanceData.deals_value)}</p>
                  <p className="ml-2 text-sm font-medium text-success-600 dark:text-success-400">+8%</p>
                </div>
                <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-500 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conversion Rate</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{performanceData.conversion_rate}%</p>
                  <p className="ml-2 text-sm font-medium text-success-600 dark:text-success-400">+5%</p>
                </div>
                <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-500 rounded-full" style={{ width: `${performanceData.conversion_rate}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-300">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activity Metrics</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Calls Made</h4>
                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{performanceData.calls_made}</p>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Meetings Scheduled</h4>
                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{performanceData.meetings_scheduled}</p>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary-500 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Emails Sent</h4>
                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{performanceData.emails_sent}</p>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-500 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-300">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Deal Metrics</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Deal Size</h4>
                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(performanceData.average_deal_size)}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">15% higher than team average</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Sales Cycle</h4>
                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">32 days</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">8% faster than team average</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <UserAvatar user={user} size="lg" />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                    {user.first_name} {user.last_name}
                  </h1>
                  <div className="flex items-center mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.position} • {user.department}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="btn btn-outline flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 mt-4 overflow-x-auto">
              <button
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'performance'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setActiveTab('performance')}
              >
                Performance
              </button>
              <button
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'deals'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setActiveTab('deals')}
              >
                Deals
              </button>
              <button
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setActiveTab('tasks')}
              >
                Tasks
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveProfile}
            >
              Save Changes
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 gap-x-4">
          <div className="sm:col-span-3">
            <label htmlFor="first-name" className="form-label">
              First name
            </label>
            <input
              type="text"
              name="first-name"
              id="first-name"
              defaultValue={user.first_name}
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
              defaultValue={user.last_name}
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
              defaultValue={user.email}
              className="form-input"
            />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="phone" className="form-label">
              Phone number
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              defaultValue={user.phone}
              className="form-input"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="position" className="form-label">
              Position
            </label>
            <input
              type="text"
              name="position"
              id="position"
              defaultValue={user.position}
              className="form-input"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="department" className="form-label">
              Department
            </label>
            <input
              type="text"
              name="department"
              id="department"
              defaultValue={user.department}
              className="form-input"
            />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              defaultValue={user.location}
              className="form-input"
            />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="bio" className="form-label">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={user.bio}
              className="form-input"
            />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="photo" className="form-label">
              Photo
            </label>
            <div className="mt-1 flex items-center">
              <UserAvatar user={user} size="md" />
              <button
                type="button"
                className="ml-5 btn btn-outline"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </Modal>
      </div>
    </PageTransition>
  );
};

export default Profile;
