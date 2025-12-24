// Payment History Script

// Load payment data from API
async function loadPayments() {
    try {
        const result = await window.api.getBills({ limit: 1000 });
        return result.data?.bills || [];
    } catch (error) {
        console.error('Error loading bills:', error);
        showError('Failed to load bills');
        return [];
    }
}

// Calculate statistics
function calculateStats(bills) {
    const stats = {
        totalBills: bills.length,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0
    };
    
    bills.forEach(bill => {
        const amount = parseFloat(bill.totalAmount) || 0;
        
        if (bill.paymentStatus === 'paid') {
            stats.totalPaid += amount;
        } else if (bill.paymentStatus === 'pending') {
            stats.totalPending += amount;
        } else if (bill.paymentStatus === 'overdue') {
            stats.totalOverdue += amount;
        }
    });
    
    return stats;
}

// Update statistics display
function updateStats(stats) {
    document.getElementById('totalBills').textContent = stats.totalBills;
    document.getElementById('totalPaidAmount').textContent = `₹${stats.totalPaid.toLocaleString('en-IN')}`;
    document.getElementById('totalPendingAmount').textContent = `₹${stats.totalPending.toLocaleString('en-IN')}`;
    document.getElementById('totalOverdueAmount').textContent = `₹${stats.totalOverdue.toLocaleString('en-IN')}`;
}

