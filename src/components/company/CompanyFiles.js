import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  PaperClipIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  TableCellsIcon,
  FilmIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../LoadingSpinner';
import { useToastContext } from '../../contexts/ToastContext';
import axios from 'axios';

// This is a placeholder component since we haven't implemented file upload functionality yet
const CompanyFiles = ({ companyId }) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToastContext();
  const fileInputRef = useRef(null);
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Mock files for demonstration
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFiles([
        {
          _id: '1',
          filename: 'contract_2023.pdf',
          originalName: 'Contract_2023.pdf',
          mimeType: 'application/pdf',
          size: 2457621,
          path: '/uploads/contract_2023.pdf',
          createdBy: {
            firstName: 'Admin',
            lastName: 'User'
          },
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          filename: 'meeting_notes.docx',
          originalName: 'Meeting_Notes.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 1245789,
          path: '/uploads/meeting_notes.docx',
          createdBy: {
            firstName: 'John',
            lastName: 'Doe'
          },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          filename: 'company_logo.png',
          originalName: 'Company_Logo.png',
          mimeType: 'image/png',
          size: 345621,
          path: '/uploads/company_logo.png',
          createdBy: {
            firstName: 'Jane',
            lastName: 'Smith'
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [companyId]);
  
  // Handle file upload click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle file change
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    
    // Simulate file upload
    setUploading(true);
    showSuccess('File upload started...');
    
    // Simulate API call
    setTimeout(() => {
      const newFiles = selectedFiles.map((file, index) => ({
        _id: `new-${Date.now()}-${index}`,
        filename: file.name.toLowerCase().replace(/\s+/g, '_'),
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: `/uploads/${file.name.toLowerCase().replace(/\s+/g, '_')}`,
        createdBy: {
          firstName: 'Admin',
          lastName: 'User'
        },
        createdAt: new Date().toISOString()
      }));
      
      setFiles([...newFiles, ...files]);
      setUploading(false);
      showSuccess('File uploaded successfully!');
      
      // Reset file input
      e.target.value = null;
    }, 2000);
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    } else if (mimeType === 'application/pdf') {
      return <DocumentTextIcon className="h-8 w-8 text-red-500" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <TableCellsIcon className="h-8 w-8 text-green-500" />;
    } else if (mimeType.includes('word')) {
      return <DocumentIcon className="h-8 w-8 text-blue-500" />;
    } else if (mimeType.startsWith('video/')) {
      return <FilmIcon className="h-8 w-8 text-purple-500" />;
    } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
      return <ArchiveBoxIcon className="h-8 w-8 text-yellow-500" />;
    } else if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('html')) {
      return <CodeBracketIcon className="h-8 w-8 text-gray-500" />;
    } else {
      return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Files & Attachments
        </h3>
        
        {/* File Upload */}
        <div className="mb-8">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="fileUpload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ArrowUpTrayIcon className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, Word, Excel, Images, and other files (Max 10MB)
                </p>
              </div>
              <input
                id="fileUpload"
                type="file"
                className="hidden"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </label>
          </div>
          {uploading && (
            <div className="mt-4 flex justify-center">
              <LoadingSpinner size="md" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Uploading...</span>
            </div>
          )}
        </div>
        
        {/* Files List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <PaperClipIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No files yet. Upload your first file above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      File
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Uploaded By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {files.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {file.originalName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {file.mimeType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {file.createdBy.firstName} {file.createdBy.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(file.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href="#"
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4"
                          onClick={(e) => {
                            e.preventDefault();
                            showSuccess('Download functionality will be implemented in the future.');
                          }}
                        >
                          Download
                        </a>
                        <a
                          href="#"
                          className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300"
                          onClick={(e) => {
                            e.preventDefault();
                            showSuccess('Delete functionality will be implemented in the future.');
                          }}
                        >
                          Delete
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyFiles;
