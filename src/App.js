import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import Navbar from './components/Navbar';
import ThemeProvider from './components/ThemeProvider';
import ToastProvider from './contexts/ToastContext';
import LoadingSpinner from './components/LoadingSpinner';

// Import pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Registration from './pages/Registration';
import NotFound from './pages/NotFound';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Initial loading screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <LoadingSpinner size="xl" color="primary" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Loading JamesCRM...</h2>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route
                  path="/*"
                  element={
                    <>
                      <Navbar />
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/companies" element={<Companies />} />
                        <Route path="/companies/:id" element={<CompanyDetail />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </>
                  }
                />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