// Display payments in table
function displayPayments(bills) {
    console.log('Displaying bills:', bills.length);
    const tableBody = document.getElementById('paymentsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (bills.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Sort by date (newest first)
    bills.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tableBody.innerHTML = bills.map(bill => {
        const statusClass = bill.paymentStatus === 'paid' ? 'status-paid' : 
                           bill.paymentStatus === 'pending' ? 'status-pending' : 
                           'status-overdue';
        
        const statusText = bill.paymentStatus === 'paid' ? 'Paid' : 
                          bill.paymentStatus === 'pending' ? 'Pending' : 
                          'Overdue';
        
        // Get tenant initials
        const tenantInitials = bill.tenantName ? bill.tenantName.split(' ').map(n => n[0]).join('').toUpperCase() : 'T';
        
        // Format date
        const formattedDate = new Date(bill.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        // Use MongoDB _id for bill identifier
        const billId = bill._id;
        const billDisplay = `BILL-${bill.billYear}-${billId.slice(-6).toUpperCase()}`;
        
        return `
            <tr data-bill-id="${billId}">
                <td>
                    <span class="bill-number">${billDisplay}</span>
                </td>
                <td>
                    <div class="tenant-cell">
                        <div class="tenant-avatar-small">${tenantInitials}</div>
                        <div class="tenant-info-small">
                            <span class="tenant-name-small">${bill.tenantName || 'Unknown'}</span>
                            <span class="tenant-room-small">Room ${bill.roomNumber || 'N/A'}</span>
                        </div>
                    </div>
                </td>
                <td>${formattedDate}</td>
                <td class="amount-cell">₹${parseFloat(bill.totalAmount || 0).toLocaleString('en-IN')}</td>
                <td>
                    <span class="status-badge ${statusClass}" title="Click to change status (Pending → Paid → Overdue)" style="cursor: pointer;">${statusText}</span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-action-small btn-view" onclick="viewBillDetails('${billId}')" title="View details">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 3C4.5 3 2 8 2 8S4.5 13 8 13 14 8 14 8 11.5 3 8 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                            View
                        </button>
                        <button class="btn-action-small btn-download" onclick="downloadBill('${billId}')" title="Download PDF">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 3V11M8 11L11 8M8 11L5 8M3 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            PDF
                        </button>
                        <button class="btn-action-small btn-whatsapp" onclick="shareToWhatsApp('${billId}')" title="Share on WhatsApp">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            WhatsApp
                        </button>
                        <button class="btn-action-small btn-delete" onclick="deleteBill('${billId}')" title="Delete bill">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add click listeners for status toggle
    setTimeout(() => {
        document.querySelectorAll('.status-badge').forEach((badge, index) => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePaymentStatus(bills[index]);
            });
        });
    }, 100);
}

// Toggle payment status
async function togglePaymentStatus(bill) {
    try {
        // Cycle through statuses: pending -> paid -> overdue -> pending
        const statuses = ['pending', 'paid', 'overdue'];
        const currentStatus = bill.paymentStatus || 'pending';
        const currentIndex = statuses.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % statuses.length;
        const newStatus = statuses[nextIndex];
        
        // Update via API using MongoDB _id
        const billId = bill._id;
        const paymentDate = newStatus === 'paid' ? new Date().toISOString() : null;
        
        await window.api.updateBillStatus(billId, newStatus, paymentDate, 'cash');
        
        // Show notification
        showStatusNotification(`Payment status changed to ${newStatus.toUpperCase()}`);
        
        // Refresh display
        await applyFilters();
    } catch (error) {
        console.error('Error updating bill status:', error);
        showError('Failed to update bill status');
    }
}

// Show status change notification
function showStatusNotification(message) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.status-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'status-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 32px;
        background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// View bill details
function viewBillDetails(billNumber) {
    const bills = loadPayments();
    const bill = bills.find(b => b.billNumber === billNumber);
    
    if (!bill) return;
    
    // Create a more elegant notification message
    const details = `Bill #${bill.billNumber} | ${bill.tenantName} (Room ${bill.roomNumber})\nDate: ${bill.date} | Total: ₹${bill.totalAmount} | Status: ${bill.paymentStatus}${bill.paymentDate ? '\nPaid on: ' + bill.paymentDate : ''}`;
    showInfo(details, 5000);
}

// Download bill as PDF
function downloadBill(billNumber) {
    const bills = loadPayments();
    const bill = bills.find(b => b.billNumber === billNumber);
    
    if (!bill) return;
    
    // Create bill text content
    const billContent = `
BillFlow - Tenant Bill
${'='.repeat(50)}

Bill Number: ${bill.billNumber}
Date: ${bill.date}
Tenant Name: ${bill.tenantName}
Room Number: ${bill.roomNumber}

${'='.repeat(50)}
CHARGES BREAKDOWN
${'='.repeat(50)}

Electricity Charges: ₹${bill.electricityAmount || 0}
Water Charges: ₹${bill.waterAmount || 0}
Base Amount: ₹${bill.baseAmount || 0}
Additional Charges: ₹${bill.additionalCharges || 0}

${'-'.repeat(50)}
TOTAL AMOUNT: ₹${bill.totalAmount}
${'-'.repeat(50)}

Payment Status: ${bill.paymentStatus.toUpperCase()}
${bill.paymentDate ? 'Payment Date: ' + bill.paymentDate : ''}

${'='.repeat(50)}
Thank you for your payment!
    `;
    
    // Create blob and download
    const blob = new Blob([billContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bill_${bill.billNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Delete bill
async function deleteBill(billNumber) {
    const confirmed = await confirmAction({
        title: 'Delete Bill?',
        message: `Are you sure you want to delete this bill? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
    });
    
    if (!confirmed) {
        return;
    }
    
    try {
        // Delete via API - billNumber is actually the MongoDB _id
        await window.api.deleteBill(billNumber);
        
        // Show success notification
        showSuccess('Bill deleted successfully');
        
        // Refresh display
        await applyFilters();
    } catch (error) {
        console.error('Error deleting bill:', error);
        showError('Failed to delete bill');
    }
}

// Share bill to WhatsApp
async function shareToWhatsApp(billNumber) {
    const bills = await loadPayments();
    const bill = bills.find(b => b._id === billNumber);
    
    if (!bill) {
        showError('Bill not found!');
        return;
    }
    
    // Get tenant phone number
    const tenants = JSON.parse(localStorage.getItem('tenants')) || [];
    const tenant = tenants.find(t => t.name === bill.tenantName);
    const tenantPhone = tenant?.phone || '';
    
    // Get property owner info
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const propertyName = userData.propertyName || 'Property';
    const ownerName = userData.name || 'Property Owner';
    
    // Format message
    const message = `🏢 *${propertyName}*\n` +
                   `📄 *Bill Details*\n\n` +
                   `Bill Number: ${bill.billNumber}\n` +
                   `Date: ${new Date(bill.date).toLocaleDateString('en-IN')}\n` +
                   `Tenant: ${bill.tenantName}\n` +
                   `Room: ${bill.roomNumber}\n\n` +
                   `💰 *Amount Details*\n` +
                   `Base Rent: ₹${parseFloat(bill.baseAmount || 0).toLocaleString('en-IN')}\n` +
                   `Electricity: ₹${parseFloat(bill.electricityAmount || 0).toLocaleString('en-IN')}\n` +
                   `Water: ₹${parseFloat(bill.waterAmount || 0).toLocaleString('en-IN')}\n` +
                   `*Total Amount: ₹${parseFloat(bill.totalAmount || 0).toLocaleString('en-IN')}*\n\n` +
                   `Status: ${bill.paymentStatus === 'paid' ? '✅ Paid' : bill.paymentStatus === 'pending' ? '⏳ Pending' : '⚠️ Overdue'}\n\n` +
                   `For queries, contact: ${ownerName}`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // If tenant has phone, ask if they want to send to tenant or owner
    if (tenantPhone) {
        const choice = await confirmAction({
            title: 'Send Bill via WhatsApp',
            message: `Send to ${bill.tenantName}'s phone or share manually?`,
            confirmText: `Send to ${bill.tenantName}`,
            cancelText: 'Share Manually',
            type: 'info'
        });
        if (choice) {
            // Send to tenant
            const cleanPhone = tenantPhone.replace(/\D/g, '');
            const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;
            window.open(`https://wa.me/${phoneWithCountry}?text=${encodedMessage}`, '_blank');
        } else {
            // Open WhatsApp without number
            window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        }
    } else {
        // No tenant phone, just open WhatsApp
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }
}

// Apply filters
async function applyFilters() {
    const searchTerm = document.getElementById('searchPayments').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const monthFilter = document.getElementById('filterMonth').value;
    
    let bills = await loadPayments();
    
    // Apply search filter
    if (searchTerm) {
        bills = bills.filter(bill => 
            (bill._id && bill._id.toLowerCase().includes(searchTerm)) ||
            (bill.tenantName && bill.tenantName.toLowerCase().includes(searchTerm)) ||
            (bill.roomNumber && bill.roomNumber.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
        bills = bills.filter(bill => bill.paymentStatus === statusFilter);
    }
    
    // Apply month filter
    if (monthFilter !== 'all') {
        bills = bills.filter(bill => {
            const billDate = new Date(bill.date);
            const billMonth = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            return billMonth === monthFilter;
        });
    }
    
    // Update display
    displayPayments(bills);
    
    // Update stats with all bills
    const allBills = await loadPayments();
    const stats = calculateStats(allBills);
    updateStats(stats);
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
    
    // Load and display payments
    const bills = await loadPayments();
    const stats = calculateStats(bills);
    updateStats(stats);
    displayPayments(bills);
    
    // Setup filters
    document.getElementById('searchPayments').addEventListener('input', applyFilters);
    document.getElementById('filterStatus').addEventListener('change', applyFilters);
    document.getElementById('filterMonth').addEventListener('change', applyFilters);
    
    // Populate month filter with dynamic months
    await populateMonthFilter();
});

// Populate month filter with available months from bills
async function populateMonthFilter() {
    const bills = await loadPayments();
    const monthSelect = document.getElementById('filterMonth');
    
    if (bills.length === 0) return;
    
    // Get unique months
    const months = [...new Set(bills.map(bill => {
        const billDate = new Date(bill.date);
        return `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
    }))];
    months.sort().reverse();
    
    // Keep "All Months" option and add found months
    monthSelect.innerHTML = '<option value="all">All Months</option>';
    
    months.forEach(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1);
        const monthName = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        
        const option = document.createElement('option');
        option.value = month;
        option.textContent = monthName;
        monthSelect.appendChild(option);
    });
}
