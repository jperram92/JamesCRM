// Invitations Management for Admin Dashboard

// DOM Elements
const viewInvitationsBtn = document.getElementById('viewInvitationsBtn');
let invitationsModal = null;

// Create invitations modal
function createInvitationsModal() {
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50';
  modal.id = 'invitationsModal';
  modal.style.display = 'none';
  
  // Modal content
  const content = `
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 relative">
      <button type="button" id="closeInvitationsModalBtn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
      <div class="border-b pb-4 mb-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Invitation Management</h3>
          <div class="flex space-x-2">
            <select id="invitationStatusFilter" class="px-3 py-1 border rounded-md text-sm">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
            <button type="button" id="refreshInvitationsBtn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm">
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invited By
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody id="invitationsTableBody" class="bg-white divide-y divide-gray-200">
            <tr>
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                Loading invitations...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          <span id="invitationStats">-</span>
        </div>
        <button type="button" id="closeInvitationsBtn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md">
          Close
        </button>
      </div>
    </div>
  `;
  
  modal.innerHTML = content;
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('closeInvitationsModalBtn').addEventListener('click', hideInvitationsModal);
  document.getElementById('closeInvitationsBtn').addEventListener('click', hideInvitationsModal);
  document.getElementById('refreshInvitationsBtn').addEventListener('click', fetchInvitations);
  document.getElementById('invitationStatusFilter').addEventListener('change', fetchInvitations);
  
  return modal;
}

// Show invitations modal
function showInvitationsModal() {
  if (!invitationsModal) {
    invitationsModal = createInvitationsModal();
  }
  
  invitationsModal.style.display = 'flex';
  fetchInvitations();
}

// Hide invitations modal
function hideInvitationsModal() {
  if (invitationsModal) {
    invitationsModal.style.display = 'none';
  }
}

