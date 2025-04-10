import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import PageTransition from '../components/PageTransition';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useToastContext } from '../contexts/ToastContext';
import { getCompanies, createCompany, resetCompanyState } from '../slices/companySlice';

const Companies = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  
  const { companies, loading, error, success } = useSelector((state) => state.companies);
  const { user } = useSelector((state) => state.auth);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    website: '',
    phone: '',
    email: '',
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
  
  // Load companies on component mount
  useEffect(() => {
    dispatch(getCompanies());
  }, [dispatch]);
  
  // Handle success and error states
  useEffect(() => {
    if (success) {
      showSuccess('Company created successfully!');
      setShowCreateModal(false);
      setNewCompany({
        name: '',
        industry: '',
        website: '',
        phone: '',
        email: '',
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
      setNewCompany({
        ...newCompany,
        [parent]: {
          ...newCompany[parent],
          [child]: value,
        },
      });
    } else {
      setNewCompany({
        ...newCompany,
        [name]: value,
      });
    }
  };
  
  // Handle create company form submission
  const handleCreateCompany = (e) => {
    e.preventDefault();
    
    if (!newCompany.name.trim()) {
      showError('Company name is required');
      return;
    }
    
    dispatch(createCompany(newCompany));
  };
  
  // Handle row click to navigate to company detail
  const handleRowClick = (company) => {
    navigate(`/companies/${company._id}`);
  };
  
  // Filter companies based on search term and filters
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = searchTerm
      ? company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
      
    const matchesStatus = filterStatus
      ? company.status === filterStatus
      : true;
      
    const matchesIndustry = filterIndustry
      ? company.industry === filterIndustry
      : true;
      
    return matchesSearch && matchesStatus && matchesIndustry;
  });
  
  // Get unique industries for filter dropdown
  const industries = [...new Set(companies.map((company) => company.industry).filter(Boolean))];
  
  // Table columns configuration
  const columns = [
    {
      key: 'name',
      header: 'Company Name',
      sortable: true,
      render: (company) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
            <BuildingOfficeIcon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900 dark:text-white">{company.name}</div>
            {company.industry && (
              <div className="text-sm text-gray-500 dark:text-gray-400">{company.industry}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      sortable: true,
      render: (company) => (
        <div>
          {company.email && <div className="text-sm">{company.email}</div>}
          {company.phone && <div className="text-sm text-gray-500">{company.phone}</div>}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      render: (company) => (
        <div>
          {company.address?.city && company.address?.country && (
            <div className="text-sm">
              {company.address.city}, {company.address.country}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (company) => {
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
      },
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      sortable: true,
      render: (company) => (
        <div>
          {company.assignedTo ? (
            <div className="text-sm">
              {company.assignedTo.firstName} {company.assignedTo.lastName}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Unassigned</div>
          )}
        </div>
      ),
    },
  ];
  
  // Render create company modal
  const renderCreateCompanyModal = () => (
    <Modal
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      title="Create New Company"
      size="lg"
    >
      <form onSubmit={handleCreateCompany}>
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
                value={newCompany.name}
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
                value={newCompany.industry}
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
                value={newCompany.website}
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
                value={newCompany.email}
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
                value={newCompany.phone}
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
                value={newCompany.type}
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
                value={newCompany.status}
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
                value={newCompany.address.street}
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
                value={newCompany.address.city}
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
                value={newCompany.address.state}
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
                value={newCompany.address.zipCode}
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
                value={newCompany.address.country}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
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
              {loading ? <LoadingSpinner size="sm" /> : 'Create Company'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
  
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Companies</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your business accounts and relationships
          </p>
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
            
            {/* Industry Filter */}
            <div className="relative">
              <select
                className="form-input pl-9 pr-8 py-2"
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
              >
                <option value="">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              className="btn btn-outline py-2 px-3"
              onClick={() => dispatch(getCompanies())}
              disabled={loading}
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Create Company Button */}
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Company
            </button>
          </div>
        </div>
        
        {/* Companies Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredCompanies}
            isLoading={loading}
            emptyMessage="No companies found"
            onRowClick={handleRowClick}
            rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          />
        </div>
        
        {/* Create Company Modal */}
        {renderCreateCompanyModal()}
      </div>
    </PageTransition>
  );
};

export default Companies;
