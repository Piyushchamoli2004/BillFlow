// Recent Activities Script

// Load all activities from API
async function loadActivities() {
    const activities = [];
    
    try {
        // Get bills from API
        const billsResult = await window.api.getBills({ limit: 100 });
        const bills = billsResult.data?.bills || [];
        
        // Add bill activities
        bills.forEach(bill => {
            const billDate = new Date(bill.date || bill.createdAt);
            
            if (bill.paymentStatus === 'paid' && bill.paymentDate) {
                activities.push({
                    type: 'payment',
                    title: `Payment Received`,
                    description: `${bill.tenantName || 'Unknown'} - Room ${bill.roomNumber || 'N/A'}`,
                    time: getTimeAgo(new Date(bill.paymentDate)),
                    amount: parseFloat(bill.totalAmount),
                    timestamp: new Date(bill.paymentDate),
                    billNumber: bill.billNumber
                });
            } else if (bill.paymentStatus === 'overdue') {
                activities.push({
                    type: 'overdue',
                    title: `Payment Overdue`,
                    description: `${bill.tenantName || 'Unknown'} - Room ${bill.roomNumber || 'N/A'}`,
                    time: getTimeAgo(billDate),
                    amount: parseFloat(bill.totalAmount),
                    timestamp: billDate,
                    billNumber: bill.billNumber
                });
            } else if (bill.paymentStatus === 'pending') {
                activities.push({
                    type: 'pending',
                    title: `Payment Pending`,
                    description: `${bill.tenantName || 'Unknown'} - Room ${bill.roomNumber || 'N/A'}`,
                    time: getTimeAgo(billDate),
                    amount: parseFloat(bill.totalAmount),
                    timestamp: billDate,
                    billNumber: bill.billNumber
                });
            } else {
                activities.push({
                    type: 'bill',
                    title: `Bill Generated`,
                    description: `${bill.tenantName || 'Unknown'} - Room ${bill.roomNumber || 'N/A'} - Bill #${bill.billNumber || 'N/A'}`,
                    time: getTimeAgo(billDate),
                    amount: parseFloat(bill.totalAmount),
                    timestamp: billDate,
                    billNumber: bill.billNumber
                });
            }
        });
        
        // Get tenants from API
        try {
            const tenantsResult = await window.api.getTenants();
            const tenants = tenantsResult.data?.tenants || [];
            
            // Add tenant activities
            tenants.forEach(tenant => {
                if (tenant.createdAt) {
                    const tenantDate = new Date(tenant.createdAt);
                    activities.push({
                        type: 'tenant',
                        title: `New Tenant Added`,
                        description: `${tenant.name} - Room ${tenant.roomNumber}`,
                        time: getTimeAgo(tenantDate),
                        badge: 'New',
                        timestamp: tenantDate
                    });
                }
            });
        } catch (error) {
            console.error('Error loading tenants for activities:', error);
        }
        
        // Sort by timestamp (newest first)
        activities.sort((a, b) => b.timestamp - a.timestamp);
        return activities;
    } catch (error) {
        console.error('Error loading activities:', error);
        return [];
    }
}

// Display activities
function displayActivities(activities) {
    const container = document.getElementById('activitiesContainer');
    
    if (activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 120 120" fill="none">
                    <rect x="30" y="40" width="60" height="60" rx="8" stroke="currentColor" stroke-width="3"/>
                    <path d="M40 55H80M40 65H80M40 75H65" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
                <div class="empty-title">No Activities Found</div>
                <div class="empty-text">Start by generating bills or adding tenants to see activities</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.map(activity => {
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
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                        ${iconSvg}
                    </svg>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
                ${amountHtml}
            </div>
        `;
    }).join('');
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('searchActivities').value.toLowerCase();
    const typeFilter = document.getElementById('filterType').value;
    const periodFilter = document.getElementById('filterPeriod').value;
    
    let activities = loadActivities();
    
    // Apply search filter
    if (searchTerm) {
        activities = activities.filter(activity => 
            activity.title.toLowerCase().includes(searchTerm) ||
            activity.description.toLowerCase().includes(searchTerm) ||
            (activity.billNumber && activity.billNumber.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
        activities = activities.filter(activity => activity.type === typeFilter);
    }
    
    // Apply period filter
    if (periodFilter !== 'all') {
        const now = new Date();
        activities = activities.filter(activity => {
            const activityDate = new Date(activity.timestamp);
            
            switch(periodFilter) {
                case 'today':
                    return activityDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return activityDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return activityDate >= monthAgo;
                default:
                    return true;
            }
        });
    }
    
    displayActivities(activities);
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

// Setup sidebar navigation
function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Handle logout
            if (href === '#logout') {
                e.preventDefault();
                handleLogout();
                return;
            }
            
            // Handle other navigation
            if (href && !href.startsWith('#')) {
                // Let the default navigation happen
                return;
            }
            
            e.preventDefault();
        });
    });
}

// Handle logout
async function handleLogout() {
    const confirmed = await confirmAction({
        title: 'Logout?',
        message: 'Are you sure you want to logout?',
        confirmText: 'Logout',
        cancelText: 'Stay',
        type: 'warning'
    });
    if (confirmed) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Setup navigation
    setupSidebarNavigation();
    
    // Load and display activities
    const activities = await loadActivities();
    displayActivities(activities);
    
    // Setup filters
    document.getElementById('searchActivities').addEventListener('input', applyFilters);
    document.getElementById('filterType').addEventListener('change', applyFilters);
    document.getElementById('filterPeriod').addEventListener('change', applyFilters);
});

