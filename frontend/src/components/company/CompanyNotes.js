import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DocumentTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../LoadingSpinner';
import { useToastContext } from '../../contexts/ToastContext';
import {
  getCompanyNotes,
  createCompanyNote,
  resetCompanyState,
} from '../../slices/companySlice';

const CompanyNotes = ({ companyId }) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToastContext();
  
  const { notes, loading, error, success } = useSelector((state) => state.companies);
  const companyNotes = notes[companyId] || [];
  
  const [noteContent, setNoteContent] = useState('');
  
  // Load notes on component mount
  useEffect(() => {
    dispatch(getCompanyNotes(companyId));
  }, [dispatch, companyId]);
  
  // Handle success and error states
  useEffect(() => {
    if (success) {
      setNoteContent('');
      dispatch(resetCompanyState());
    }
    
    if (error) {
      showError(error);
      dispatch(resetCompanyState());
    }
  }, [success, error, dispatch, showSuccess, showError]);
  
  // Handle create note
  const handleCreateNote = (e) => {
    e.preventDefault();
    
    if (!noteContent.trim()) {
      showError('Note content is required');
      return;
    }
    
    dispatch(createCompanyNote({ id: companyId, content: noteContent }));
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Notes
        </h3>
        
        {/* Create Note Form */}
        <form onSubmit={handleCreateNote} className="mb-8">
          <div className="form-group mb-4">
            <label htmlFor="noteContent" className="form-label">
              Add a Note
            </label>
            <textarea
              id="noteContent"
              name="noteContent"
              rows="4"
              className="form-input"
              placeholder="Enter your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Note
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Notes List */}
        <div className="space-y-6">
          {loading && companyNotes.length === 0 ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : companyNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No notes yet. Add your first note above.</p>
            </div>
          ) : (
            companyNotes.map((note) => (
              <div
                key={note._id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {note.createdBy?.firstName} {note.createdBy?.lastName}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(note.createdAt)}
                  </div>
                </div>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {note.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyNotes;
