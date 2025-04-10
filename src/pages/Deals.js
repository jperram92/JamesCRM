import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import PageTransition from '../components/PageTransition';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import LineItemEditor from '../components/deal/LineItemEditor';
import { useToastContext } from '../contexts/ToastContext';
import { getDeals, createDeal, resetDealState } from '../slices/dealSlice';
import { getCompanies } from '../slices/companySlice';
import { getContacts } from '../slices/contactSlice';

const Deals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();

  const { deals, loading, error, success } = useSelector((state) => state.deals);
  const { companies } = useSelector((state) => state.companies);
  const { contacts } = useSelector((state) => state.contacts);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  const [newDeal, setNewDeal] = useState({
    name: '',
    company: '',
    contact: '',
    billingContact: '',
    status: 'Draft',
    stage: 'Qualification',
    currency: 'USD',
    discountType: 'Percentage',
    discountValue: 0,
    taxRate: 0,
    lineItems: [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        tax: 0,
        total: 0
      }
    ],
    notes: '',
    terms: '',
    expiryDate: '',
    signatureRequired: true
  });

  // Load deals, companies, and contacts on component mount
  useEffect(() => {
    dispatch(getDeals());
    dispatch(getCompanies());
    dispatch(getContacts());
  }, [dispatch]);

  // Handle success and error states
  useEffect(() => {
    if (success) {
      showSuccess('Deal created successfully!');
      setShowCreateModal(false);
      setNewDeal({
        name: '',
        company: '',
        contact: '',
        billingContact: '',
        status: 'Draft',
        stage: 'Qualification',
        currency: 'USD',
        discountType: 'Percentage',
        discountValue: 0,
        taxRate: 0,
        lineItems: [
          {
            description: '',
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            tax: 0,
            total: 0
          }
        ],
        notes: '',
        terms: '',
        expiryDate: '',
        signatureRequired: true
      });
      dispatch(resetDealState());
    }

    if (error) {
      showError(error);
      dispatch(resetDealState());
    }
  }, [success, error, dispatch, showSuccess, showError]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDeal({
      ...newDeal,
      [name]: value
    });
  };

  // Handle line items change
  const handleLineItemsChange = (lineItems) => {
    setNewDeal({
      ...newDeal,
      lineItems
    });
  };

  // Handle create deal form submission
  const handleCreateDeal = (e) => {
    e.preventDefault();

    console.log('Create Deal - Form Data:', newDeal);
    console.log('Create Deal - Available Companies:', companies);
    console.log('Create Deal - Available Contacts:', contacts);
    console.log('Create Deal - Selected Company:', newDeal.company);
    console.log('Create Deal - Selected Contact:', newDeal.contact);
    console.log('Create Deal - Selected Billing Contact:', newDeal.billingContact);

    if (!newDeal.name.trim() || !newDeal.company) {
      showError('Name and company are required');
      return;
    }

    if (!newDeal.lineItems || newDeal.lineItems.length === 0 || !newDeal.lineItems[0].description) {
      showError('At least one line item with a description is required');
      return;
    }

    // Create a copy of the deal data for submission
    const dealData = { ...newDeal };

    // Log the data being sent to the API
    console.log('Create Deal - Submitting Data:', dealData);

    dispatch(createDeal(dealData));
  };

  // Handle row click to navigate to deal detail
  const handleRowClick = (deal) => {
    navigate(`/deals/${deal._id}`);
  };

  // Filter deals based on search term and filters
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = searchTerm
      ? deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deal.company && deal.company.name && deal.company.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    const matchesStatus = filterStatus
      ? deal.status === filterStatus
      : true;

    const matchesStage = filterStage
      ? deal.stage === filterStage
      : true;

    const matchesCompany = filterCompany
      ? deal.company && deal.company._id === filterCompany
      : true;

    return matchesSearch && matchesStatus && matchesStage && matchesCompany;
  });

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      header: 'Quote',
      sortable: true,
      render: (deal) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <DocumentTextIcon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900 dark:text-white">
              {deal.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {deal.quoteNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      render: (deal) => (
        <div>
          {deal.company ? (
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-1.5" />
              <span className="text-gray-900 dark:text-white">
                {deal.company.name}
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
      key: 'contact',
      header: 'Contact',
      sortable: true,
      render: (deal) => (
        <div>
          {deal.contact ? (
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-1.5" />
              <span className="text-gray-900 dark:text-white">
                {deal.contact.firstName} {deal.contact.lastName}
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
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (deal) => (
        <div className="text-gray-900 dark:text-white font-medium">
          {formatCurrency(deal.totalAmount, deal.currency)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (deal) => (
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            deal.status === 'Draft'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              : deal.status === 'Sent'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300'
              : deal.status === 'Viewed'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-20 dark:text-purple-300'
              : deal.status === 'Accepted'
              ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:bg-opacity-20 dark:text-success-300'
              : deal.status === 'Rejected'
              ? 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:bg-opacity-20 dark:text-danger-300'
              : 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:bg-opacity-20 dark:text-warning-300'
          }`}>
            {deal.status}
          </span>
        </div>
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      sortable: true,
      render: (deal) => (
        <div className="text-gray-900 dark:text-white">
          {deal.stage}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (deal) => (
        <div className="text-gray-500 dark:text-gray-400">
          {new Date(deal.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Render create deal modal
  const renderCreateDealModal = () => {
    return (
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Quote"
        size="xl"
      >
        <form onSubmit={handleCreateDeal} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group md:col-span-2">
              <label htmlFor="name" className="form-label">
                Quote Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={newDeal.name}
                onChange={handleInputChange}
                placeholder="E.g., Website Development Project"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company" className="form-label">
                Company *
              </label>
              <select
                id="company"
                name="company"
                className="form-input"
                value={newDeal.company}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="contact" className="form-label">
                Primary Contact
              </label>
              <select
                id="contact"
                name="contact"
                className="form-input"
                value={newDeal.contact}
                onChange={handleInputChange}
              >
                <option value="">Select a contact</option>
                {contacts
                  .filter(contact => !newDeal.company || contact.company === newDeal.company)
                  .map((contact) => (
                    <option key={contact._id} value={contact._id}>
                      {contact.firstName} {contact.lastName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="billingContact" className="form-label">
                Billing Contact
              </label>
              <select
                id="billingContact"
                name="billingContact"
                className="form-input"
                value={newDeal.billingContact}
                onChange={handleInputChange}
              >
                <option value="">Select a contact</option>
                {contacts
                  .filter(contact => !newDeal.company || contact.company === newDeal.company)
                  .map((contact) => (
                    <option key={contact._id} value={contact._id}>
                      {contact.firstName} {contact.lastName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="stage" className="form-label">
                Stage
              </label>
              <select
                id="stage"
                name="stage"
                className="form-input"
                value={newDeal.stage}
                onChange={handleInputChange}
              >
                <option value="Qualification">Qualification</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closing">Closing</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="currency" className="form-label">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                className="form-input"
                value={newDeal.currency}
                onChange={handleInputChange}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate" className="form-label">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                className="form-input"
                value={newDeal.expiryDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group md:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="discountType" className="form-label">
                  Discount
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    id="discountType"
                    name="discountType"
                    className="form-input w-40"
                    value={newDeal.discountType}
                    onChange={handleInputChange}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount</option>
                  </select>
                  <div className="relative">
                    <input
                      type="number"
                      id="discountValue"
                      name="discountValue"
                      className="form-input w-24"
                      min="0"
                      step={newDeal.discountType === 'Percentage' ? '0.1' : '0.01'}
                      value={newDeal.discountValue}
                      onChange={handleInputChange}
                    />
                    {newDeal.discountType === 'Percentage' && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group md:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="taxRate" className="form-label">
                  Tax Rate
                </label>
                <div className="relative w-24">
                  <input
                    type="number"
                    id="taxRate"
                    name="taxRate"
                    className="form-input pr-8"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newDeal.taxRate}
                    onChange={handleInputChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Line Items
            </h3>
            <LineItemEditor
              lineItems={newDeal.lineItems}
              onChange={handleLineItemsChange}
              currency={newDeal.currency}
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="4"
                className="form-input"
                value={newDeal.notes}
                onChange={handleInputChange}
                placeholder="Additional notes or comments about this quote"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="terms" className="form-label">
                Terms and Conditions
              </label>
              <textarea
                id="terms"
                name="terms"
                rows="4"
                className="form-input"
                value={newDeal.terms}
                onChange={handleInputChange}
                placeholder="Terms and conditions for this quote"
              ></textarea>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="signatureRequired"
                name="signatureRequired"
                className="form-checkbox"
                checked={newDeal.signatureRequired}
                onChange={(e) => setNewDeal({
                  ...newDeal,
                  signatureRequired: e.target.checked
                })}
              />
              <label htmlFor="signatureRequired" className="ml-2 text-gray-700 dark:text-gray-300">
                Require signature for acceptance
              </label>
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
              {loading ? <LoadingSpinner size="sm" /> : 'Create Quote'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage quotes for your customers
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
                placeholder="Search quotes..."
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
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Viewed">Viewed</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                  <option value="Converted">Converted</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Stage Filter */}
              <div className="relative">
                <select
                  className="form-input pl-9 pr-8 py-2"
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                >
                  <option value="">All Stages</option>
                  <option value="Qualification">Qualification</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closing">Closing</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
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
                onClick={() => dispatch(getDeals())}
                disabled={loading}
              >
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Create Deal Button */}
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Create Quote
              </button>
            </div>
          </div>
        </div>

        {/* Deals Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredDeals}
            isLoading={loading}
            emptyMessage="No quotes found"
            onRowClick={handleRowClick}
            rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          />
        </div>

        {/* Create Deal Modal */}
        {renderCreateDealModal()}
      </div>
    </PageTransition>
  );
};

export default Deals;
