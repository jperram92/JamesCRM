import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  PaperClipIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ArchiveBoxIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../LoadingSpinner';
import { useToastContext } from '../../contexts/ToastContext';

// This is a placeholder component since we haven't implemented file upload functionality yet
const ContactFiles = ({ contactId }) => {
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
          filename: 'resume_john_doe.pdf',
          originalName: 'Resume_John_Doe.pdf',
          mimeType: 'application/pdf',
          size: 1457621,
          path: '/uploads/resume_john_doe.pdf',
          createdBy: {
            firstName: 'Admin',
            lastName: 'User'
          },
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          filename: 'profile_picture.jpg',
          originalName: 'Profile_Picture.jpg',
          mimeType: 'image/jpeg',
          size: 245789,
          path: '/uploads/profile_picture.jpg',
          createdBy: {
            firstName: 'John',
            lastName: 'Doe'
          },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          filename: 'contact_details.docx',
          originalName: 'Contact_Details.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 145621,
          path: '/uploads/contact_details.docx',
          createdBy: {
            firstName: 'Jane',
            lastName: 'Smith'
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [contactId]);
  
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
      const newFiles = selectedFiles.map((file) => ({
        _id: Math.random().toString(36).substring(2, 9),
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
  
  // Handle file delete
  const handleDeleteFile = (fileId) => {
    // Simulate API call
    setLoading(true);
    
    setTimeout(() => {
      setFiles(files.filter((file) => file._id !== fileId));
      setLoading(false);
      showSuccess('File deleted successfully!');
    }, 1000);
  };
  
  // Handle file download
  const handleDownloadFile = (file) => {
    showSuccess(`Downloading ${file.originalName}...`);
    // In a real implementation, this would trigger a download
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return <PhotoIcon className="h-6 w-6 text-blue-500" />;
    } else if (mimeType === 'application/pdf') {
      return <DocumentIcon className="h-6 w-6 text-red-500" />;
    } else if (mimeType.includes('word')) {
      return <DocumentTextIcon className="h-6 w-6 text-blue-700" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <TableCellsIcon className="h-6 w-6 text-green-600" />;
    } else if (mimeType.includes('zip') || mimeType.includes('compressed')) {
      return <ArchiveBoxIcon className="h-6 w-6 text-yellow-600" />;
    } else {
      return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
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
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Files & Attachments
        </h3>
        
        {/* Upload File Button */}
        <div className="mb-6">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                Upload File
              </>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {files.map((file) => (
                    <tr key={file._id}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          type="button"
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3"
                          onClick={() => handleDownloadFile(file)}
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          className="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300"
                          onClick={() => handleDeleteFile(file._id)}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
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

export default ContactFiles;
