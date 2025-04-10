import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import SignaturePad from '../components/deal/SignaturePad';
import {
  verifySignatureToken,
  processSignature,
  resetDealState,
  clearSignatureData,
} from '../slices/dealSlice';

const SignaturePage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, success, signatureToken } = useSelector((state) => state.deals);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [signatureImage, setSignatureImage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Verify token on component mount
  useEffect(() => {
    dispatch(verifySignatureToken(token));
    
    // Cleanup on unmount
    return () => {
      dispatch(clearSignatureData());
    };
  }, [dispatch, token]);
  
  // Set email from token data
  useEffect(() => {
    if (signatureToken && signatureToken.email) {
      setEmail(signatureToken.email);
    }
  }, [signatureToken]);
  
  // Handle success state
  useEffect(() => {
    if (success && submitted) {
      // Reset after 3 seconds
      const timer = setTimeout(() => {
        dispatch(resetDealState());
        navigate('/');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, submitted, dispatch, navigate]);
  
  // Handle signature change
  const handleSignatureChange = (dataUrl) => {
    setSignatureImage(dataUrl);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name || !email || !signatureImage) {
      return;
    }
    
    dispatch(processSignature({
      token,
      signatureData: {
        name,
        email,
        title,
        signatureImage
      }
    }));
    
    setSubmitted(true);
  };
  
  // Render loading state
  if (loading && !signatureToken) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center p-4">
        <div className="flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-danger-100 dark:bg-danger-900 p-3 mb-4">
              <ExclamationCircleIcon className="h-8 w-8 text-danger-600 dark:text-danger-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid or Expired Link
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              This signature link is invalid or has expired. Please contact the sender for a new link.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render success state
  if (success && submitted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-success-100 dark:bg-success-900 p-3 mb-4">
              <CheckCircleIcon className="h-8 w-8 text-success-600 dark:text-success-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Quote Signed Successfully
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Thank you for signing the quote. A confirmation has been sent to your email.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Render signature form
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full">
        {signatureToken && signatureToken.deal ? (
          <>
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {signatureToken.deal.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {signatureToken.deal.quoteNumber}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <LockClosedIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Secure Signature Request
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                You are being asked to sign a quote from {signatureToken.deal.company.name} for {formatCurrency(signatureToken.deal.totalAmount, signatureToken.deal.currency)}.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Title / Position
                </label>
                <input
                  type="text"
                  id="title"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., CEO, Manager, etc."
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Signature *
                </label>
                <SignaturePad onChange={handleSignatureChange} />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !name || !email || !signatureImage}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Sign Quote'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>
    </div>
  );
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export default SignaturePage;
