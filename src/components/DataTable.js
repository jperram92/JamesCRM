import React, { useState, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';

const DataTable = ({
  columns,
  data,
  isLoading = false,
  pagination = true,
  itemsPerPage = 10,
  sortable = true,
  emptyMessage = 'No data available',
  onRowClick,
  rowClassName,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    return Math.ceil(sortedData.length / itemsPerPage);
  }, [sortedData, itemsPerPage, pagination]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (!sortable) return null;
    
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? (
        <ChevronUpIcon className="h-4 w-4 ml-1" />
      ) : (
        <ChevronDownIcon className="h-4 w-4 ml-1" />
      );
    }
    return <ChevronUpIcon className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-30" />;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="table-container bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Empty state
  if (!data.length) {
    return (
      <div className="table-container bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="empty-state">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{emptyMessage}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`table-header-cell group ${sortable && column.sortable !== false ? 'cursor-pointer' : ''}`}
                onClick={() => column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center">
                  {column.header}
                  {column.sortable !== false && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {paginatedData.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={`table-row ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName ? rowClassName(row) : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column) => (
                <td key={`${row.id || rowIndex}-${column.key}`} className="table-cell">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {pagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default DataTable;
