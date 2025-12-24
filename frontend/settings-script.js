// Settings page functionality

// Load user profile on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Settings page loaded');
    loadUserProfile();
    loadSettings();
    updateBillingStats();
    
    // Check URL hash and show corresponding section
    const hash = window.location.hash.substring(1); // Remove # from hash
    console.log('📍 URL Hash detected:', hash || 'none');
    if (hash) {
        showSectionByName(hash);
    } else {
        // Default to profile if no hash
        console.log('⚠️ No hash, showing profile by default');
    }
});

// Listen for hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    console.log('🔄 Hash changed to:', hash);
    if (hash) {
        showSectionByName(hash);
    }
});

// Show specific settings section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.add('active');
    
    // Set active nav item
    event.target.closest('.settings-nav-item').classList.add('active');
    
    // Update URL hash without reloading
    window.history.pushState(null, null, '#' + sectionName);
}

// Show section by name (without event)
function showSectionByName(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Hide all sections
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionName + '-section');
    if (section) {
        section.classList.add('active');
        console.log('Section activated:', sectionName);
    } else {
        console.warn('Section not found:', sectionName + '-section');
    }
    
    // Find and activate corresponding nav item
    const navItems = document.querySelectorAll('.settings-nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('onclick')?.includes(`'${sectionName}'`)) {
            item.classList.add('active');
        }
    });
    
    // Scroll to top of settings content
    const settingsContent = document.querySelector('.settings-content');
    if (settingsContent) {
        settingsContent.scrollTop = 0;
    }
}

// Load user profile
function loadUserProfile() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    
    // Load profile data
    if (userData.name) {
        document.getElementById('fullName').value = userData.name;
        document.getElementById('navUserName').textContent = userData.name;
        
        // Update avatar with first letter
        const initial = userData.name.charAt(0).toUpperCase();
        document.getElementById('avatarPreview').textContent = initial;
    }
    
    if (userData.email) {
        document.getElementById('email').value = userData.email;
    }
    
    // Load saved settings
    if (settings.phone) document.getElementById('phone').value = settings.phone;
    if (settings.bio) document.getElementById('bio').value = settings.bio;
    if (settings.companyName) document.getElementById('companyName').value = settings.companyName;
    if (settings.regNumber) document.getElementById('regNumber').value = settings.regNumber;
    if (settings.companyAddress) document.getElementById('companyAddress').value = settings.companyAddress;
    if (settings.companyEmail) document.getElementById('companyEmail').value = settings.companyEmail;
    if (settings.companyPhone) document.getElementById('companyPhone').value = settings.companyPhone;
    if (settings.taxId) document.getElementById('taxId').value = settings.taxId;
    if (settings.website) document.getElementById('website').value = settings.website;
    if (settings.currency) document.getElementById('currency').value = settings.currency;
    if (settings.taxRate !== undefined) document.getElementById('taxRate').value = settings.taxRate;
    if (settings.lateFee !== undefined) document.getElementById('lateFee').value = settings.lateFee;
    if (settings.gracePeriod !== undefined) document.getElementById('gracePeriod').value = settings.gracePeriod;
    if (settings.dueDate !== undefined) document.getElementById('dueDate').value = settings.dueDate;
    if (settings.genDate !== undefined) document.getElementById('genDate').value = settings.genDate;
    
    // Load avatar if saved
    if (settings.avatarUrl) {
        const avatarPreview = document.getElementById('avatarPreview');
        avatarPreview.innerHTML = `<img src="${settings.avatarUrl}" alt="Avatar">`;
    }
}

// Make loadUserProfile globally accessible
window.loadUserProfile = loadUserProfile;

// Load all settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    console.log('Loaded settings:', settings);
}

// Handle avatar upload
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showError('File size must be less than 2MB');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
    }
    
    // Read and display image
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarPreview = document.getElementById('avatarPreview');
        avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
        
        // Save to settings
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        settings.avatarUrl = e.target.result;
        localStorage.setItem('appSettings', JSON.stringify(settings));
        
        showSuccessMessage();
    };
    reader.readAsDataURL(file);
}

