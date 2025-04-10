import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import ActivityFeed from '../components/ActivityFeed';
import TaskList from '../components/TaskList';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [dealsByStageData, setDealsByStageData] = useState(null);
  const [activitiesData, setActivitiesData] = useState([]);
  const [tasksData, setTasksData] = useState([]);

  useEffect(() => {
    // Simulate API data loading
    const loadData = async () => {
      // Wait for a short delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Set mock data
      setStats({
        contacts: 1248,
        companies: 342,
        deals: 76,
        closedDeals: 28,
        contactsChange: 12,
        companiesChange: 8,
        dealsChange: 24,
        closedDealsChange: -5,
      });

      setSalesData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'This Year',
            data: [30000, 45000, 32000, 60000, 56000, 48000, 72000, 68000, 90000, 98000, 87000, 104000],
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Last Year',
            data: [25000, 38000, 30000, 45000, 42000, 38000, 60000, 58000, 75000, 82000, 80000, 90000],
            borderColor: '#8b5cf6',
            borderDash: [5, 5],
            backgroundColor: 'transparent',
            tension: 0.4,
          },
        ],
      });

      setDealsByStageData({
        labels: ['Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
        datasets: [
          {
            label: 'Number of Deals',
            data: [25, 18, 12, 8, 15, 7],
            backgroundColor: [
              '#bae6fd', // primary-200
              '#7dd3fc', // primary-300
              '#38bdf8', // primary-400
              '#0ea5e9', // primary-500
              '#22c55e', // success-500
              '#ef4444', // danger-500
            ],
            borderWidth: 0,
          },
        ],
      });

      setActivitiesData([
        {
          id: 1,
          user: { first_name: 'John', last_name: 'Doe' },
          type: 'call',
          description: 'made a call with',
          target: 'Acme Inc.',
          date: '2023-06-15T14:30:00',
        },
        {
          id: 2,
          user: { first_name: 'Sarah', last_name: 'Johnson' },
          type: 'email',
          description: 'sent an email to',
          target: 'Jane Smith',
          date: '2023-06-15T11:20:00',
        },
        {
          id: 3,
          user: { first_name: 'Michael', last_name: 'Brown' },
          type: 'meeting',
          description: 'scheduled a meeting with',
          target: 'Tech Solutions Ltd',
          date: '2023-06-14T16:45:00',
        },
        {
          id: 4,
          user: { first_name: 'Emily', last_name: 'Wilson' },
          type: 'task',
          description: 'completed a task for',
          target: 'Project Alpha',
          date: '2023-06-14T09:15:00',
        },
        {
          id: 5,
          user: { first_name: 'David', last_name: 'Clark' },
          type: 'note',
          description: 'added a note about',
          target: 'Global Enterprises',
          date: '2023-06-13T15:30:00',
        },
      ]);

      setTasksData([
        {
          id: 1,
          title: 'Follow up with Acme Inc.',
          completed: false,
          due_date: '2023-06-16T10:00:00',
          priority: 'high',
          related_to: 'Acme Inc. - Deal #1234',
        },
        {
          id: 2,
          title: 'Prepare proposal for Tech Solutions',
          completed: false,
          due_date: '2023-06-17T14:00:00',
          priority: 'medium',
          related_to: 'Tech Solutions - Deal #5678',
        },
        {
          id: 3,
          title: 'Call Jane Smith',
          completed: true,
          due_date: '2023-06-15T11:00:00',
          priority: 'medium',
          related_to: 'Jane Smith - Contact',
        },
        {
          id: 4,
          title: 'Send contract to Global Enterprises',
          completed: false,
          due_date: '2023-06-18T09:00:00',
          priority: 'high',
          related_to: 'Global Enterprises - Deal #9012',
        },
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-300">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          </div>
        </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Contacts"
            value={stats?.contacts.toLocaleString() || ''}
            icon={<UserGroupIcon className="h-5 w-5" />}
            color="primary"
            change={stats?.contactsChange}
            isLoading={isLoading}
          />
          <StatCard
            title="Companies"
            value={stats?.companies.toLocaleString() || ''}
            icon={<BuildingOfficeIcon className="h-5 w-5" />}
            color="secondary"
            change={stats?.companiesChange}
            isLoading={isLoading}
          />
          <StatCard
            title="Active Deals"
            value={stats?.deals.toLocaleString() || ''}
            icon={<CurrencyDollarIcon className="h-5 w-5" />}
            color="accent"
            change={stats?.dealsChange}
            isLoading={isLoading}
          />
          <StatCard
            title="Closed Deals"
            value={stats?.closedDeals.toLocaleString() || ''}
            icon={<CheckCircleIcon className="h-5 w-5" />}
            color="success"
            change={stats?.closedDealsChange}
            isLoading={isLoading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ChartCard
              title="Sales Performance"
              subtitle="Monthly revenue comparison"
              type="line"
              data={salesData}
              isLoading={isLoading}
            />
          </div>
          <div>
            <ChartCard
              title="Deals by Stage"
              subtitle="Current distribution"
              type="doughnut"
              data={dealsByStageData}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Activity & Tasks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ActivityFeed activities={activitiesData} isLoading={isLoading} />
          <TaskList tasks={tasksData} isLoading={isLoading} />
        </div>

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 transition-colors duration-300"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button className="btn btn-outline flex flex-col items-center justify-center py-4 h-full">
              <UserGroupIcon className="h-6 w-6 mb-2" />
              <span>Add Contact</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center justify-center py-4 h-full">
              <BuildingOfficeIcon className="h-6 w-6 mb-2" />
              <span>Add Company</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center justify-center py-4 h-full">
              <CurrencyDollarIcon className="h-6 w-6 mb-2" />
              <span>Create Deal</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center justify-center py-4 h-full">
              <CalendarIcon className="h-6 w-6 mb-2" />
              <span>Schedule</span>
            </button>
            <a href="/admin" className="btn btn-primary flex flex-col items-center justify-center py-4 h-full">
              <ShieldCheckIcon className="h-6 w-6 mb-2" />
              <span>Admin Panel</span>
            </a>
          </div>
        </motion.div>

        {/* Communication Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-start">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <EnvelopeIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Email Campaigns</h3>
                <p className="mb-4 opacity-90">Reach out to your contacts with targeted email campaigns.</p>
                <button className="btn bg-white text-primary-600 hover:bg-white/90">
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-start">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <PhoneIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Call Center</h3>
                <p className="mb-4 opacity-90">Make and track calls directly from the CRM platform.</p>
                <button className="btn bg-white text-secondary-600 hover:bg-white/90">
                  Start Calling
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
