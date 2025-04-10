import React, { useState } from 'react';
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../LoadingSpinner';
import Modal from '../Modal';

const ContactEmails = ({ contactId, contactEmail }) => {
  const [loading, setLoading] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  
  // Mock email templates for demonstration
  const emailTemplates = [
    { id: '1', name: 'Welcome Email', subject: 'Welcome to Our Company', body: 'Dear {{firstName}},\n\nWelcome to our company! We are excited to have you as a customer.\n\nBest regards,\nThe Team' },
    { id: '2', name: 'Follow-up Meeting', subject: 'Follow-up: Our Recent Meeting', body: 'Dear {{firstName}},\n\nThank you for taking the time to meet with us yesterday. As discussed, we will...\n\nBest regards,\nThe Team' },
    { id: '3', name: 'Product Update', subject: 'New Features Available', body: 'Dear {{firstName}},\n\nWe are excited to announce new features in our product that we think you\'ll love...\n\nBest regards,\nThe Team' },
  ];
  
  // Mock emails for demonstration
  const [emails, setEmails] = useState([
    {
      id: '1',
      subject: 'Welcome to Our Service',
      body: 'Dear John,\n\nWelcome to our service! We are excited to have you on board.\n\nBest regards,\nThe Team',
      status: 'sent',
      sentAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      openedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
      sentBy: {
        firstName: 'Admin',
        lastName: 'User'
      }
    },
    {
      id: '2',
      subject: 'Your Recent Inquiry',
      body: 'Dear John,\n\nThank you for your recent inquiry about our premium services. I wanted to follow up and see if you had any questions.\n\nBest regards,\nThe Team',
      status: 'sent',
      sentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      openedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      sentBy: {
        firstName: 'Jane',
        lastName: 'Smith'
      }
    },
    {
      id: '3',
      subject: 'Upcoming Webinar Invitation',
      body: 'Dear John,\n\nWe would like to invite you to our upcoming webinar on "Industry Best Practices" scheduled for next week.\n\nBest regards,\nThe Team',
      status: 'sent',
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      openedAt: null,
      sentBy: {
        firstName: 'Admin',
        lastName: 'User'
      }
    },
    {
      id: '4',
      subject: 'Failed Delivery: Quarterly Newsletter',
      body: 'Dear John,\n\nHere is our quarterly newsletter with updates on our company and products.\n\nBest regards,\nThe Team',
      status: 'failed',
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      error: 'Mailbox full',
      sentBy: {
        firstName: 'Admin',
        lastName: 'User'
      }
    }
  ]);
  
  // Handle template selection
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    if (!templateId) {
      setEmailSubject('');
      setEmailBody('');
      return;
    }
    
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailBody(template.body);
    }
  };
  
  // Handle send email
  const handleSendEmail = (e) => {
    e.preventDefault();
    
    if (!emailSubject.trim() || !emailBody.trim()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newEmail = {
        id: Math.random().toString(36).substring(2, 9),
        subject: emailSubject,
        body: emailBody,
        status: 'sent',
        sentAt: new Date().toISOString(),
        openedAt: null,
        sentBy: {
          firstName: 'Admin',
          lastName: 'User'
        }
      };
      
      setEmails([newEmail, ...emails]);
      setLoading(false);
      setShowComposeModal(false);
      
      // Reset form
      setEmailSubject('');
      setEmailBody('');
      setEmailTemplate('');
    }, 2000);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status icon
  const getStatusIcon = (status, openedAt) => {
    if (status === 'sent' && openedAt) {
      return <EyeIcon className="h-5 w-5 text-success-500" title="Opened" />;
    } else if (status === 'sent') {
      return <CheckCircleIcon className="h-5 w-5 text-primary-500" title="Sent" />;
    } else if (status === 'failed') {
      return <ExclamationCircleIcon className="h-5 w-5 text-danger-500" title="Failed" />;
    } else {
      return <ClockIcon className="h-5 w-5 text-gray-500" title="Pending" />;
    }
  };
  
  // Render compose email modal
  const renderComposeEmailModal = () => {
    return (
      <Modal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        title="Compose Email"
        size="lg"
      >
        <form onSubmit={handleSendEmail}>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="emailTo" className="form-label">
                To
              </label>
              <input
                type="text"
                id="emailTo"
                className="form-input bg-gray-100 dark:bg-gray-700"
                value={contactEmail || 'No email address available'}
                disabled
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="emailTemplate" className="form-label">
                Use Template (Optional)
              </label>
              <select
                id="emailTemplate"
                className="form-input"
                value={emailTemplate}
                onChange={(e) => {
                  setEmailTemplate(e.target.value);
                  handleTemplateChange(e);
                }}
              >
                <option value="">Select a template...</option>
                {emailTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="emailSubject" className="form-label">
                Subject
              </label>
              <input
                type="text"
                id="emailSubject"
                className="form-input"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="emailBody" className="form-label">
                Message
              </label>
              <textarea
                id="emailBody"
                className="form-input"
                rows="10"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                required
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowComposeModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !contactEmail}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
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
            Email History
          </h3>
          <div className="flex space-x-2">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setEmails([...emails])}
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowComposeModal(true)}
              disabled={!contactEmail}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Compose Email
            </button>
          </div>
        </div>
        
        {!contactEmail && (
          <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-4 rounded-md mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  This contact does not have an email address. Add an email address to send emails.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Emails List */}
        <div className="space-y-4">
          {emails.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <EnvelopeIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No emails sent yet. Compose your first email above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sent By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sent Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Opened Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {emails.map((email) => (
                    <tr key={email.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(email.status, email.openedAt)}
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            {email.status === 'failed' && email.error ? email.error : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {email.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {email.sentBy.firstName} {email.sentBy.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(email.sentAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {email.openedAt ? formatDate(email.openedAt) : 'Not opened'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Compose Email Modal */}
      {renderComposeEmailModal()}
    </div>
  );
};

export default ContactEmails;
