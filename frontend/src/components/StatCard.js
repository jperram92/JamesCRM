import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, change, isLoading = false }) => {
  // Color classes based on the color prop
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-800',
    secondary: 'bg-secondary-50 text-secondary-700 border-secondary-200 dark:bg-secondary-900/20 dark:text-secondary-300 dark:border-secondary-800',
    accent: 'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-900/20 dark:text-accent-300 dark:border-accent-800',
    success: 'bg-success-50 text-success-700 border-success-200 dark:bg-success-900/20 dark:text-success-300 dark:border-success-800',
    warning: 'bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/20 dark:text-warning-300 dark:border-warning-800',
    danger: 'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-900/20 dark:text-danger-300 dark:border-danger-800',
  }[color] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';

  // Icon background color
  const iconBgColor = {
    primary: 'bg-primary-100 dark:bg-primary-800',
    secondary: 'bg-secondary-100 dark:bg-secondary-800',
    accent: 'bg-accent-100 dark:bg-accent-800',
    success: 'bg-success-100 dark:bg-success-800',
    warning: 'bg-warning-100 dark:bg-warning-800',
    danger: 'bg-danger-100 dark:bg-danger-800',
  }[color] || 'bg-gray-100 dark:bg-gray-700';

  // Change indicator color
  const changeColor = change > 0 
    ? 'text-success-600 dark:text-success-400' 
    : change < 0 
      ? 'text-danger-600 dark:text-danger-400' 
      : 'text-gray-500 dark:text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border p-5 ${colorClasses} transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
        </div>
        <div className={`p-2 rounded-full ${iconBgColor}`}>
          {icon}
        </div>
      </div>
      
      {change !== undefined && !isLoading && (
        <div className="mt-2 flex items-center">
          <span className={`text-sm font-medium ${changeColor}`}>
            {change > 0 ? '↑' : change < 0 ? '↓' : '•'} {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">from last month</span>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-2 h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      )}
    </motion.div>
  );
};

export default StatCard;
