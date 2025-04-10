import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import PageTransition from '../components/PageTransition';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useToastContext } from '../contexts/ToastContext';
import { getContacts, createContact, resetContactState } from '../slices/contactSlice';
import { getCompanies } from '../slices/companySlice';

const Contacts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  
  const { contacts, loading, error, success } = useSelector((state) => state.contacts);
  const { companies } = useSelector((state) => state.companies);
  const { user } = useSelector((state) => state.auth);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    jobTitle: '',
    department: '',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    status: 'Active',
    type: 'Prospect',
  });
  
  // Load contacts and companies on component mount
  useEffect(() => {
    dispatch(getContacts());
    dispatch(getCompanies());
  }, [dispatch]);
  
  // Handle success and error states
  useEffect(() => {
    if (success) {
      showSuccess('Contact created successfully!');
      setShowCreateModal(false);
      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        mobile: '',
        jobTitle: '',
        department: '',
        company: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        status: 'Active',
        type: 'Prospect',
      });
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
      setNewContact({
        ...newContact,
        [parent]: {
          ...newContact[parent],
          [child]: value,
        },
      });
    } else {
      setNewContact({
        ...newContact,
        [name]: value,
      });
    }
  };
  
  // Handle create contact form submission
  const handleCreateContact = (e) => {
    e.preventDefault();
    
    if (!newContact.firstName.trim() || !newContact.lastName.trim()) {
      showError('First name and last name are required');
      return;
    }
    
    dispatch(createContact(newContact));
  };
  
  // Handle row click to navigate to contact detail
  const handleRowClick = (contact) => {
    navigate(`/contacts/${contact._id}`);
  };
  
  // Filter contacts based on search term and filters
  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const matchesSearch = searchTerm
      ? fullName.includes(searchTerm.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.jobTitle && contact.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
      
    const matchesStatus = filterStatus
      ? contact.status === filterStatus
      : true;
      
    const matchesType = filterType
      ? contact.type === filterType
      : true;
      
    const matchesCompany = filterCompany
      ? contact.company && contact.company._id === filterCompany
      : true;
      
    return matchesSearch && matchesStatus && matchesType && matchesCompany;
  });
  
  // Table columns configuration
  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (contact) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <UserIcon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900 dark:text-white">
              {contact.firstName} {contact.lastName}
            </div>
            {contact.jobTitle && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {contact.jobTitle}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      render: (contact) => (
        <div>
          {contact.company ? (
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-1.5" />
              <span className="text-gray-900 dark:text-white">
                {contact.company.name}
              </span>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              Not assigned
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (contact) => (
        <div>
          {contact.email ? (
            <div className="flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-1.5" />
              <span className="text-gray-900 dark:text-white">
                {contact.email}
              </span>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              No email
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (contact) => (
        <div>
          {contact.phone ? (
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 text-gray-400 mr-1.5" />
              <span className="text-gray-900 dark:text-white">
                {contact.phone}
              </span>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              No phone
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (contact) => (
        <div>
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
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (contact) => (
        <div className="text-gray-900 dark:text-white">
          {contact.type}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (contact) => (
        <div className="text-gray-500 dark:text-gray-400">
          {new Date(contact.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];
  
  // Render create contact modal
  const renderCreateContactModal = () => {
    return (
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Contact"
        size="lg"
      >
        <form onSubmit={handleCreateContact}>
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
                value={newContact.firstName}
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
                value={newContact.lastName}
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
                value={newContact.email}
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
                value={newContact.phone}
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
                value={newContact.mobile}
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
                value={newContact.jobTitle}
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
                value={newContact.department}
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
                value={newContact.company}
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
                value={newContact.status}
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
                value={newContact.type}
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
              value={newContact.address.street}
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
                value={newContact.address.city}
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
                value={newContact.address.state}
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
                value={newContact.address.zipCode}
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
                value={newContact.address.country}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="btn btn-outline mr-2"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Create Contact'}
            </button>
          </div>
        </form>
      </Modal>
    );
  };
  
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your contacts and relationships
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                className="form-input pl-10 w-full"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="relative">
                <select
                  className="form-input pl-9 pr-8 py-2"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Lead">Lead</option>
                  <option value="Opportunity">Opportunity</option>
                  <option value="Customer">Customer</option>
                  <option value="Churned">Churned</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Type Filter */}
              <div className="relative">
                <select
                  className="form-input pl-9 pr-8 py-2"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Customer">Customer</option>
                  <option value="Partner">Partner</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Employee">Employee</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Company Filter */}
              <div className="relative">
                <select
                  className="form-input pl-9 pr-8 py-2"
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Refresh Button */}
              <button
                className="btn btn-outline py-2 px-3"
                onClick={() => dispatch(getContacts())}
                disabled={loading}
              >
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Create Contact Button */}
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Contact
              </button>
            </div>
          </div>
        </div>
        
        {/* Contacts Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredContacts}
            isLoading={loading}
            emptyMessage="No contacts found"
            onRowClick={handleRowClick}
            rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          />
        </div>
        
        {/* Create Contact Modal */}
        {renderCreateContactModal()}
      </div>
    </PageTransition>
  );
};

export default Contacts;
