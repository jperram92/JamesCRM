import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { HomeIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            delay: 0.1,
            duration: 0.8
          }}
        >
          <div className="relative">
            <h1 className="text-9xl font-extrabold text-primary-200 dark:text-primary-900">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-32 h-32 text-primary-500 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8"
        >
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Go back to Dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 text-sm text-gray-500 dark:text-gray-400"
        >
          <p>Lost? Here are some helpful links:</p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link to="/" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Dashboard
            </Link>
            <Link to="/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Login
            </Link>
            <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              Help Center
            </a>
          </div>
        </motion.div>
      </motion.div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
