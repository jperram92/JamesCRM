import React from 'react';

const UserAvatar = ({ user, size = 'md' }) => {
  // Get initials from user name
  const getInitials = () => {
    if (!user || (!user.first_name && !user.last_name)) {
      return 'U';
    }
    
    const firstInitial = user.first_name ? user.first_name.charAt(0) : '';
    const lastInitial = user.last_name ? user.last_name.charAt(0) : '';
    
    return `${firstInitial}${lastInitial}`;
  };
  
  // Determine avatar size class
  const sizeClass = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }[size] || 'h-10 w-10 text-sm';
  
  // Generate a consistent color based on the user's name
  const getColorClass = () => {
    if (!user) return 'bg-gray-400';
    
    const colors = [
      'bg-primary-500',
      'bg-secondary-500',
      'bg-accent-500',
      'bg-success-500',
      'bg-warning-500',
      'bg-danger-500',
    ];
    
    const name = `${user.first_name || ''}${user.last_name || ''}`;
    const index = name.length > 0 
      ? name.charCodeAt(0) % colors.length 
      : 0;
      
    return colors[index];
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClass} rounded-full text-white ${getColorClass()}`}>
      {user?.profile_image ? (
        <img
          src={user.profile_image}
          alt={`${user.first_name} ${user.last_name}`}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span className="font-medium">{getInitials()}</span>
      )}
    </div>
  );
};

export default UserAvatar;
