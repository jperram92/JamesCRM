import React, { useState } from 'react';
import {
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../LoadingSpinner';
import Modal from '../Modal';

const ContactActivities = ({ contactId }) => {
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activityType, setActivityType] = useState('call');
  const [activityDate, setActivityDate] = useState('');
  const [activityTime, setActivityTime] = useState('');
  const [activityDuration, setActivityDuration] = useState('30');
  const [activityNotes, setActivityNotes] = useState('');
  
  // Mock activities for demonstration
  const [activities, setActivities] = useState([
    {
      id: '1',
      type: 'call',
      status: 'completed',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 15,
      notes: 'Discussed the new project requirements',
      createdBy: {
        firstName: 'Admin',
        lastName: 'User'
      }
    },
    {
      id: '2',
      type: 'meeting',
      status: 'scheduled',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      notes: 'Quarterly review meeting',
      createdBy: {
        firstName: 'Jane',
        lastName: 'Smith'
      }
    },
    {
      id: '3',
      type: 'email',
      status: 'completed',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Sent follow-up email about the proposal',
      createdBy: {
        firstName: 'Admin',
        lastName: 'User'
      }
    }
  ]);
  
  // Handle create activity
  const handleCreateActivity = (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newActivity = {
        id: Math.random().toString(36).substring(2, 9),
        type: activityType,
        status: 'scheduled',
        date: new Date(`${activityDate}T${activityTime}`).toISOString(),
        duration: parseInt(activityDuration),
        notes: activityNotes,
        createdBy: {
          firstName: 'Admin',
          lastName: 'User'
        }
      };
      
      setActivities([newActivity, ...activities]);
      setLoading(false);
      setShowCreateModal(false);
      
      // Reset form
      setActivityType('call');
      setActivityDate('');
      setActivityTime('');
      setActivityDuration('30');
      setActivityNotes('');
    }, 1000);
  };
  
  // Handle mark as complete
  const handleMarkComplete = (activityId) => {
    setActivities(
      activities.map((activity) =>
        activity.id === activityId
          ? { ...activity, status: 'completed' }
          : activity
      )
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'call':
        return <PhoneIcon className="h-5 w-5 text-blue-500" />;
      case 'meeting':
        return <CalendarIcon className="h-5 w-5 text-purple-500" />;
      case 'email':
        return <EnvelopeIcon className="h-5 w-5 text-green-500" />;
      case 'video':
        return <VideoCameraIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CalendarIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Render create activity modal
  const renderCreateActivityModal = () => {
    return (
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule Activity"
      >
        <form onSubmit={handleCreateActivity}>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="activityType" className="form-label">
                Activity Type
              </label>
              <select
                id="activityType"
                className="form-input"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
              >
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="email">Email</option>
                <option value="video">Video Call</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="activityDate" className="form-label">
                  Date
                </label>
                <input
                  type="date"
                  id="activityDate"
                  className="form-input"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="activityTime" className="form-label">
                  Time
                </label>
                <input
                  type="time"
                  id="activityTime"
                  className="form-input"
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="activityDuration" className="form-label">
                Duration (minutes)
              </label>
              <select
                id="activityDuration"
                className="form-input"
                value={activityDuration}
                onChange={(e) => setActivityDuration(e.target.value)}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="activityNotes" className="form-label">
                Notes
              </label>
              <textarea
                id="activityNotes"
                className="form-input"
                rows="3"
                value={activityNotes}
                onChange={(e) => setActivityNotes(e.target.value)}
                placeholder="Add any notes or agenda items..."
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Schedule Activity'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Activities
          </h3>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Schedule Activity
          </button>
        </div>
        
        {/* Activities List */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No activities scheduled. Create your first activity above.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activities.map((activity) => (
                <div key={activity.id} className="py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {activity.type} {activity.type === 'call' || activity.type === 'video' ? 'with' : 'about'} Contact
                          </div>
                          <div className="flex items-center mt-1">
                            <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(activity.date)}
                              {activity.duration && ` (${activity.duration} min)`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            activity.status === 'completed'
                              ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:bg-opacity-20 dark:text-success-300'
                              : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:bg-opacity-20 dark:text-primary-300'
                          }`}>
                            {activity.status === 'completed' ? 'Completed' : 'Scheduled'}
                          </span>
                          {activity.status !== 'completed' && (
                            <button
                              type="button"
                              className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                              onClick={() => handleMarkComplete(activity.id)}
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                      {activity.notes && (
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          {activity.notes}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Created by {activity.createdBy.firstName} {activity.createdBy.lastName}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Create Activity Modal */}
      {renderCreateActivityModal()}
    </div>
  );
};

export default ContactActivities;