// Save profile
async function saveProfile(event) {
    event.preventDefault();
    
    const profileData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        bio: document.getElementById('bio').value
    };
    
    try {
        // Update profile via API
        const result = await window.api.updateProfile(
            profileData.fullName,
            profileData.phone,
            profileData.bio
        );
        
        if (result.status === 'success') {
            // Update localStorage with new data
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            userData.name = profileData.fullName;
            userData.phone = profileData.phone;
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Save additional settings locally
            const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            settings.phone = profileData.phone;
            settings.bio = profileData.bio;
            localStorage.setItem('appSettings', JSON.stringify(settings));
            
            // Update navbar
            document.getElementById('navUserName').textContent = profileData.fullName;
            
            showSuccessMessage();
            // Redirect to dashboard immediately after save
            setTimeout(function() {
                window.location.href = 'admin-dashboard.html';
            }, 500);
        } else {
            showError(result.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showError('Failed to update profile. Please try again.');
    }
}

// Save company info
function saveCompanyInfo(event) {
    event.preventDefault();
    
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    
    settings.companyName = document.getElementById('companyName').value;
    settings.regNumber = document.getElementById('regNumber').value;
    settings.companyAddress = document.getElementById('companyAddress').value;
    settings.companyEmail = document.getElementById('companyEmail').value;
    settings.companyPhone = document.getElementById('companyPhone').value;
    settings.taxId = document.getElementById('taxId').value;
    settings.website = document.getElementById('website').value;
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    showSuccessMessage();
    // Redirect to dashboard immediately after saving
    setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
    }, 500);
}

// Save notifications
function saveNotifications() {
    const toggles = document.querySelectorAll('#notifications-section .toggle-switch');
    const notificationSettings = {
        payment: toggles[0].classList.contains('active'),
        overdue: toggles[1].classList.contains('active'),
        newTenant: toggles[2].classList.contains('active'),
        billReminder: toggles[3].classList.contains('active'),
        email: toggles[4].classList.contains('active')
    };
    
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    settings.notifications = notificationSettings;
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    showSuccessMessage();
    // Redirect to dashboard immediately after saving
    setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
    }, 500);
}

// Change password
function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match!');
        return;
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
        showError('Password must be at least 8 characters long!');
        return;
    }
    
    // Get current user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Verify current password
    if (userData.password && userData.password !== currentPassword) {
        showError('Current password is incorrect!');
        return;
    }
    
    // Update password in userData
    userData.password = newPassword;
    localStorage.setItem('userData', JSON.stringify(userData));
    
    showSuccess('Password changed successfully! Your new password has been saved.');
    
    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    showSuccessMessage();
}

// Save billing settings
function saveBillingSettings(event) {
    event.preventDefault();
    
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    
    settings.currency = document.getElementById('currency').value;
    settings.taxRate = parseFloat(document.getElementById('taxRate').value);
    settings.lateFee = parseFloat(document.getElementById('lateFee').value);
    settings.gracePeriod = parseInt(document.getElementById('gracePeriod').value);
    settings.dueDate = parseInt(document.getElementById('dueDate').value);
    settings.genDate = parseInt(document.getElementById('genDate').value);
    
    // Get toggle states
    const toggles = document.querySelectorAll('#billing-section .toggle-switch');
    settings.autoGenerateBills = toggles[0].classList.contains('active');
    settings.emailBills = toggles[1].classList.contains('active');
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    showSuccessMessage();
    // Redirect to dashboard immediately after saving
    setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
    }, 500);
}

// Toggle switch
function toggleSwitch(element) {
    element.classList.toggle('active');
}

// Show success message
function showSuccessMessage() {
    const message = document.getElementById('successMessage');
    message.classList.add('show');
    
    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

// Reset form
function resetForm() {
    loadUserProfile();
}

// Update billing stats
function updateBillingStats() {
    // Get tenants
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
    document.getElementById('totalTenants').textContent = tenants.length;
    
    // Get bills
    const bills = JSON.parse(localStorage.getItem('generatedBills') || '[]');
    document.getElementById('totalBills').textContent = bills.length;
    
    // Calculate total revenue
    const totalRevenue = bills.reduce((sum, bill) => {
        return sum + (parseFloat(bill.totalAmount) || 0);
    }, 0);
    
    document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toLocaleString();
}

// Sidebar toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Handle logout
async function handleLogout(event) {
    event.preventDefault();
    
    const confirmed = await confirmAction({
        title: 'Logout?',
        message: 'Are you sure you want to logout?',
        confirmText: 'Logout',
        cancelText: 'Stay',
        type: 'warning'
    });
    if (confirmed) {
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Redirect to login
        window.location.href = 'index.html';
    }
}

// Auto-save on visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadUserProfile();
        updateBillingStats();
    }
});
