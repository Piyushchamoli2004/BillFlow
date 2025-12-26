// Tenant data from API
let tenants = [];
let editingTenantId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadTenants();
    displayTenants();
    setupEventListeners();
});

// Load tenants from API
async function loadTenants() {
    try {
        const result = await window.api.getTenants();
        console.log('API result:', result);
        if (result.status === 'success') {
            tenants = Array.isArray(result.data.tenants) ? result.data.tenants : [];
            console.log('Loaded tenants from API:', tenants.length);
        } else {
            console.error('Failed to load tenants:', result.message);
            showError('Failed to load tenants');
            tenants = [];
        }
    } catch (error) {
        console.error('Error loading tenants:', error);
        showError('Error loading tenants');
        tenants = [];
    }
}

// Make loadTenants globally accessible
window.loadTenants = loadTenants;

// Display tenants in grid
function displayTenants(filter = 'all', searchQuery = '') {
    const grid = document.getElementById('tenantsGrid');
    const emptyState = document.getElementById('emptyState');
    
    // Filter tenants
    let filteredTenants = tenants;
    
    if (filter !== 'all') {
        filteredTenants = filteredTenants.filter(t => t.status === filter);
    }
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredTenants = filteredTenants.filter(t => 
            t.name.toLowerCase().includes(query) || 
            (t.roomNumber || t.room || '').toLowerCase().includes(query) ||
            (t.phone || '').toLowerCase().includes(query)
        );
    }
    
    // Show empty state if no tenants
    if (filteredTenants.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // Generate tenant cards
    grid.innerHTML = filteredTenants.map(tenant => `
        <div class="tenant-card">
            <div class="tenant-header">
                <div class="tenant-avatar">${tenant.name.charAt(0).toUpperCase()}</div>
                <div class="tenant-info">
                    <div class="tenant-name">${tenant.name}</div>
                    <div class="tenant-room">${tenant.roomNumber || tenant.room}</div>
                </div>
            </div>
            <div class="tenant-details">
                <div class="detail-row">
                    <svg class="detail-icon" viewBox="0 0 18 18" fill="none">
                        <path d="M2 5.5C2 4.67157 2.67157 4 3.5 4H14.5C15.3284 4 16 4.67157 16 5.5V12.5C16 13.3284 15.3284 14 14.5 14H3.5C2.67157 14 2 13.3284 2 12.5V5.5Z" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M2 5.5L9 9.5L16 5.5" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                    <span>${tenant.email || 'No email'}</span>
                </div>
                <div class="detail-row">
                    <svg class="detail-icon" viewBox="0 0 18 18" fill="none">
                        <path d="M2 4C2 3.44772 2.44772 3 3 3H6.5C6.77614 3 7 3.22386 7 3.5V7.5C7 7.77614 6.77614 8 6.5 8H3C2.44772 8 2 7.55228 2 7V4Z" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M7 4L11 2L15 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <span>${tenant.phone}</span>
                </div>
                <div class="detail-row">
                    <svg class="detail-icon" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M9 5V10M7 8C7 7.5 7.5 7 8 7H10C10.5 7 11 7.5 11 8C11 8.5 10.5 9 10 9H8C7.5 9 7 9.5 7 10C7 10.5 7.5 11 8 11H10C10.5 11 11 10.5 11 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <span>₹${tenant.rentAmount || tenant.rent}/month</span>
                </div>
            </div>
            <span class="tenant-status status-${tenant.status}">
                ${tenant.status === 'active' ? '● Active' : '○ Inactive'}
            </span>
            <div class="tenant-actions">
                <button class="btn-action btn-edit" onclick="editTenant('${tenant._id}')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11 2L14 5L6 13H3V10L11 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Edit
                </button>
                <button class="btn-action btn-delete" onclick="deleteTenant('${tenant._id}')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M4 4H12V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4Z" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchTenants');
    searchInput.addEventListener('input', (e) => {
        const filter = document.getElementById('filterStatus').value;
        displayTenants(filter, e.target.value);
    });
    
    // Filter functionality
    const filterSelect = document.getElementById('filterStatus');
    filterSelect.addEventListener('change', (e) => {
        const search = document.getElementById('searchTenants').value;
        displayTenants(e.target.value, search);
    });
    
    // Phone number validation - prevent typing more than 10 digits and only allow numbers
    const phoneInput = document.getElementById('tenantPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Remove any non-numeric characters
            let value = e.target.value.replace(/[^0-9]/g, '');
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            e.target.value = value;
            
            // Clear any existing error when user types
            const errorDiv = phoneInput.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('field-error')) {
                errorDiv.remove();
            }
        });
        
        phoneInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = (e.clipboardData || window.clipboardData).getData('text');
            const numbers = pastedData.replace(/[^0-9]/g, '').slice(0, 10);
            e.target.value = numbers;
        });
    }
    
    // Tenant name validation
    const nameInput = document.getElementById('tenantName');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            // Clear error when user types
            const errorDiv = nameInput.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('field-error')) {
                errorDiv.remove();
            }
        });
    }
    
    // Rent validation - prevent negative values
    const rentInput = document.getElementById('tenantRent');
    if (rentInput) {
        rentInput.addEventListener('input', (e) => {
            if (e.target.value < 0) {
                e.target.value = 0;
            }
            // Clear error when user types
            const errorDiv = rentInput.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('field-error')) {
                errorDiv.remove();
            }
        });
    }
    
    // Form submission
    const form = document.getElementById('tenantForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTenantData();
    });
    
    // Logout
    const logoutBtn = document.querySelector('.nav-item-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const confirmed = await confirmAction({
                title: 'Logout?',
                message: 'Are you sure you want to logout?',
                confirmText: 'Logout',
                cancelText: 'Stay',
                type: 'warning'
            });
            if (confirmed) {
                window.location.href = 'login.html';
            }
        });
    }
}

// Open add tenant modal
function openAddTenantModal() {
    editingTenantId = null;
    document.getElementById('modalTitle').textContent = 'Add New Tenant';
    document.getElementById('tenantForm').reset();
    document.getElementById('tenantId').value = '';
    document.getElementById('tenantModal').classList.add('active');
}

// Open edit tenant modal
function editTenant(id) {
    editingTenantId = id;
    const tenant = tenants.find(t => t._id === id);
    
    if (!tenant) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Tenant';
    document.getElementById('tenantId').value = tenant._id;
    document.getElementById('tenantName').value = tenant.name;
    document.getElementById('tenantRoom').value = tenant.roomNumber || tenant.room;
    document.getElementById('tenantPhone').value = tenant.phone;
    document.getElementById('tenantEmail').value = tenant.email || '';
    document.getElementById('tenantRent').value = tenant.rentAmount || tenant.rent;
    document.getElementById('tenantStatus').value = tenant.status;
    
    document.getElementById('tenantModal').classList.add('active');
}

// Close tenant modal
function closeTenantModal() {
    document.getElementById('tenantModal').classList.remove('active');
    editingTenantId = null;
}

// Make functions globally available
window.openAddTenantModal = openAddTenantModal;
window.closeTenantModal = closeTenantModal;
window.editTenant = editTenant;
window.deleteTenant = deleteTenant;

// Helper function to show field error below input
function showFieldError(inputElement, message) {
    // Remove any existing error for this field
    const existingError = inputElement.nextElementSibling;
    if (existingError && existingError.classList.contains('field-error')) {
        existingError.remove();
    }
    
    // Create and insert error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = 'color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem;';
    errorDiv.textContent = message;
    inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    
    // Add error styling to input
    inputElement.style.borderColor = '#dc2626';
}

// Helper function to clear field error
function clearFieldError(inputElement) {
    const errorDiv = inputElement.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('field-error')) {
        errorDiv.remove();
    }
    inputElement.style.borderColor = '';
}

// Save tenant data
async function saveTenantData() {
    const nameInput = document.getElementById('tenantName');
    const roomInput = document.getElementById('tenantRoom');
    const phoneInput = document.getElementById('tenantPhone');
    const emailInput = document.getElementById('tenantEmail');
    const rentInput = document.getElementById('tenantRent');
    const statusInput = document.getElementById('tenantStatus');
    
    const name = nameInput.value.trim();
    const room = roomInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const rent = parseFloat(rentInput.value);
    const status = statusInput.value;
    
    // Clear all previous errors
    [nameInput, roomInput, phoneInput, emailInput, rentInput].forEach(clearFieldError);
    
    let hasError = false;
    
    // Validate tenant name
    if (!name) {
        showFieldError(nameInput, 'Tenant name is required.');
        hasError = true;
    } else if (name.length < 3) {
        showFieldError(nameInput, 'Tenant name must be at least 3 characters long.');
        hasError = true;
    }
    
    // Validate room
    if (!room) {
        showFieldError(roomInput, 'Room number is required.');
        hasError = true;
    }
    
    // Validate phone
    if (!phone) {
        showFieldError(phoneInput, 'Phone number is required.');
        hasError = true;
    } else if (!/^[0-9]+$/.test(phone)) {
        showFieldError(phoneInput, 'Phone number must contain only numeric digits (0–9).');
        hasError = true;
    } else if (phone.length > 10) {
        showFieldError(phoneInput, 'Phone number must be exactly 10 digits. You entered more than 10 digits.');
        hasError = true;
    } else if (phone.length < 10) {
        showFieldError(phoneInput, 'Phone number must be exactly 10 digits. You entered fewer digits.');
        hasError = true;
    }
    
    // Validate rent
    if (!rent || isNaN(rent)) {
        showFieldError(rentInput, 'Monthly rent is required and must be a valid number.');
        hasError = true;
    } else if (rent < 0) {
        showFieldError(rentInput, 'Monthly rent cannot be negative.');
        hasError = true;
    }
    
    if (hasError) {
        return;
    }
    
    const tenantData = {
        name,
        roomNumber: room,
        phone,
        email,
        rentAmount: rent,
        status
    };
    
    try {
        let result;
        if (editingTenantId) {
            // Update existing tenant
            result = await window.api.updateTenant(editingTenantId, tenantData);
        } else {
            // Add new tenant
            result = await window.api.createTenant(tenantData);
        }
        
        if (result.status === 'success') {
            await loadTenants();
            displayTenants();
            closeTenantModal();
            
            const action = editingTenantId ? 'updated' : 'added';
            showSuccess(`Tenant ${action} successfully! ${name} (Room ${room})`);
        } else {
            // Display the specific error message from backend
            showError(result.message || 'Failed to save tenant');
        }
    } catch (error) {
        console.error('Error saving tenant:', error);
        // Display the actual error message from API
        showError(error.message || 'Error saving tenant');
    }
}

// Delete tenant
async function deleteTenant(id) {
    const tenant = tenants.find(t => t._id === id);
    if (!tenant) return;
    
    const confirmed = await confirmAction({
        title: 'Delete Tenant?',
        message: `Are you sure you want to delete ${tenant.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
    });
    
    if (confirmed) {
        try {
            const result = await window.api.deleteTenant(id);
            if (result.status === 'success') {
                await loadTenants();
                displayTenants();
                showSuccess('Tenant deleted successfully!');
            } else {
                showError(result.message || 'Failed to delete tenant');
            }
        } catch (error) {
            console.error('Error deleting tenant:', error);
            showError('Error deleting tenant');
        }
    }
}

// Close modal when clicking outside
document.getElementById('tenantModal').addEventListener('click', (e) => {
    if (e.target.id === 'tenantModal') {
        closeTenantModal();
    }
});
