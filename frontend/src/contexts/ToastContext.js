import React, { createContext, useContext } from 'react';
import useToast from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

// Create toast context
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast context
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
