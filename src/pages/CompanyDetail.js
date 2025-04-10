import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useToastContext } from '../contexts/ToastContext';
import {
  getCompanyById,
  updateCompany,
  deleteCompany,
  resetCompanyState,
  clearCompanyDetail,
} from '../slices/companySlice';

// Import sub-components
import CompanyNotes from '../components/company/CompanyNotes';
import CompanyFiles from '../components/company/CompanyFiles';
import CompanyChat from '../components/company/CompanyChat';
import CompanyTabs from '../components/company/CompanyTabs';

const CompanyDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  
  const { company, loading, error, success } = useSelector((state) => state.companies);
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  
  // Load company data on component mount
  useEffect(() => {
    dispatch(getCompanyById(id));
    
    // Cleanup on unmount
    return () => {
      dispatch(clearCompanyDetail());
    };
  }, [dispatch, id]);
  
  // Set edit form data when company data is loaded
  useEffect(() => {
    if (company) {
      setEditCompany({
        ...company,
        address: {
          street: company.address?.street || '',
          city: company.address?.city || '',
          state: company.address?.state || '',
          zipCode: company.address?.zipCode || '',
          country: company.address?.country || '',
        },
      });
    }
  }, [company]);
  
  // Handle success and error states
  useEffect(() => {
    if (success) {
      showSuccess('Company updated successfully!');
      setShowEditModal(false);
      setShowDeleteModal(false);
      dispatch(resetCompanyState());
    }
    
    if (error) {
      showError(error);
      dispatch(resetCompanyState());
    }
  }, [success, error, dispatch, showSuccess, showError]);
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditCompany({
        ...editCompany,
        [parent]: {
          ...editCompany[parent],
          [child]: value,
        },
      });
    } else {
      setEditCompany({
        ...editCompany,
        [name]: value,
      });
    }
  };
  
  // Handle update company form submission
  const handleUpdateCompany = (e) => {
    e.preventDefault();
    
    if (!editCompany.name.trim()) {
      showError('Company name is required');
      return;
    }
    
    dispatch(updateCompany({ id, companyData: editCompany }));
  };
  
  // Handle delete company
  const handleDeleteCompany = () => {
    dispatch(deleteCompany(id));
    navigate('/companies');
  };
  
  // Render loading state
  if (loading && !company) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Render error state
  if (error && !company) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="text-danger-600 text-lg mb-4">Error loading company: {error}</div>
        <button
          className="btn btn-primary"
          onClick={() => dispatch(getCompanyById(id))}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // Render edit company modal
  const renderEditCompanyModal = () => (
    <Modal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      title="Edit Company"
      size="lg"
    >
      {editCompany && (
        <form onSubmit={handleUpdateCompany}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Company Name <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editCompany.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="industry" className="form-label">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={editCompany.industry || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="website" className="form-label">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={editCompany.website || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editCompany.email || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={editCompany.phone || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type" className="form-label">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={editCompany.type || 'Prospect'}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Customer">Customer</option>
                  <option value="Partner">Partner</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={editCompany.status || 'Active'}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Lead">Lead</option>
                  <option value="Opportunity">Opportunity</option>
                  <option value="Customer">Customer</option>
                  <option value="Churned">Churned</option>
                </select>
              </div>
              
              {/* Address Information */}
              <div className="form-group">
                <label htmlFor="address.street" className="form-label">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={editCompany.address?.street || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address.city" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={editCompany.address?.city || ''}
                  onChange={handleInputChange}
                  className="form-input"
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
                  value={editCompany.address?.state || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address.zipCode" className="form-label">
                  Zip/Postal Code
                </label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={editCompany.address?.zipCode || ''}
                  onChange={handleInputChange}
                  className="form-input"
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
                  value={editCompany.address?.country || ''}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Update Company'}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
  
  // Render delete confirmation modal
  const renderDeleteModal = () => (
    <Modal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Delete Company"
      size="md"
    >
      <div className="space-y-6">
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete <span className="font-semibold">{company?.name}</span>?
          This action cannot be undone and will remove all associated data.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteCompany}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Delete Company'}
          </button>
        </div>
      </div>
    </Modal>
  );
  
  // Render company status badge
  const renderStatusBadge = () => {
    if (!company) return null;
    
    let statusColor = '';
    
    switch (company.status) {
      case 'Active':
        statusColor = 'bg-green-100 text-green-800';
        break;
      case 'Inactive':
        statusColor = 'bg-gray-100 text-gray-800';
        break;
      case 'Lead':
        statusColor = 'bg-blue-100 text-blue-800';
        break;
      case 'Opportunity':
        statusColor = 'bg-yellow-100 text-yellow-800';
        break;
      case 'Customer':
        statusColor = 'bg-purple-100 text-purple-800';
        break;
      case 'Churned':
        statusColor = 'bg-red-100 text-red-800';
        break;
      default:
        statusColor = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
        {company.status}
      </span>
    );
  };
  
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {/* Back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <button
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            onClick={() => navigate('/companies')}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Companies
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
        
        {company && (
          <>
            {/* Company header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <BuildingOfficeIcon className="h-10 w-10" />
                    </div>
                    <div className="ml-4">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {company.name}
                      </h1>
                      <div className="flex items-center mt-1">
                        {company.industry && (
                          <span className="text-gray-600 dark:text-gray-400 mr-3">
                            {company.industry}
                          </span>
                        )}
                        {renderStatusBadge()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Created by: {company.createdBy?.firstName} {company.createdBy?.lastName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Created on: {new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <CompanyTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
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
                        {company.website && (
                          <div className="flex items-start">
                            <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Website
                              </div>
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                {company.website}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {company.email && (
                          <div className="flex items-start">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Email
                              </div>
                              <a
                                href={`mailto:${company.email}`}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                {company.email}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {company.phone && (
                          <div className="flex items-start">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                Phone
                              </div>
                              <a
                                href={`tel:${company.phone}`}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                {company.phone}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Address */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Address
                      </h3>
                      {company.address && (
                        <div className="flex items-start">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            {company.address.street && (
                              <div className="text-gray-700 dark:text-gray-300">
                                {company.address.street}
                              </div>
                            )}
                            {(company.address.city || company.address.state || company.address.zipCode) && (
                              <div className="text-gray-700 dark:text-gray-300">
                                {company.address.city && `${company.address.city}, `}
                                {company.address.state && `${company.address.state} `}
                                {company.address.zipCode && company.address.zipCode}
                              </div>
                            )}
                            {company.address.country && (
                              <div className="text-gray-700 dark:text-gray-300">
                                {company.address.country}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Additional Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Additional Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <TagIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Type
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">
                              {company.type || 'Not specified'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Assigned To
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">
                              {company.assignedTo ? (
                                `${company.assignedTo.firstName} ${company.assignedTo.lastName}`
                              ) : (
                                'Unassigned'
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Last Updated
                            </div>
                            <div className="text-gray-700 dark:text-gray-300">
                              {new Date(company.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    {company.description && (
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Description
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {company.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'notes' && (
                <CompanyNotes companyId={id} />
              )}
              
              {activeTab === 'files' && (
                <CompanyFiles companyId={id} />
              )}
              
              {activeTab === 'chat' && (
                <CompanyChat companyId={id} />
              )}
            </div>
          </>
        )}
        
        {/* Modals */}
        {renderEditCompanyModal()}
        {renderDeleteModal()}
      </div>
    </PageTransition>
  );
};

export default CompanyDetail;
