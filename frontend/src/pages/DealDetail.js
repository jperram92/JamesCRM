import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import LineItemEditor from '../components/deal/LineItemEditor';
import QuotePreview from '../components/deal/QuotePreview';
import SignaturePad from '../components/deal/SignaturePad';
import { useToastContext } from '../contexts/ToastContext';
import {
  getDealById,
  updateDeal,
  deleteDeal,
  resetDealState,
  clearDealDetail,
  updateDealStatus,
  generatePdf,
  sendSignatureRequest,
  clearPdfUrl,
} from '../slices/dealSlice';
import { getCompanies } from '../slices/companySlice';
import { getContacts } from '../slices/contactSlice';

const DealDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  
  const { deal, loading, error, success, pdfUrl } = useSelector((state) => state.deals);
  const { companies } = useSelector((state) => state.companies);
  const { contacts } = useSelector((state) => state.contacts);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  // Load deal data, companies, and contacts on component mount
  useEffect(() => {
    dispatch(getDealById(id));
    dispatch(getCompanies());
    dispatch(getContacts());
    
    // Cleanup on unmount
    return () => {
      dispatch(clearDealDetail());
      dispatch(clearPdfUrl());
    };
  }, [dispatch, id]);
  
  // Set edit form data when deal data is loaded
  useEffect(() => {
    if (deal) {
      setEditDeal({
        ...deal,
        company: deal.company?._id || '',
        contact: deal.contact?._id || '',
        billingContact: deal.billingContact?._id || '',
        expiryDate: deal.expiryDate ? new Date(deal.expiryDate).toISOString().split('T')[0] : '',
      });
      
      // Set recipient info if contact exists
      if (deal.contact) {
        setRecipientEmail(deal.contact.email || '');
        setRecipientName(`${deal.contact.firstName} ${deal.contact.lastName}`);
      } else if (deal.billingContact) {
        setRecipientEmail(deal.billingContact.email || '');
        setRecipientName(`${deal.billingContact.firstName} ${deal.billingContact.lastName}`);
      }
    }
  }, [deal]);
  
  // Handle success and error states
  useEffect(() => {
    if (success) {
      showSuccess('Deal updated successfully!');
      setShowEditModal(false);
      setShowDeleteModal(false);
      setShowSendModal(false);
      dispatch(resetDealState());
    }
    
    if (error) {
      showError(error);
      dispatch(resetDealState());
    }
  }, [success, error, dispatch, showSuccess, showError]);
  
  // Handle PDF generation
  useEffect(() => {
    if (pdfUrl) {
      setGeneratingPdf(false);
      setShowPdfModal(true);
    }
  }, [pdfUrl]);
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditDeal({
      ...editDeal,
      [name]: value
    });
  };
  
  // Handle line items change
  const handleLineItemsChange = (lineItems) => {
    setEditDeal({
      ...editDeal,
      lineItems
    });
  };
  
  // Handle update deal form submission
  const handleUpdateDeal = (e) => {
    e.preventDefault();
    
    if (!editDeal.name.trim() || !editDeal.company) {
      showError('Name and company are required');
      return;
    }
    
    if (!editDeal.lineItems || editDeal.lineItems.length === 0 || !editDeal.lineItems[0].description) {
      showError('At least one line item with a description is required');
      return;
    }
    
    dispatch(updateDeal({ id, dealData: editDeal }));
  };
  
  // Handle delete deal
  const handleDeleteDeal = () => {
    dispatch(deleteDeal(id));
    navigate('/deals');
  };
  
  // Handle status change
  const handleStatusChange = (status) => {
    dispatch(updateDealStatus({ id, status }));
  };
  
  // Handle PDF generation
  const handleGeneratePdf = () => {
    setGeneratingPdf(true);
    dispatch(generatePdf(id));
  };
  
  // Handle send signature request
  const handleSendSignatureRequest = (e) => {
    e.preventDefault();
    
    if (!recipientEmail || !recipientName) {
      showError('Recipient email and name are required');
      return;
    }
    
    dispatch(sendSignatureRequest({
      id,
      recipientEmail,
      recipientName
    }));
  };
  
  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Render status badge
  const renderStatusBadge = () => {
    if (!deal) return null;
    
    return (
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
    );
  };
  
  // Render stage badge
  const renderStageBadge = () => {
    if (!deal) return null;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        deal.stage === 'Qualification'
          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          : deal.stage === 'Proposal'
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-20 dark:text-blue-300'
          : deal.stage === 'Negotiation'
          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-20 dark:text-purple-300'
          : deal.stage === 'Closing'
          ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:bg-opacity-20 dark:text-warning-300'
          : deal.stage === 'Won'
          ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:bg-opacity-20 dark:text-success-300'
          : 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:bg-opacity-20 dark:text-danger-300'
      }`}>
        {deal.stage}
      </span>
    );
  };
  
  // Render edit deal modal
  const renderEditDealModal = () => {
    if (!editDeal) return null;
    
    return (
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Quote"
        size="xl"
      >
        <form onSubmit={handleUpdateDeal} className="space-y-6">
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
                value={editDeal.name}
                onChange={handleInputChange}
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
                value={editDeal.company}
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
                value={editDeal.contact}
                onChange={handleInputChange}
              >
                <option value="">Select a contact</option>
                {contacts
                  .filter(contact => !editDeal.company || contact.company === editDeal.company)
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
                value={editDeal.billingContact}
                onChange={handleInputChange}
              >
                <option value="">Select a contact</option>
                {contacts
                  .filter(contact => !editDeal.company || contact.company === editDeal.company)
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
                value={editDeal.stage}
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
                value={editDeal.currency}
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
                value={editDeal.expiryDate}
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
                    value={editDeal.discountType}
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
                      step={editDeal.discountType === 'Percentage' ? '0.1' : '0.01'}
                      value={editDeal.discountValue}
                      onChange={handleInputChange}
                    />
                    {editDeal.discountType === 'Percentage' && (
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
                    value={editDeal.taxRate}
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
              lineItems={editDeal.lineItems}
              onChange={handleLineItemsChange}
              currency={editDeal.currency}
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
                value={editDeal.notes}
                onChange={handleInputChange}
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
                value={editDeal.terms}
                onChange={handleInputChange}
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
                checked={editDeal.signatureRequired}
                onChange={(e) => setEditDeal({
                  ...editDeal,
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
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Update Quote'}
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
        title="Delete Quote"
      >
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to delete this quote? This action cannot be undone.
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
              onClick={handleDeleteDeal}
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    );
  };
  
  // Render send quote modal
  const renderSendModal = () => {
    return (
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send Quote for Signature"
      >
        <form onSubmit={handleSendSignatureRequest} className="p-4">
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="recipientName" className="form-label">
                Recipient Name *
              </label>
              <input
                type="text"
                id="recipientName"
                className="form-input"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="recipientEmail" className="form-label">
                Recipient Email *
              </label>
              <input
                type="email"
                id="recipientEmail"
                className="form-input"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                An email will be sent to the recipient with a link to view and sign the quote.
                The quote status will be updated to "Sent".
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="btn btn-outline mr-2"
              onClick={() => setShowSendModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send Quote
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    );
  };
  
  // Render PDF preview modal
  const renderPdfModal = () => {
    return (
      <Modal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        title="Quote PDF"
        size="xl"
      >
        <div className="p-4">
          {pdfUrl ? (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your quote PDF has been generated. You can view it below or download it.
                </p>
              </div>
              
              <div className="aspect-[8.5/11] w-full border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <iframe
                  src={`http://localhost:5000${pdfUrl}`}
                  title="Quote PDF"
                  className="w-full h-full"
                />
              </div>
              
              <div className="flex justify-end">
                <a
                  href={`http://localhost:5000${pdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  download
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-96">
              <LoadingSpinner size="lg" />
            </div>
          )}
        </div>
      </Modal>
    );
  };
  
  // Render loading state
  if (loading && !deal) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Render error state
  if (error && !deal) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="text-danger-600 text-lg mb-4">Error loading deal: {error}</div>
        <button
          className="btn btn-primary"
          onClick={() => dispatch(getDealById(id))}
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
            onClick={() => navigate('/deals')}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Quotes
          </button>
          
          <div className="flex space-x-2">
            <button
              className="btn btn-outline"
              onClick={() => setShowEditModal(true)}
              disabled={deal?.status === 'Accepted'}
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
        
        {deal && (
          <>
            {/* Deal header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <DocumentTextIcon className="h-10 w-10" />
                    </div>
                    <div className="ml-4">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {deal.name}
                      </h1>
                      <div className="flex items-center mt-1">
                        <span className="text-gray-600 dark:text-gray-400 mr-3">
                          {deal.quoteNumber}
                        </span>
                        <div className="flex space-x-2">
                          {renderStatusBadge()}
                          {renderStageBadge()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(deal.totalAmount, deal.currency)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Created: {formatDate(deal.createdAt)}
                    </div>
                    {deal.expiryDate && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Expires: {formatDate(deal.expiryDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <button
                className="btn btn-outline flex items-center justify-center py-3"
                onClick={handleGeneratePdf}
                disabled={generatingPdf}
              >
                {generatingPdf ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Generate PDF
                  </>
                )}
              </button>
              
              <button
                className="btn btn-outline flex items-center justify-center py-3"
                onClick={() => setShowSendModal(true)}
                disabled={deal.status === 'Accepted' || deal.status === 'Rejected'}
              >
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                Send for Signature
              </button>
              
              <button
                className="btn btn-outline flex items-center justify-center py-3"
                onClick={() => handleStatusChange('Accepted')}
                disabled={deal.status === 'Accepted'}
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Mark as Accepted
              </button>
              
              <button
                className="btn btn-outline flex items-center justify-center py-3"
                onClick={() => handleStatusChange('Rejected')}
                disabled={deal.status === 'Rejected'}
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                Mark as Rejected
              </button>
            </div>
            
            {/* Quote Preview */}
            <div className="mb-6">
              <QuotePreview deal={deal} loading={loading} />
            </div>
            
            {/* Modals */}
            {renderEditDealModal()}
            {renderDeleteModal()}
            {renderSendModal()}
            {renderPdfModal()}
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default DealDetail;
