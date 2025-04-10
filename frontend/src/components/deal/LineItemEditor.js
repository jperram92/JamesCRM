import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

const LineItemEditor = ({ lineItems, onChange, currency = 'USD' }) => {
  const [items, setItems] = useState(lineItems || []);

  // Sync with parent's lineItems prop
  useEffect(() => {
    setItems(lineItems || []);
  }, [lineItems]);

  // Update parent component when items change
  useEffect(() => {
    // Prevent infinite loop by checking if items are different from lineItems
    const itemsJson = JSON.stringify(items);
    const lineItemsJson = JSON.stringify(lineItems || []);

    if (itemsJson !== lineItemsJson) {
      onChange(items);
    }
  }, [items, lineItems, onChange]);

  // Add a new line item
  const handleAddItem = () => {
    const newItem = {
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  // Remove a line item
  const handleRemoveItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  // Move item up in the list
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedItems = [...items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[index - 1];
    updatedItems[index - 1] = temp;
    setItems(updatedItems);
  };

  // Move item down in the list
  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const updatedItems = [...items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[index + 1];
    updatedItems[index + 1] = temp;
    setItems(updatedItems);
  };

  // Update a line item field
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];

    // Convert numeric values
    if (['quantity', 'unitPrice', 'discount', 'tax'].includes(field)) {
      value = parseFloat(value) || 0;
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Calculate total
    const quantity = updatedItems[index].quantity;
    const unitPrice = updatedItems[index].unitPrice;
    const discount = updatedItems[index].discount;
    const tax = updatedItems[index].tax;

    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    const taxAmount = (subtotal - discountAmount) * (tax / 100);

    updatedItems[index].total = subtotal - discountAmount + taxAmount;

    setItems(updatedItems);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Unit Price
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Discount (%)
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tax (%)
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="px-2 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === items.length - 1}
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <textarea
                    className="form-input w-full text-sm"
                    rows="2"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Item description"
                    required
                  />
                </td>
                <td className="px-4 py-4">
                  <input
                    type="number"
                    className="form-input w-20 text-right"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{currency}</span>
                    </div>
                    <input
                      type="number"
                      className="form-input pl-12 w-32 text-right"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      required
                    />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <input
                      type="number"
                      className="form-input pr-8 w-24 text-right"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <input
                      type="number"
                      className="form-input pr-8 w-24 text-right"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.tax}
                      onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right font-medium">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-start">
        <button
          type="button"
          className="btn btn-outline flex items-center"
          onClick={handleAddItem}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Item
        </button>
      </div>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium">
              {formatCurrency(
                items.reduce((sum, item) => sum + item.total, 0)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineItemEditor;
