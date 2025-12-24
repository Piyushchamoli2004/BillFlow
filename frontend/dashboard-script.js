// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard loading...');
    
    checkAuthentication();
    await window.loadUserProfile();
    initializeDashboard();
});

// Reload data when page becomes visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('Dashboard page visible - reloading activities');
        loadRecentActivities();
        updateDashboardStats();
    }
});

// Also reload when window gains focus
window.addEventListener('focus', () => {
    console.log('Dashboard window focused - reloading activities');
    loadRecentActivities();
    updateDashboardStats();
});

// Check if user is authenticated
function checkAuthentication() {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    console.log('Dashboard Auth Check:', {
        hasToken: !!authToken,
        hasUserData: !!userData,
        token: authToken ? authToken.substring(0, 20) + '...' : 'none'
    });
    
    if (!authToken) {
        console.log('No token found, redirecting to login');
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Auth check passed, user is authenticated');
}

// Load user profile from API
async function loadUserProfile() {
    const userData = localStorage.getItem('userData');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            // Update user name in navbar
            const userName = document.querySelector('.user-name');
            if (userName) {
                userName.textContent = user.name || 'Admin User';
            }
            
            // Update user role
            const userRole = document.querySelector('.user-role');
            if (userRole) {
                userRole.textContent = user.role === 'admin' ? 'Administrator' : 'User';
            }
            
            // Update user avatar with first letter
            const userAvatar = document.querySelector('.user-avatar img');
            if (userAvatar && user.name) {
                const firstLetter = user.name.charAt(0).toUpperCase();
                userAvatar.src = `data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23667eea'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16' font-weight='bold'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
            }
            
            // Update welcome message
            const welcomeTitle = document.querySelector('.welcome-title');
            if (welcomeTitle && user.name) {
                const firstName = user.name.split(' ')[0];
                welcomeTitle.textContent = `Welcome back, ${firstName}! 👋`;
            }
            
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }
}

// Make loadUserProfile globally accessible
window.loadUserProfile = loadUserProfile;

// Initialize dashboard functionality
function initializeDashboard() {
    // Sidebar navigation
    setupSidebarNavigation();
    
    // Action cards
    setupActionCards();
    
    // Logout functionality
    setupLogout();
    
    // User profile dropdown handled by navbar-dropdown.js
    
    // Notification button
    setupNotifications();
    
    // Search functionality
    setupSearch();
    
    // Load recent activities
    loadRecentActivities();
    
    // Update dashboard stats
    updateDashboardStats();
}

// Setup sidebar navigation
function setupSidebarNavigation() {
    // Only handle logout link with special behavior
    const logoutLink = document.querySelector('.nav-item[href="login.html"], .nav-item[href="#logout"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // All other navigation links will work normally without interference
}

// Navigate to different sections
function navigateTo(section) {
    switch(section) {
        case '#dashboard':
            window.location.href = 'admin-dashboard.html';
            break;
        case '#generate-bill':
            window.location.href = 'generate-bill.html';
            break;
        case '#payment-history':
            window.location.href = 'payment-history.html';
            break;
        case '#tenant-details':
            window.location.href = 'tenant-details.html';
            break;
        case '#settings':
            window.location.href = 'settings.html';
            break;
        default:
            console.log('Navigating to:', section);
    }
}

// Setup action cards
function setupActionCards() {
    const actionCards = document.querySelectorAll('.action-card');
    
    actionCards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', () => {
            const title = card.querySelector('.action-card-title').textContent;
            handleActionCardClick(title, index);
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// Handle action card clicks
function handleActionCardClick(title, index) {
    switch(index) {
        case 0: // Generate Bill
            window.location.href = 'generate-bill.html';
            break;
        case 1: // View Tenants
            window.location.href = 'tenant-details.html';
            break;
        case 2: // Payment Status
            window.location.href = 'payment-history.html';
            break;
        case 3: // Recent Activities
            window.location.href = 'recent-activities.html';
            break;
        default:
            console.log('Action card clicked:', title);
    }
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.querySelector('.nav-item-logout');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Handle logout
async function handleLogout() {
    // Show confirmation dialog
    const confirmed = await confirmAction({
        title: 'Logout?',
        message: 'Are you sure you want to logout?',
        confirmText: 'Logout',
        cancelText: 'Stay',
        type: 'warning'
    });
    
    if (!confirmed) return;
    
    try {
        // Call API logout
        await window.api.logout();
        console.log('Logging out user...');
    } catch (error) {
        console.error('Logout error:', error);
        // Clear localStorage even if API call fails
        window.api.clearToken();
        localStorage.clear();
    } finally {
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Old dropdown code removed - now using navbar-dropdown.js

// Setup notifications
function setupNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            showNotifications();
        });
    }
}

// Show notifications
function showNotifications() {
    showInfo('No new notifications at this time');
    // TODO: Implement notifications panel
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    handleSearch(query);
                }
            }
        });
    }
}

// Handle search
function handleSearch(query) {
    console.log('Searching for:', query);
    // TODO: Implement search functionality
    showInfo(`Searching for: ${query}`);
}

// Quick action button
const quickActionBtn = document.querySelector('.btn-quick-action');
if (quickActionBtn) {
    quickActionBtn.addEventListener('click', () => {
        window.location.href = 'generate-bill.html';
    });
}

// Load recent activities from API
async function loadRecentActivities() {
    console.log('=== LOADING RECENT ACTIVITIES ===');
    const activitiesContainer = document.querySelector('.activities-card');
    if (!activitiesContainer) {
        console.error('Activities container not found');
        return;
    }
    
    const activities = await getRecentActivities();
    console.log('Activities found:', activities.length);
    
    if (activities.length === 0) {
        activitiesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #6b7280;">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin: 0 auto 16px; opacity: 0.3;">
                    <rect x="12" y="16" width="40" height="40" rx="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M20 28H44M20 36H44M20 44H36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p style="font-size: 14px;">No recent activities yet</p>
            </div>
        `;
        return;
    }
    
    activitiesContainer.innerHTML = activities.map(activity => {
        let iconSvg, iconClass;
        
        switch(activity.type) {
            case 'payment':
                iconClass = 'activity-icon-success';
                iconSvg = '<path d="M5 10L8 13L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
                break;
            case 'bill':
                iconClass = 'activity-icon-primary';
                iconSvg = '<path d="M6 3L4 5V17L6 19H14L16 17V5L14 3H6Z" stroke="currentColor" stroke-width="1.5"/>';
                break;
            case 'pending':
                iconClass = 'activity-icon-warning';
                iconSvg = '<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 6V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/>';
                break;
            case 'tenant':
                iconClass = 'activity-icon-info';
                iconSvg = '<circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M5 17C5 14 7 12 10 12C13 12 15 14 15 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
                break;
            case 'overdue':
                iconClass = 'activity-icon-danger';
                iconSvg = '<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 5V10M10 13V13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
                break;
            default:
                iconClass = 'activity-icon-info';
                iconSvg = '<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>';
        }
        
        let amountHtml = '';
        if (activity.amount) {
            const amountClass = activity.type === 'payment' ? 'activity-amount-success' : 
                               activity.type === 'pending' ? 'activity-amount-warning' : 
                               activity.type === 'overdue' ? 'activity-amount-danger' : '';
            const prefix = activity.type === 'payment' ? '+' : '';
            amountHtml = `<div class="activity-amount ${amountClass}">${prefix}₹${activity.amount.toLocaleString('en-IN')}</div>`;
        } else if (activity.badge) {
            amountHtml = `<div class="activity-badge">${activity.badge}</div>`;
        }
        
        return `
            <div class="activity-item">
                <div class="activity-icon ${iconClass}">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        ${iconSvg}
                    </svg>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
                ${amountHtml}
            </div>
        `;
    }).join('');
}

// Get recent activities from bills and tenants via API
async function getRecentActivities() {
    const activities = [];
    
    try {
        // Get bills and tenants from API
        const [billsResult, tenantsResult] = await Promise.all([
            window.api.getBills({ limit: 50 }),
            window.api.getTenants({ limit: 50 })
        ]);
        
        const bills = billsResult.data?.bills || [];
        const tenants = tenantsResult.data?.tenants || [];
    
        console.log('Loading recent activities - Bills:', bills.length, 'Tenants:', tenants.length);
        console.log('Tenants array:', tenants);
        
        // Add bill activities
        bills.forEach(bill => {
            const billDate = new Date(bill.date);
            const timeAgo = getTimeAgo(billDate);
            
            if (bill.paymentStatus === 'paid' && bill.paymentDate) {
                activities.push({
                    type: 'payment',
                    title: `Payment Received - ${bill.tenantName || 'Room ' + bill.roomNumber}`,
                    time: getTimeAgo(new Date(bill.paymentDate)),
                    amount: parseFloat(bill.totalAmount),
                    timestamp: new Date(bill.paymentDate)
                });
            } else if (bill.paymentStatus === 'overdue') {
                activities.push({
                    type: 'overdue',
                    title: `Payment Overdue - ${bill.tenantName || 'Room ' + bill.roomNumber}`,
                    time: timeAgo,
                    amount: parseFloat(bill.totalAmount),
                    timestamp: billDate
                });
            } else if (bill.paymentStatus === 'pending') {
                activities.push({
                    type: 'pending',
                    title: `Payment Pending - ${bill.tenantName || 'Room ' + bill.roomNumber}`,
                    time: timeAgo,
                    amount: parseFloat(bill.totalAmount),
                    timestamp: billDate
                });
            } else {
                activities.push({
                    type: 'bill',
                    title: `Bill Generated - ${bill.tenantName || 'Room ' + bill.roomNumber}`,
                    time: timeAgo,
                    amount: parseFloat(bill.totalAmount),
                    timestamp: billDate
                });
            }
        });
        
        // Add tenant activities
        tenants.forEach(tenant => {
            if (tenant.dateAdded) {
                const tenantDate = new Date(tenant.dateAdded);
                activities.push({
                    type: 'tenant',
                    title: `New Tenant Added - ${tenant.name}`,
                    time: getTimeAgo(tenantDate),
                    badge: 'New',
                    timestamp: tenantDate
                });
                console.log('Added tenant activity:', tenant.name, tenantDate);
            } else {
                console.warn('Tenant without dateAdded:', tenant.name);
            }
        });
    
        // Sort by timestamp (newest first) and take top 5
        activities.sort((a, b) => b.timestamp - a.timestamp);
        console.log('Total activities:', activities.length, 'Showing:', Math.min(activities.length, 5));
        return activities.slice(0, 5);
    } catch (error) {
        console.error('Error loading recent activities:', error);
        return [];
    }
}

// Calculate time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

// Update dashboard statistics from API
async function updateDashboardStats() {
    try {
        // Get statistics from API
        const [billStatsResult, tenantStatsResult] = await Promise.all([
            window.api.getBillStats(),
            window.api.getTenantStats()
        ]);
        
        const billStats = billStatsResult.data?.stats || {};
        const tenantStats = tenantStatsResult.data?.stats || {};
        
        // Use API stats
        const totalRevenue = billStats.paidAmount || 0;
        const paidAmount = billStats.paidAmount || 0;
        const pendingAmount = billStats.pendingAmount || 0;
        const overdueAmount = billStats.overdueAmount || 0;
        const totalAmount = paidAmount + pendingAmount + overdueAmount;
        const paidPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
        const pendingPayments = billStats.pendingBills || 0;
        const activeTenants = tenantStats.activeTenants || 0;
        
        // Update UI - First card (Total Revenue)
    const revenueElement = document.querySelector('.analytics-card:nth-child(1) .analytics-value');
    if (revenueElement) {
        revenueElement.textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
    }
    
    // Update UI - Second card (Payment Status Donut Chart)
    const paymentStatusValue = document.querySelector('.analytics-card:nth-child(2) .analytics-value');
    if (paymentStatusValue) {
        paymentStatusValue.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
    }
    
    // Update donut chart
    const donutCircle = document.querySelector('.analytics-card:nth-child(2) .donut-svg circle:nth-child(2)');
    if (donutCircle) {
        const circumference = 2 * Math.PI * 40; // radius is 40
        const offset = circumference - (paidPercentage / 100) * circumference;
        donutCircle.setAttribute('stroke-dasharray', circumference);
        donutCircle.setAttribute('stroke-dashoffset', offset);
    }
    
    // Update donut center percentage
    const donutCenter = document.querySelector('.analytics-card:nth-child(2) .donut-center');
    if (donutCenter) {
        donutCenter.textContent = `${paidPercentage}%`;
    }
    
    // Update legend values
    const paidLegend = document.querySelector('.analytics-card:nth-child(2) .legend-item:nth-child(1) .legend-text');
    if (paidLegend) {
        const paidK = paidAmount >= 1000 ? `${(paidAmount / 1000).toFixed(1)}K` : paidAmount.toFixed(0);
        paidLegend.textContent = `Paid: ₹${paidK}`;
    }
    
    const pendingLegend = document.querySelector('.analytics-card:nth-child(2) .legend-item:nth-child(2) .legend-text');
    if (pendingLegend) {
        const pendingK = pendingAmount >= 1000 ? `${(pendingAmount / 1000).toFixed(1)}K` : pendingAmount.toFixed(0);
        pendingLegend.textContent = `Pending: ₹${pendingK}`;
    }
    
    // Update UI - Third card (Total Tenants)
    const tenantsElement = document.querySelector('.analytics-card:nth-child(3) .analytics-value');
    if (tenantsElement) {
        tenantsElement.textContent = activeTenants;
    }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
        showError('Failed to load dashboard statistics');
    }
}

// Add CSS for dropdown items and activity icons
const style = document.createElement('style');
style.textContent = `
    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
        color: #2d3748;
        font-size: 14px;
    }
    
    .dropdown-item:hover {
        background: #f7fafc;
    }
    
    .dropdown-item svg {
        opacity: 0.7;
    }
    
    .dropdown-divider {
        height: 1px;
        background: #e2e8f0;
        margin: 8px 0;
    }
    
    .activity-icon-danger {
        background: #fecaca !important;
        color: #ef4444 !important;
    }
    
    .activity-amount-danger {
        color: #ef4444 !important;
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// Toggle user dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('userDropdown');
    const profileContainer = document.querySelector('.user-profile-container');
    
    if (dropdown && profileContainer && !profileContainer.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Toggle sidebar
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
        await window.api.logout();
        window.location.href = 'login.html';
    }
}
