import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', withText = true }) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }[size] || 'h-8 w-8';
  
  // Text size classes
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size] || 'text-xl';

  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className={`${sizeClasses} rounded-md bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold`}>
        <span>J</span>
      </div>
      {withText && (
        <span className={`${textSizeClasses} font-display font-bold text-gray-900 dark:text-white`}>
          JamesCRM
        </span>
      )}
    </Link>
  );
};

export default Logo;
