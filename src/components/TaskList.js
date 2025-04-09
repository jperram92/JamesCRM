import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TaskList = ({ tasks: initialTasks, isLoading = false }) => {
  const [tasks, setTasks] = useState(initialTasks || []);

  // Toggle task completion
  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Format due date
  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // Otherwise return formatted date
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="badge badge-danger">High</span>;
      case 'medium':
        return <span className="badge badge-warning">Medium</span>;
      case 'low':
        return <span className="badge badge-success">Low</span>;
      default:
        return null;
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
        </div>
        <div className="card-body p-0">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="p-4 animate-pulse">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          View all
        </button>
      </div>
      <div className="card-body p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.length === 0 ? (
            <div className="empty-state py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new task.</p>
              <div className="mt-4">
                <button className="btn btn-primary btn-sm">Add task</button>
              </div>
            </div>
          ) : (
            tasks.map((task, index) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-150"
                  />
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {task.related_to}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(task.priority)}
                    <span className={`text-xs ${
                      new Date(task.due_date) < new Date() && !task.completed
                        ? 'text-danger-600 dark:text-danger-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatDueDate(task.due_date)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <div className="card-footer bg-gray-50 dark:bg-gray-800">
        <button className="btn btn-outline w-full">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Task
        </button>
      </div>
    </div>
  );
};

export default TaskList;
