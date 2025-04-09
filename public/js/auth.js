// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// Get current user
function getCurrentUser() {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Error parsing user JSON:', e);
    }
  }

  // Return a default user if none is found
  return {
    id: 1,
    first_name: 'Demo',
    last_name: 'User',
    email: 'demo@example.com',
    role: 'user'
  };
}

// Redirect to login if not logged in
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Add logout event listener to all logout links
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in on protected pages
  if (window.location.pathname.includes('simple.html') ||
      window.location.pathname.includes('companies.html') ||
      window.location.pathname.includes('contacts.html') ||
      window.location.pathname.includes('deals.html') ||
      window.location.pathname.includes('admin.html')) {
    requireAuth();
  }

  // Add logout functionality to all logout links
  const logoutLinks = document.querySelectorAll('a[href="login.html"]');
  logoutLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  });
});