// Fetch invitations from API
async function fetchInvitations() {
  const tableBody = document.getElementById('invitationsTableBody');
  const statusFilter = document.getElementById('invitationStatusFilter').value;
  
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" class="px-6 py-4 text-center text-gray-500">
        Loading invitations...
      </td>
    </tr>
  `;
  
  try {
    // In a real app, we would filter on the server
    // For this demo, we'll fetch all and filter client-side
    let endpoint = '/admin/invitations';
    
    const invitations = await apiRequest(endpoint);
    
    // Filter by status if needed
    const filteredInvitations = statusFilter 
      ? invitations.filter(inv => inv.status === statusFilter)
      : invitations;
    
    if (filteredInvitations.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-4 text-center text-gray-500">
            No invitations found
          </td>
        </tr>
      `;
      return;
    }
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add invitation rows
    filteredInvitations.forEach(invitation => {
      const row = document.createElement('tr');
      
      // User cell
      const userCell = document.createElement('td');
      userCell.className = 'px-6 py-4 whitespace-nowrap';
      userCell.innerHTML = `
        <div class="flex items-center">
          <div class="flex-shrink-0 h-10 w-10">
            <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
              ${invitation.user.first_name.charAt(0)}${invitation.user.last_name.charAt(0)}
            </div>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">${invitation.user.first_name} ${invitation.user.last_name}</div>
            <div class="text-sm text-gray-500">${invitation.user.email}</div>
          </div>
        </div>
      `;
      
      // Invited By cell
      const inviterCell = document.createElement('td');
      inviterCell.className = 'px-6 py-4 whitespace-nowrap';
      inviterCell.innerHTML = `
        <div class="text-sm text-gray-900">${invitation.inviter.first_name} ${invitation.inviter.last_name}</div>
        <div class="text-sm text-gray-500">${invitation.inviter.email}</div>
      `;
      
      // Role cell
      const roleCell = document.createElement('td');
      roleCell.className = 'px-6 py-4 whitespace-nowrap';
      let roleBadgeClass = '';
      
      if (invitation.role === 'admin') {
        roleBadgeClass = 'bg-red-100 text-red-800';
      } else if (invitation.role === 'manager') {
        roleBadgeClass = 'bg-blue-100 text-blue-800';
      } else {
        roleBadgeClass = 'bg-green-100 text-green-800';
      }
      
      roleCell.innerHTML = `
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadgeClass}">
          ${invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
        </span>
      `;
      
      // Status cell
      const statusCell = document.createElement('td');
      statusCell.className = 'px-6 py-4 whitespace-nowrap';
      let statusClass = '';
      
      switch (invitation.status) {
        case 'pending':
          statusClass = 'bg-yellow-100 text-yellow-800';
          break;
        case 'accepted':
          statusClass = 'bg-green-100 text-green-800';
          break;
        case 'expired':
          statusClass = 'bg-gray-100 text-gray-800';
          break;
        case 'revoked':
          statusClass = 'bg-red-100 text-red-800';
          break;
        default:
          statusClass = 'bg-gray-100 text-gray-800';
      }
      
      statusCell.innerHTML = `
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
          ${invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
        </span>
      `;
      
      // Expires cell
      const expiresCell = document.createElement('td');
      expiresCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
      
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      const isExpired = expiresAt < now;
      
      if (invitation.status === 'pending' && !isExpired) {
        // Calculate time remaining
        const diffMs = expiresAt - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        let timeRemaining = '';
        if (diffDays > 0) {
          timeRemaining = `${diffDays}d ${diffHrs}h remaining`;
        } else {
          timeRemaining = `${diffHrs}h remaining`;
        }
        
        expiresCell.innerHTML = `
          <div>${formatDate(invitation.expires_at)}</div>
          <div class="text-xs text-yellow-600">${timeRemaining}</div>
        `;
      } else {
        expiresCell.textContent = formatDate(invitation.expires_at);
      }
      
      // Actions cell
      const actionsCell = document.createElement('td');
      actionsCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
      
      if (invitation.status === 'pending') {
        actionsCell.innerHTML = `
          <button type="button" class="text-indigo-600 hover:text-indigo-900 mr-3" data-id="${invitation.id}" data-action="resend">Resend</button>
          <button type="button" class="text-red-600 hover:text-red-900" data-id="${invitation.id}" data-action="revoke">Revoke</button>
        `;
      } else {
        actionsCell.textContent = 'No actions available';
      }
      
      // Add event listeners for actions
      actionsCell.addEventListener('click', async (e) => {
        if (e.target.tagName === 'BUTTON') {
          const invitationId = e.target.dataset.id;
          const action = e.target.dataset.action;
          
          if (action === 'resend') {
            if (confirm('Are you sure you want to resend this invitation?')) {
              try {
                const response = await apiRequest(`/admin/invitations/${invitationId}/resend`, 'POST');
                alert(`Invitation resent successfully. Temporary password: ${response.temp_password}`);
                fetchInvitations();
              } catch (error) {
                alert(`Error resending invitation: ${error.message}`);
              }
            }
          } else if (action === 'revoke') {
            if (confirm('Are you sure you want to revoke this invitation?')) {
              try {
                await apiRequest(`/admin/invitations/${invitationId}/revoke`, 'POST');
                alert('Invitation revoked successfully');
                fetchInvitations();
              } catch (error) {
                alert(`Error revoking invitation: ${error.message}`);
              }
            }
          }
        }
      });
      
      // Add cells to row
      row.appendChild(userCell);
      row.appendChild(inviterCell);
      row.appendChild(roleCell);
      row.appendChild(statusCell);
      row.appendChild(expiresCell);
      row.appendChild(actionsCell);
      
      // Add row to table
      tableBody.appendChild(row);
    });
    
    // Update stats
    updateInvitationStats(invitations);
  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-4 text-center text-red-500">
          Error loading invitations: ${error.message}
        </td>
      </tr>
    `;
  }
}

// Update invitation statistics
function updateInvitationStats(invitations) {
  const statsElement = document.getElementById('invitationStats');
  
  // Count by status
  const pending = invitations.filter(inv => inv.status === 'pending').length;
  const accepted = invitations.filter(inv => inv.status === 'accepted').length;
  const expired = invitations.filter(inv => inv.status === 'expired').length;
  const revoked = invitations.filter(inv => inv.status === 'revoked').length;
  
  statsElement.innerHTML = `
    Total: ${invitations.length} invitations | 
    <span class="text-yellow-600">${pending} pending</span> | 
    <span class="text-green-600">${accepted} accepted</span> | 
    <span class="text-gray-600">${expired} expired</span> | 
    <span class="text-red-600">${revoked} revoked</span>
  `;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Add event listener for view invitations button
  if (viewInvitationsBtn) {
    viewInvitationsBtn.addEventListener('click', showInvitationsModal);
  }
});
