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

// Render user info in the navigation bar
function renderUserInfo() {
  const userInfoContainer = document.getElementById('userInfoContainer');
  if (!userInfoContainer) return;

  const user = getCurrentUser();

  userInfoContainer.innerHTML = `
    <div class="flex items-center">
      <div class="bg-indigo-600 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold">
        ${user.first_name.charAt(0)}${user.last_name.charAt(0)}
      </div>
      <div class="ml-2">
        <div class="text-sm font-medium text-white">${user.first_name} ${user.last_name}</div>
        <div class="text-xs text-gray-300">${user.email}</div>
      </div>
    </div>
  `;
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

    // Render user info in the navigation bar
    renderUserInfo();
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
