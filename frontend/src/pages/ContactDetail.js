import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  TagIcon,
  CalendarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useToastContext } from '../contexts/ToastContext';
import {
  getContactById,
  updateContact,
  deleteContact,
  resetContactState,
  clearContactDetail,
} from '../slices/contactSlice';
import { getCompanies } from '../slices/companySlice';

// Import sub-components
import ContactNotes from '../components/contact/ContactNotes';
import ContactFiles from '../components/contact/ContactFiles';
import ContactChat from '../components/contact/ContactChat';
import ContactTabs from '../components/contact/ContactTabs';
import ContactActivities from '../components/contact/ContactActivities';
import ContactEmails from '../components/contact/ContactEmails';

const ContactDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  
  const { contact, loading, error, success } = useSelector((state) => state.contacts);
  const { companies } = useSelector((state) => state.companies);
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  
  // Load contact data and companies on component mount
  useEffect(() => {
    dispatch(getContactById(id));
    dispatch(getCompanies());
    
    // Cleanup on unmount
    return () => {
      dispatch(clearContactDetail());
    };
  }, [dispatch, id]);
  
  // Set edit form data when contact data is loaded
  useEffect(() => {
    if (contact) {
      setEditContact({
        ...contact,
        company: contact.company?._id || '',
        address: {
          street: contact.address?.street || '',
          city: contact.address?.city || '',
          state: contact.address?.state || '',
          zipCode: contact.address?.zipCode || '',
          country: contact.address?.country || '',
        },
      });
    }
  }, [contact]);
  
  // Handle success and error states
  useEffect(() => {
    if (success) {
      showSuccess('Contact updated successfully!');
      setShowEditModal(false);
      setShowDeleteModal(false);
      dispatch(resetContactState());
    }
    
    if (error) {
      showError(error);
      dispatch(resetContactState());
    }
  }, [success, error, dispatch, showSuccess, showError]);
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditContact({
        ...editContact,
        [parent]: {
          ...editContact[parent],
          [child]: value,
        },
      });
    } else {
      setEditContact({
        ...editContact,
        [name]: value,
      });
    }
  };
  
  // Handle update contact form submission
  const handleUpdateContact = (e) => {
    e.preventDefault();
    
    if (!editContact.firstName.trim() || !editContact.lastName.trim()) {
      showError('First name and last name are required');
      return;
    }
    
    dispatch(updateContact({ id, contactData: editContact }));
  };
  
  // Handle delete contact
  const handleDeleteContact = () => {
    dispatch(deleteContact(id));
    navigate('/contacts');
  };
  
  // Render status badge
  const renderStatusBadge = () => {
    if (!contact) return null;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        contact.status === 'Active'
          ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:bg-opacity-20 dark:text-success-300'
          : contact.status === 'Lead'
          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:bg-opacity-20 dark:text-primary-300'
          : contact.status === 'Opportunity'
          ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:bg-opacity-20 dark:text-warning-300'
          : contact.status === 'Customer'
          ? 'bg-info-100 text-info-800 dark:bg-info-900 dark:bg-opacity-20 dark:text-info-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      }`}>
        {contact.status}
      </span>
    );
  };
  
  // Render edit contact modal
  const renderEditContactModal = () => {
    if (!editContact) return null;
    
    return (
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Contact"
        size="lg"
      >
        <form onSubmit={handleUpdateContact}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-input"
                value={editContact.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-input"
                value={editContact.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={editContact.email || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                className="form-input"
                value={editContact.phone || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="mobile" className="form-label">
                Mobile
              </label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                className="form-input"
                value={editContact.mobile || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="jobTitle" className="form-label">
                Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                className="form-input"
                value={editContact.jobTitle || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                className="form-input"
                value={editContact.department || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company" className="form-label">
                Company
              </label>
              <select
                id="company"
                name="company"
                className="form-input"
                value={editContact.company || ''}
                onChange={handleInputChange}
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={editContact.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Lead">Lead</option>
                <option value="Opportunity">Opportunity</option>
                <option value="Customer">Customer</option>
                <option value="Churned">Churned</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="type" className="form-label">
                Type
              </label>
              <select
                id="type"
                name="type"
                className="form-input"
                value={editContact.type}
                onChange={handleInputChange}
              >
                <option value="Prospect">Prospect</option>
                <option value="Customer">Customer</option>
                <option value="Partner">Partner</option>
                <option value="Vendor">Vendor</option>
                <option value="Employee">Employee</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="form-group mb-4">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="form-input"
              value={editContact.description || ''}
              onChange={handleInputChange}
            ></textarea>
          </div>
          
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2 mt-4">
            Address Information
          </h4>
          
          <div className="form-group mb-4">
            <label htmlFor="address.street" className="form-label">
              Street
            </label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              className="form-input"
              value={editContact.address.street}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="address.city" className="form-label">
                City
              </label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                className="form-input"
                value={editContact.address.city}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address.state" className="form-label">
                State/Province
              </label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                className="form-input"
                value={editContact.address.state}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="address.zipCode" className="form-label">
                Zip/Postal Code
              </label>
              <input
                type="text"
                id="address.zipCode"
                name="address.zipCode"
                className="form-input"
                value={editContact.address.zipCode}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address.country" className="form-label">
                Country
              </label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                className="form-input"
                value={editContact.address.country}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="btn btn-outline mr-2"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Update Contact'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };
  
  // Render delete confirmation modal
  const renderDeleteModal = () => {
    return (
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Contact"
      >
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to delete this contact? This action cannot be undone.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              className="btn btn-outline mr-2"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteContact}
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    );
  };
  
  // Render loading state
  if (loading && !contact) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Render error state
  if (error && !contact) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="text-danger-600 text-lg mb-4">Error loading contact: {error}</div>
        <button
          className="btn btn-primary"
          onClick={() => dispatch(getContactById(id))}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {/* Back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <button
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            onClick={() => navigate('/contacts')}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Contacts
          </button>
          
          <div className="flex space-x-2">
            <button
              className="btn btn-outline"
              onClick={() => setShowEditModal(true)}
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
        
        {contact && (
          <>
            {/* Contact header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <UserIcon className="h-10 w-10" />
                    </div>
                    <div className="ml-4">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {contact.firstName} {contact.lastName}
                      </h1>
                      <div className="flex items-center mt-1">
                        {contact.jobTitle && (
                          <span className="text-gray-600 dark:text-gray-400 mr-3">
                            {contact.jobTitle}
                            {contact.department && `, ${contact.department}`}
                          </span>
                        )}
                        {renderStatusBadge()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Created by: {contact.createdBy?.firstName} {contact.createdBy?.lastName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Created on: {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <button
                className="btn btn-outline flex items-center justify-center py-3"
                onClick={() => window.location.href = `mailto:${contact.email}`}
                disabled={!contact.email}
              >
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Send Email
              </button>
              
              <button
                className="btn btn-outline flex items-center justify-center py-3"
                onClick={() => window.location.href = `tel:${contact.phone}`}
                disabled={!contact.phone}
              >
                <PhoneIcon className="h-5 w-5 mr-2" />
                Call
              </button>
              
              <button
                className="btn btn-outline flex items-center justify-center py-3"
                onClick={() => setActiveTab('activities')}
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Schedule Activity
              </button>
              
              <button
                className="btn btn-outline flex items-center justify-center py-3"
                onClick={() => setActiveTab('chat')}
              >
                <VideoCameraIcon className="h-5 w-5 mr-2" />
                Video Call
              </button>
            </div>
            
            {/* Tabs */}
            <ContactTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* Tab content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {activeTab === 'overview' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        {contact.email && (
                          <div className="flex items-start">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Email
                              </div>
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                {contact.email}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {contact.phone && (
                          <div className="flex items-start">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Phone
                              </div>
                              <a
                                href={`tel:${contact.phone}`}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                {contact.phone}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {contact.mobile && (
                          <div className="flex items-start">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Mobile
                              </div>
                              <a
                                href={`tel:${contact.mobile}`}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                {contact.mobile}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {contact.company && (
                          <div className="flex items-start">
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Company
                              </div>
                              <a
                                href={`/companies/${contact.company._id}`}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                {contact.company.name}
                              </a>
                              {contact.company.industry && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {contact.company.industry}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {contact.jobTitle && (
                          <div className="flex items-start">
                            <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Job Title
                              </div>
                              <div className="text-gray-700 dark:text-gray-300">
                                {contact.jobTitle}
                                {contact.department && ` (${contact.department})`}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-start">
                          <TagIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Type
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">
                              {contact.type}
                            </div>
                          </div>
                        </div>
                        
                        {contact.assignedTo && (
                          <div className="flex items-start">
                            <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Assigned To
                              </div>
                              <div className="text-gray-700 dark:text-gray-300">
                                {contact.assignedTo.firstName} {contact.assignedTo.lastName}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Address Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Address Information
                      </h3>
                      
                      {contact.address && (
                        Object.values(contact.address).some(value => value) ? (
                          <div className="flex items-start">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Address
                              </div>
                              <div className="text-gray-700 dark:text-gray-300">
                                {contact.address.street && (
                                  <div>{contact.address.street}</div>
                                )}
                                {(contact.address.city || contact.address.state || contact.address.zipCode) && (
                                  <div>
                                    {contact.address.city && `${contact.address.city}, `}
                                    {contact.address.state && `${contact.address.state} `}
                                    {contact.address.zipCode && contact.address.zipCode}
                                  </div>
                                )}
                                {contact.address.country && (
                                  <div>{contact.address.country}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400">
                            No address information available
                          </div>
                        )
                      )}
                    </div>
                    
                    {/* Description */}
                    {contact.description && (
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Description
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {contact.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'notes' && (
                <ContactNotes contactId={id} />
              )}
              
              {activeTab === 'files' && (
                <ContactFiles contactId={id} />
              )}
              
              {activeTab === 'chat' && (
                <ContactChat contactId={id} />
              )}
              
              {activeTab === 'activities' && (
                <ContactActivities contactId={id} />
              )}
              
              {activeTab === 'emails' && (
                <ContactEmails contactId={id} contactEmail={contact.email} />
              )}
            </div>
          </>
        )}
        
        {/* Modals */}
        {renderEditContactModal()}
        {renderDeleteModal()}
      </div>
    </PageTransition>
  );
};

export default ContactDetail;
