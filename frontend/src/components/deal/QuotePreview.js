import React from 'react';
import {
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../LoadingSpinner';

const QuotePreview = ({ deal, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        <DocumentTextIcon className="h-16 w-16 mb-4" />
        <p>No quote data available</p>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: deal.currency || 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Quote Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {deal.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Quote #{deal.quoteNumber}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-gray-700 dark:text-gray-300 flex items-center justify-end">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>Created: {formatDate(deal.createdAt)}</span>
            </div>
            {deal.expiryDate && (
              <div className="text-gray-700 dark:text-gray-300 flex items-center justify-end">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>Valid until: {formatDate(deal.expiryDate)}</span>
              </div>
            )}
            <div className="mt-2">
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
          </div>
        </div>
      </div>

      {/* Company and Contact Info */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Client Information
            </h3>
            {deal.company && (
              <div className="flex items-start mb-2">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {deal.company.name}
                  </div>
                  {deal.company.address && (
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {deal.company.address.street && (
                        <div>{deal.company.address.street}</div>
                      )}
                      {(deal.company.address.city || deal.company.address.state || deal.company.address.zipCode) && (
                        <div>
                          {deal.company.address.city && `${deal.company.address.city}, `}
                          {deal.company.address.state && `${deal.company.address.state} `}
                          {deal.company.address.zipCode && deal.company.address.zipCode}
                        </div>
                      )}
                      {deal.company.address.country && (
                        <div>{deal.company.address.country}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Contact Information
            </h3>
            {deal.contact && (
              <div className="flex items-start mb-2">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {deal.contact.firstName} {deal.contact.lastName}
                  </div>
                  {deal.contact.email && (
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Email: {deal.contact.email}
                    </div>
                  )}
                  {deal.contact.phone && (
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Phone: {deal.contact.phone}
                    </div>
                  )}
                </div>
              </div>
            )}

            {deal.billingContact && (!deal.contact || deal.billingContact._id !== deal.contact._id) && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Billing Contact
                </h4>
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {deal.billingContact.firstName} {deal.billingContact.lastName}
                    </div>
                    {deal.billingContact.email && (
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        Email: {deal.billingContact.email}
                      </div>
                    )}
                    {deal.billingContact.phone && (
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        Phone: {deal.billingContact.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quote Details
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Discount
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tax
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {deal.lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-pre-wrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    {item.discount > 0 ? `${item.discount}%` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    {item.tax > 0 ? `${item.tax}%` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-gray-900 dark:text-white">
                {formatCurrency(deal.subtotal)}
              </span>
            </div>
            
            {deal.discountValue > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {deal.discountType === 'Percentage'
                    ? `Discount (${deal.discountValue}%):`
                    : 'Discount:'}
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(
                    deal.discountType === 'Percentage'
                      ? deal.subtotal * (deal.discountValue / 100)
                      : deal.discountValue
                  )}
                </span>
              </div>
            )}
            
            {deal.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Tax ({deal.taxRate}%):
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(deal.taxAmount)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 font-bold">
              <span className="text-gray-900 dark:text-white">Total:</span>
              <span className="text-gray-900 dark:text-white">
                {formatCurrency(deal.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="p-6">
        {deal.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Notes
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {deal.notes}
            </div>
          </div>
        )}
        
        {deal.terms && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Terms and Conditions
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {deal.terms}
            </div>
          </div>
        )}
        
        {/* Signature */}
        {deal.signatureRequired && deal.signedBy && deal.signedBy.signatureImage && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Signature
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <div className="text-gray-700 dark:text-gray-300 mb-2">
                Signed by: {deal.signedBy.name}
                {deal.signedBy.title && ` (${deal.signedBy.title})`}
              </div>
              <div className="text-gray-700 dark:text-gray-300 mb-2">
                Email: {deal.signedBy.email}
              </div>
              {deal.signatureDate && (
                <div className="text-gray-700 dark:text-gray-300 mb-4">
                  Date: {formatDate(deal.signatureDate)}
                </div>
              )}
              <div className="border border-gray-200 dark:border-gray-600 rounded bg-white p-2 max-w-xs">
                <img
                  src={deal.signedBy.signatureImage}
                  alt="Signature"
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotePreview;
