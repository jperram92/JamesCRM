import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../LoadingSpinner';
import { useToastContext } from '../../contexts/ToastContext';
import {
  getContactMessages,
  createContactMessage,
  markContactMessagesAsRead,
  resetContactState,
} from '../../slices/contactSlice';

const ContactChat = ({ contactId }) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToastContext();
  const messagesEndRef = useRef(null);
  
  const { messages, loading, error, success } = useSelector((state) => state.contacts);
  const { user } = useSelector((state) => state.auth);
  const contactMessages = messages[contactId] || [];
  
  const [messageContent, setMessageContent] = useState('');
  
  // Load messages on component mount
  useEffect(() => {
    dispatch(getContactMessages(contactId));
    
    // Mark messages as read
    dispatch(markContactMessagesAsRead(contactId));
    
    // Set up polling for new messages
    const interval = setInterval(() => {
      dispatch(getContactMessages(contactId));
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
  }, [dispatch, contactId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [contactMessages]);
  
  // Handle success and error states
  useEffect(() => {
    if (success) {
      setMessageContent('');
      dispatch(resetContactState());
    }
    
    if (error) {
      showError(error);
      dispatch(resetContactState());
    }
  }, [success, error, dispatch, showSuccess, showError]);
  
  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageContent.trim()) {
      return;
    }
    
    dispatch(createContactMessage({ id: contactId, content: messageContent }));
  };
  
  // Format date
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      // Within a week
      return `${date.toLocaleDateString([], { weekday: 'long' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // Older
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];
    
    contactMessages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toLocaleDateString();
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentGroup,
          });
        }
        
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentGroup,
      });
    }
    
    return groups;
  };
  
  // Format date header
  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };
  
  // Check if message is from current user
  const isCurrentUser = (messageUserId) => {
    return messageUserId === user?._id;
  };
  
  const messageGroups = groupMessagesByDate();
  
  return (
    <div className="flex flex-col h-[calc(100vh-300px)] min-h-[500px]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && contactMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : contactMessages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-500 dark:text-gray-400">
            <ChatBubbleLeftRightIcon className="h-12 w-12 mb-3 text-gray-400" />
            <p className="text-center">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-400">
                    {formatDateHeader(group.date)}
                  </div>
                </div>
                
                {group.messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      isCurrentUser(message.createdBy?._id) ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        isCurrentUser(message.createdBy?._id)
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {!isCurrentUser(message.createdBy?._id) && (
                        <div className="flex items-center mb-1">
                          <UserCircleIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {message.createdBy?.firstName} {message.createdBy?.lastName}
                          </span>
                        </div>
                      )}
                      <div className="whitespace-pre-line">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          isCurrentUser(message.createdBy?._id)
                            ? 'text-primary-600 dark:text-primary-300 text-right'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            className="form-input flex-1 mr-2"
            placeholder="Type your message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !messageContent.trim()}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactChat;
