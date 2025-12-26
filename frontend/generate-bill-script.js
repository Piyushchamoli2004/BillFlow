// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Generate Bill Page');
    
    // Setup navigation first so it always works
    setupNavigation();
    
    // Check if property name is set before allowing bill generation
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.propertyName || userData.propertyName.trim() === '') {
        showPropertyNameRequiredModal();
        return;
    }
    
    loadUserProfile();
    initializeBillForm();
    
    // Force load tenants after everything else
    setTimeout(() => {
        console.log('🔄 Force loading tenants after DOM ready...');
        const select = document.getElementById('tenantSelect') || document.querySelector('.form-select');
        console.log('Select element found:', !!select);
        if (select) {
            console.log('Select element ID:', select.id);
            console.log('Select element class:', select.className);
        }
        loadTenants();
    }, 200);
});

// Reload tenants when page becomes visible (in case tenants were added in another tab)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('Page visible - reloading tenants');
        loadTenants();
    }
});

// Also reload tenants when window gains focus
window.addEventListener('focus', () => {
    console.log('Window focused - reloading tenants');
    loadTenants();
});

// Emergency fallback - load after everything
window.addEventListener('load', () => {
    console.log('🔥 Window fully loaded - Final tenant load attempt');
    setTimeout(() => {
        loadTenants();
    }, 100);
});

// Listen for storage events (when tenants are added in another tab)
window.addEventListener('storage', (e) => {
    if (e.key === 'tenants') {
        console.log('Storage event detected - tenants updated!');
        loadTenants();
    }
});

// Check if user is authenticated (disabled for now)
function checkAuthentication() {
    // Authentication check disabled - always return true
    return true;
}

// Load user profile
function loadUserProfile() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            const userAvatar = document.querySelector('.user-avatar img');
            if (userAvatar && user.name) {
                const firstLetter = user.name.charAt(0).toUpperCase();
                userAvatar.src = `data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23667eea'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16' font-weight='bold'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }
}

// Make loadUserProfile globally accessible
window.loadUserProfile = loadUserProfile;

// Initialize bill form
function initializeBillForm() {
    console.log('Initializing bill form...');
    
    // Set current date
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Generate bill number
    generateBillNumber();
    
    // IMMEDIATE CHECK - Load tenants into dropdown
    console.log('About to load tenants...');
    
    // Try multiple times with increasing delays to ensure DOM is ready
    loadTenants();
    
    setTimeout(() => {
        console.log('Retry 1: Loading tenants...');
        loadTenants();
    }, 100);
    
    setTimeout(() => {
        console.log('Retry 2: Loading tenants...');
        loadTenants();
    }, 500);
    
    setTimeout(() => {
        console.log('Retry 3: Final attempt loading tenants...');
        loadTenants();
    }, 1000);
    
    // Setup calculation inputs
    setupCalculations();
    
    // Setup form submission
    setupFormSubmission();
    
    // Setup additional charges
    setupAdditionalCharges();
}

// Generate unique bill number
function generateBillNumber() {
    const billNumberInput = document.querySelector('input[readonly][placeholder="Auto-generated"]');
    if (billNumberInput) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        billNumberInput.value = `BILL-${year}${month}-${random}`;
    }
}

// Load tenants from API into dropdown
async function loadTenants() {
    console.log('\n🔄 === LOADING TENANTS ===');
    console.log('⏰ Time:', new Date().toISOString());
    
    // Try multiple ways to find the select element
    const tenantSelect = document.getElementById('tenantSelect')
        || document.querySelector('#tenantSelect')
        || document.querySelector('.form-select')
        || document.querySelector('select.form-select')
        || document.querySelector('.form-group select');

    if (!tenantSelect) {
        console.error('❌ DROPDOWN NOT FOUND!');
        const allSelects = document.querySelectorAll('select');
        console.log('📋 All select elements on page:', allSelects.length);
        allSelects.forEach((sel, i) => {
            console.log(`   Select ${i+1}: ID="${sel.id}" Class="${sel.className}"`);
        });
        showError('Error: Tenant dropdown not found on page!');
        return;
    }
    
    console.log('✅ Dropdown found! ID:', tenantSelect.id, 'Class:', tenantSelect.className);
    
    // Load tenants from API
    console.log('\n🔄 === LOADING TENANTS FROM API ===');

    try {
        const result = await window.api.getTenants();
        const tenants = Array.isArray(result.data.tenants) ? result.data.tenants : [];
        
        // Clear existing options
        tenantSelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a tenant...';
        tenantSelect.appendChild(defaultOption);
        
        // Add tenant options
        tenants.forEach(tenant => {
            const option = document.createElement('option');
            // Store full tenant data as JSON string
            option.value = JSON.stringify({
                _id: tenant._id,
                name: tenant.name,
                room: tenant.roomNumber,
                email: tenant.email
            });
            option.textContent = `${tenant.name} (Room ${tenant.roomNumber})`;
            tenantSelect.appendChild(option);
        });
        
        console.log('✅ Tenants loaded from API:', tenants.length);
        
        if (tenants.length === 0) {
            showError('No tenants found. Please add tenants first.');
        } else {
            // Visual feedback with animation
            tenantSelect.style.borderColor = '#10b981';
            tenantSelect.style.borderWidth = '2px';
            tenantSelect.style.backgroundColor = '#f0fdf4';
            tenantSelect.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                tenantSelect.style.borderColor = '';
                tenantSelect.style.borderWidth = '';
                tenantSelect.style.backgroundColor = '';
            }, 2000);
            console.log('✅✅✅ SUCCESS! Loaded', tenants.length, 'tenants into dropdown!');
        }
    } catch (error) {
        console.error('❌ Error loading tenants from API:', error);
        showError('Error loading tenants. Please refresh the page.');
        tenantSelect.style.borderColor = '#ef4444';
        tenantSelect.style.borderWidth = '2px';
        tenantSelect.style.backgroundColor = '#fee2e2';
    }
    
    console.log('\n=== END OF loadTenants() ===\n');
}

// Make loadTenants globally accessible
window.loadTenants = loadTenants;

// Global debug function - call this from console
window.debugTenants = function() {
    console.log('=== DEBUG TENANTS ===');
    console.log('1. Checking localStorage...');
    const raw = localStorage.getItem('tenants');
    console.log('Raw data:', raw);
    
    const tenants = JSON.parse(raw) || [];
    console.log('Parsed tenants:', tenants);
    console.log('Count:', tenants.length);
    
    console.log('\n2. Checking dropdown...');
    const select = document.getElementById('tenantSelect') || document.querySelector('.form-select');
    console.log('Select element:', select);
    console.log('Current options:', select ? select.options.length : 'N/A');
    
    console.log('\n3. Attempting to load...');
    if (typeof loadTenants === 'function') {
        loadTenants();
    } else {
        console.error('loadTenants function not available!');
    }
};

// Setup automatic calculations
function setupCalculations() {
    // Get all form sections
    const sections = document.querySelectorAll('.form-section');
    
    // Find electricity section (has "Electricity" in title)
    let electricitySection = null;
    let waterSection = null;
    
    sections.forEach(section => {
        const title = section.querySelector('.section-title');
        if (title && title.textContent.includes('Electricity')) {
            electricitySection = section;
        }
        if (title && title.textContent.includes('Water')) {
            waterSection = section;
        }
    });
    
    // Get electricity inputs
    const electricityInputs = {
        current: electricitySection ? electricitySection.querySelectorAll('.calc-input')[0] : null,
        previous: electricitySection ? electricitySection.querySelectorAll('.calc-input')[1] : null,
        rate: electricitySection ? electricitySection.querySelectorAll('.calc-input')[2] : null,
        result: electricitySection ? electricitySection.querySelector('.result-value') : null
    };
    
    // Get water inputs
    const waterInputs = {
        current: waterSection ? waterSection.querySelectorAll('.calc-input')[0] : null,
        previous: waterSection ? waterSection.querySelectorAll('.calc-input')[1] : null,
        rate: waterSection ? waterSection.querySelectorAll('.calc-input')[2] : null,
        result: waterSection ? waterSection.querySelector('.result-value') : null
    };
    
    const baseAmountInput = document.querySelector('input[placeholder="Enter base amount (e.g., 5000)"]');
    
    console.log('Electricity inputs:', electricityInputs);
    console.log('Water inputs:', waterInputs);
    
    // Add event listeners for electricity
    if (electricityInputs.current && electricityInputs.previous && electricityInputs.rate) {
        [electricityInputs.current, electricityInputs.previous, electricityInputs.rate].forEach(input => {
            input.addEventListener('input', () => {
                calculateElectricity(electricityInputs);
                updateTotals();
            });
        });
    }
    
    // Add event listeners for water
    if (waterInputs.current && waterInputs.previous && waterInputs.rate) {
        [waterInputs.current, waterInputs.previous, waterInputs.rate].forEach(input => {
            input.addEventListener('input', () => {
                calculateWater(waterInputs);
                updateTotals();
            });
        });
    }
    
    // Add event listener for base amount
    if (baseAmountInput) {
        baseAmountInput.addEventListener('input', () => {
            updateTotals();
        });
    }
    
    // Initialize calculations with existing values
    calculateElectricity(electricityInputs);
    calculateWater(waterInputs);
    updateTotals();
}

// Calculate electricity amount
function calculateElectricity(inputs) {
    const current = parseFloat(inputs.current.value) || 0;
    const previous = parseFloat(inputs.previous.value) || 0;
    const rate = parseFloat(inputs.rate.value) || 0;
    
    const units = Math.max(0, current - previous);
    const amount = units * rate;
    
    if (inputs.result) {
        inputs.result.textContent = amount.toFixed(2);
    }
    
    return amount;
}

// Calculate water amount
function calculateWater(inputs) {
    const current = parseFloat(inputs.current.value) || 0;
    const previous = parseFloat(inputs.previous.value) || 0;
    const rate = parseFloat(inputs.rate.value) || 0;
    
    const units = Math.max(0, current - previous);
    const amount = units * rate;
    
    if (inputs.result) {
        inputs.result.textContent = amount.toFixed(2);
    }
    
    return amount;
}

// Update total summary
function updateTotals() {
    // Get base amount
    const baseAmountInput = document.querySelector('input[placeholder="Enter base amount (e.g., 5000)"]');
    const baseAmount = parseFloat(baseAmountInput?.value) || 0;
    
    // Get electricity amount - find section with "Electricity" title
    let electricityAmount = 0;
    let waterAmount = 0;
    
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => {
        const title = section.querySelector('.section-title');
        if (title) {
            if (title.textContent.includes('Electricity')) {
                const result = section.querySelector('.result-value');
                electricityAmount = parseFloat(result?.textContent) || 0;
            }
            if (title.textContent.includes('Water')) {
                const result = section.querySelector('.result-value');
                waterAmount = parseFloat(result?.textContent) || 0;
            }
        }
    });
    
    // Get additional charges
    const additionalCharges = calculateAdditionalCharges();
    
    // Calculate subtotal
    const subtotal = baseAmount + electricityAmount + waterAmount + additionalCharges;
    
    // Calculate tax (can be made dynamic)
    const taxRate = 0; // 0%
    const taxAmount = subtotal * (taxRate / 100);
    
    // Calculate total
    const total = subtotal + taxAmount;
    
    console.log('=== Total Calculation ===');
    console.log('Base:', baseAmount);
    console.log('Electricity:', electricityAmount);
    console.log('Water:', waterAmount);
    console.log('Additional:', additionalCharges);
    console.log('Subtotal:', subtotal);
    console.log('Total:', total);
    
    // Update summary display
    const summaryRows = document.querySelectorAll('.summary-row');
    summaryRows.forEach((row, index) => {
        const valueElement = row.querySelector('.summary-value');
        if (index === 0 && valueElement) {
            valueElement.textContent = `₹${subtotal.toFixed(2)}`;
        } else if (index === 1 && valueElement) {
            valueElement.textContent = `₹${taxAmount.toFixed(2)}`;
        }
    });
    
    const totalElement = document.querySelector('.summary-total .summary-value');
    if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;
}

// Calculate additional charges
function calculateAdditionalCharges() {
    const chargeInputs = document.querySelectorAll('.charge-input');
    let total = 0;
    
    chargeInputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        total += value;
    });
    
    return total;
}

// Setup additional charges functionality
function setupAdditionalCharges() {
    const addButton = document.querySelector('.btn-add-more');
    
    if (addButton) {
        addButton.addEventListener('click', () => {
            addNewChargeField();
        });
    }
    
    // Add event listeners to existing charge inputs
    const chargeInputs = document.querySelectorAll('.charge-input');
    chargeInputs.forEach(input => {
        input.addEventListener('input', updateTotals);
    });
}

// Add new charge field
function addNewChargeField() {
    const additionalSection = document.querySelector('.form-section:nth-of-type(4) .charges-grid');
    
    if (!additionalSection) return;
    
    const chargeCount = additionalSection.querySelectorAll('.charge-item').length + 1;
    
    const newChargeItem = document.createElement('div');
    newChargeItem.className = 'charge-item';
    newChargeItem.innerHTML = `
        <div class="charge-group">
            <label class="charge-label">
                <input type="text" class="charge-name-input" placeholder="Charge name" value="Custom Charge ${chargeCount}">
            </label>
            <div class="input-with-unit">
                <span class="input-currency">₹</span>
                <input type="number" class="charge-input" placeholder="0.00" step="0.01">
            </div>
        </div>
        <button type="button" class="btn-remove-charge" onclick="removeCharge(this)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </button>
    `;
    
    additionalSection.appendChild(newChargeItem);
    
    // Add event listener to new charge input
    const newInput = newChargeItem.querySelector('.charge-input');
    newInput.addEventListener('input', updateTotals);
    
    // Add some CSS for the remove button
    addRemoveButtonStyles();
}

// Remove charge field
function removeCharge(button) {
    const chargeItem = button.closest('.charge-item');
    if (chargeItem) {
        chargeItem.remove();
        updateTotals();
    }
}

// Make removeCharge globally available
window.removeCharge = removeCharge;

// Add styles for remove button
function addRemoveButtonStyles() {
    if (!document.getElementById('dynamic-charge-styles')) {
        const style = document.createElement('style');
        style.id = 'dynamic-charge-styles';
        style.textContent = `
            .charge-item {
                display: flex;
                gap: 12px;
                align-items: flex-end;
            }
            
            .charge-group {
                flex: 1;
            }
            
            .charge-name-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .btn-remove-charge {
                padding: 10px;
                background: #fee;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                color: #e53e3e;
                transition: all 0.2s;
            }
            
            .btn-remove-charge:hover {
                background: #feb2b2;
            }
        `;
        document.head.appendChild(style);
    }
}

// Setup form submission
function setupFormSubmission() {
    const form = document.querySelector('.bill-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await generateBill();
        });
    }
    
    // Cancel button
    const cancelBtn = document.querySelector('.btn-secondary');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', async () => {
            const confirmed = await confirmAction({
                title: 'Cancel Bill Generation?',
                message: 'All changes will be lost. This action cannot be undone.',
                confirmText: 'Yes, Cancel',
                cancelText: 'Continue Editing',
                type: 'warning'
            });
            if (confirmed) {
                window.location.href = 'admin-dashboard.html';
            }
        });
    }
    
    // Save as draft button
    const draftBtn = document.querySelector('.btn-outline');
    if (draftBtn) {
        draftBtn.addEventListener('click', () => {
            saveDraft();
        });
    }
}

// Generate bill
async function generateBill() {
    // Check if property name is set
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.propertyName || userData.propertyName.trim() === '') {
        showPropertyNameRequiredModal();
        return;
    }
    
    // Validate form
    const tenantValue = document.querySelector('.form-select').value;
    const billDate = document.querySelector('input[type="date"]').value;
    const billNumber = document.querySelector('input[readonly]').value;
    const baseAmount = parseFloat(document.querySelector('input[placeholder="Enter base amount (e.g., 5000)"]').value) || 0;
    
    if (!tenantValue) {
        showWarning('Please select a tenant to continue');
        return;
    }
    
    // Parse tenant data
    let tenantData;
    try {
        tenantData = JSON.parse(tenantValue);
        console.log('Parsed tenant data:', tenantData);
    } catch (e) {
        console.error('Error parsing tenant data:', e);
        tenantData = { name: 'Unknown', room: 'N/A' };
    }
    
    if (baseAmount <= 0) {
        showWarning('Please enter a valid base amount');
        return;
    }
    
    // Find electricity and water sections
    const sections = document.querySelectorAll('.form-section');
    let electricitySection = null;
    let waterSection = null;
    
    sections.forEach(section => {
        const title = section.querySelector('.section-title');
        if (title) {
            if (title.textContent.includes('Electricity')) {
                electricitySection = section;
            }
            if (title.textContent.includes('Water')) {
                waterSection = section;
            }
        }
    });
    
    // Collect all bill data
    const additionalChargesArray = collectAdditionalCharges();
    const additionalChargesTotal = additionalChargesArray.reduce((sum, charge) => sum + charge.amount, 0);
    
    const electricityAmount = electricitySection ? parseFloat(electricitySection.querySelector('.result-value')?.textContent) || 0 : 0;
    const waterAmount = waterSection ? parseFloat(waterSection.querySelector('.result-value')?.textContent) || 0 : 0;
    
    const total = baseAmount + electricityAmount + waterAmount + additionalChargesTotal;
    
    // Parse bill date to get month and year
    const billDateObj = new Date(billDate);
    const billMonth = billDateObj.toLocaleString('default', { month: 'long' });
    const billYear = billDateObj.getFullYear();
    
    // Calculate due date (15 days from bill date)
    const dueDateObj = new Date(billDateObj);
    dueDateObj.setDate(dueDateObj.getDate() + 15);
    
    const billData = {
        billNumber,
        tenant: tenantData.name,  // For PDF generation
        tenantName: tenantData.name,  // For backend
        tenantId: tenantData._id || tenantData.id,  // For backend
        tenantPhone: tenantData.phone || '',  // For WhatsApp
        roomNumber: typeof tenantData.room === 'string' ? tenantData.room.replace('Room ', '').trim() : tenantData.room,
        billDate: billDate,  // For PDF
        date: billDate,  // For backend
        dueDate: dueDateObj.toISOString(),  // For backend
        billMonth: billMonth,  // For backend
        billYear: billYear,  // For backend
        baseAmount,
        rentAmount: baseAmount,  // For backend
        electricityAmount,
        electricityBill: electricityAmount,  // For backend
        waterAmount,
        waterBill: waterAmount,  // For backend
        maintenanceFee: 0,  // For backend
        otherCharges: additionalChargesTotal,  // For backend
        discount: 0,  // For backend
        electricity: {
            currentReading: electricitySection ? parseFloat(electricitySection.querySelectorAll('.calc-input')[0]?.value) || 0 : 0,
            previousReading: electricitySection ? parseFloat(electricitySection.querySelectorAll('.calc-input')[1]?.value) || 0 : 0,
            rate: electricitySection ? parseFloat(electricitySection.querySelectorAll('.calc-input')[2]?.value) || 0 : 0,
            amount: electricityAmount
        },
        water: {
            currentReading: waterSection ? parseFloat(waterSection.querySelectorAll('.calc-input')[0]?.value) || 0 : 0,
            previousReading: waterSection ? parseFloat(waterSection.querySelectorAll('.calc-input')[1]?.value) || 0 : 0,
            rate: waterSection ? parseFloat(waterSection.querySelectorAll('.calc-input')[2]?.value) || 0 : 0,
            amount: waterAmount
        },
        rent: baseAmount,  // For WhatsApp message
        additionalCharges: additionalChargesArray,  // Array for PDF
        additionalChargesTotal,  // Total for summary
        total,
        totalAmount: total,
        paymentStatus: 'pending'
    };
    
    // Show loading state
    const submitBtn = document.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<svg class="spinner" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-dashoffset="25" opacity="0.5"/></svg> Generating...';
    submitBtn.disabled = true;
    
    // Save to API backend
    try {
        // Add timestamp and status
        billData.createdAt = new Date().toISOString();
        billData.status = 'generated';
        
        // Save bill to backend API
        const result = await window.api.createBill(billData);
        
        if (result.status === 'success') {
            // Show success message
            setTimeout(async () => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                showSuccess(`Bill ${billNumber} generated successfully! Total: ₹${billData.total.toFixed(2)}`);
                
                // Ask if user wants to download or view
                const wantsPDF = await confirmAction({
                    title: 'Download PDF?',
                    message: `Bill for ${billData.tenant} is ready. Would you like to download it as PDF?`,
                    confirmText: 'Download PDF',
                    cancelText: 'Skip',
                    type: 'info'
                });
                console.log('User wants PDF:', wantsPDF);
                
                if (wantsPDF) {
                    // Show loading message
                    submitBtn.innerHTML = `
                        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" stroke-width="4" stroke-dasharray="32" stroke-dashoffset="32">
                                <animate attributeName="stroke-dashoffset" dur="1s" from="32" to="0" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                        Generating PDF...
                    `;
                    submitBtn.disabled = true;
                    
                    console.log('🚀 Calling downloadBillPDF...');
                    
                    downloadBillPDF(billData)
                        .then(() => {
                            console.log('✅ PDF generation completed');
                            submitBtn.innerHTML = originalText;
                            submitBtn.disabled = false;
                            showSuccess('PDF downloaded successfully!');
                            
                            // Show WhatsApp option after PDF download
                            setTimeout(async () => {
                                const sendWhatsApp = await confirmAction({
                                    title: '📲 Send via WhatsApp?',
                                    message: `Would you like to send the bill details to ${billData.tenant} via WhatsApp?`,
                                    confirmText: 'Send WhatsApp',
                                    cancelText: 'Skip',
                                    type: 'info'
                                });
                                
                                if (sendWhatsApp) {
                                    sendBillViaWhatsApp(billData);
                                } else {
                                    window.location.href = 'admin-dashboard.html';
                                }
                            }, 500);
                        })
                        .catch(error => {
                            console.error('❌ PDF generation failed:', error);
                            showError(`PDF generation failed: ${error.message}. Check console for details.`);
                            submitBtn.innerHTML = originalText;
                            submitBtn.disabled = false;
                        });
                } else {
                    console.log('User declined PDF, redirecting to dashboard');
                    window.location.href = 'admin-dashboard.html';
                }
            }, 1000);
        } else {
            throw new Error(result.message || 'Failed to generate bill');
        }
        
    } catch (error) {
        console.error('Error generating bill:', error);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showError(error.message || 'Error generating bill. Please try again.');
    }
}

// Collect additional charges
function collectAdditionalCharges() {
    const charges = [];
    const chargeItems = document.querySelectorAll('.charge-item');
    
    chargeItems.forEach(item => {
        const nameInput = item.querySelector('.charge-name-input') || item.querySelector('.charge-label');
        const amountInput = item.querySelector('.charge-input');
        
        let name = 'Additional Charge';
        if (nameInput) {
            name = nameInput.value || nameInput.textContent.trim();
        }
        
        const amount = parseFloat(amountInput?.value) || 0;
        
        if (amount > 0) {
            charges.push({ name, amount });
        }
    });
    
    return charges;
}

// Save as draft
function saveDraft() {
    const billData = {
        tenantName: tenantData.name,
        roomNumber: tenantData.room.replace('Room ', ''),
        billDate: document.querySelector('input[type="date"]').value,
        baseAmount: document.querySelector('input[placeholder="Enter base amount (e.g., 5000)"]').value,
        status: 'draft',
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('billDraft', JSON.stringify(billData));
    showSuccess('Bill saved as draft successfully!');
}

// Send bill via WhatsApp
function sendBillViaWhatsApp(billData) {
    try {
        // Extract phone number from tenantPhone or tenant object
        let phoneNumber = '';
        
        // Try different possible locations for phone number
        if (billData.tenantPhone) {
            phoneNumber = billData.tenantPhone;
        } else if (billData.phone) {
            phoneNumber = billData.phone;
        } else {
            // Get from tenant select if still available
            const tenantSelect = document.getElementById('tenantSelect');
            if (tenantSelect && tenantSelect.value) {
                try {
                    const selectedTenant = JSON.parse(tenantSelect.value);
                    phoneNumber = selectedTenant.phone || '';
                } catch (e) {
                    console.error('Error parsing tenant:', e);
                }
            }
        }
        
        // Remove any non-numeric characters
        const phone = phoneNumber.toString().replace(/[^0-9]/g, '');
        
        // Validate phone number
        if (!phone || phone.length !== 10) {
            showError('Invalid phone number for WhatsApp. Please ensure tenant has a valid 10-digit phone number.');
            return;
        }
        
        // Prepare message text
        const message = `Hello ${billData.tenant},

Your rent bill is ready.
Bill Number: ${billData.billNumber}
Date: ${new Date(billData.billDate || billData.date).toLocaleDateString()}

Rent Amount: ₹${(billData.rent || billData.rentAmount || 0).toFixed(2)}
Electricity: ₹${(billData.electricityAmount || billData.electricity?.amount || 0).toFixed(2)}
Water: ₹${(billData.waterAmount || billData.water?.amount || 0).toFixed(2)}
Other Charges: ₹${(billData.additionalChargesTotal || billData.otherCharges || 0).toFixed(2)}

Total Amount: ₹${billData.total.toFixed(2)}

Please make the payment at your earliest convenience.

Thank you!`;
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Create WhatsApp deep link (with +91 country code for India)
        const whatsappUrl = `https://wa.me/91${phone}?text=${encodedMessage}`;
        
        // Open WhatsApp in new window
        window.open(whatsappUrl, '_blank');
        
        showSuccess('Opening WhatsApp...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        showError('Failed to open WhatsApp');
    }
}

// Download bill as PDF - Modern Design
async function downloadBillPDF(billData) {
    console.log('📄 Starting PDF generation...');
    console.log('Bill Data:', billData);
    
    try {
        // Load jsPDF dynamically if not loaded
        if (!window.jspdf) {
            console.log('⏳ Loading jsPDF library...');
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            
            await new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log('✅ jsPDF loaded successfully');
                    resolve();
                };
                script.onerror = () => {
                    console.error('❌ Failed to load jsPDF');
                    reject(new Error('Failed to load jsPDF library'));
                };
                document.head.appendChild(script);
            });
            
            // Wait a bit for jsPDF to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!window.jspdf) {
            throw new Error('jsPDF library not available');
        }
        
        console.log('📝 Creating PDF document...');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Modern Color Palette
        const primary = [102, 126, 234]; // #667eea
        const secondary = [118, 75, 162]; // #764ba2
        const dark = [30, 41, 59]; // #1e293b
        const gray = [100, 116, 139]; // #64748b
        const light = [248, 250, 252]; // #f8fafc
        const success = [34, 197, 94]; // #22c55e
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;
        
        // Header Section with Gradient Effect (simulated)
        doc.setFillColor(...primary);
        doc.rect(0, 0, pageWidth, 50, 'F');
        
        // Company Logo (Circle with Letter)
        doc.setFillColor(255, 255, 255);
        doc.circle(20, 25, 8, 'F');
        doc.setTextColor(...primary);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('B', 20, 28, { align: 'center' });
        
        // Company Name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('BillFlow', 35, 28);
        
        // Property Name (if available)
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const propertyName = userData.propertyName || '';
        const propertyAddress = userData.propertyAddress || '';
        const ownerPhone = userData.phone || '';
        
        if (propertyName) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(propertyName, 35, 36);
            
            if (propertyAddress) {
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(propertyAddress, 35, 41);
            } else {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('Tenant Billing Management System', 35, 41);
            }
        } else {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Tenant Billing Management System', 35, 36);
        }
        
        // Bill Status Badge - Dynamic based on payment status
        const isPaid = billData.paymentStatus === 'paid';
        const statusColor = isPaid ? success : [239, 68, 68]; // Red for unpaid
        const statusText = isPaid ? 'PAID' : 'UNPAID';
        const badgeWidth = isPaid ? 35 : 45;
        
        // Contact Information (right side of header, below badge)
        if (ownerPhone) {
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text('Contact:', pageWidth - 55, 38);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(ownerPhone, pageWidth - 55, 44);
        }
        
        doc.setFillColor(...statusColor);
        doc.roundedRect(pageWidth - badgeWidth - 10, 18, badgeWidth, 12, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const statusTextWidth = doc.getTextWidth(statusText);
        doc.text(statusText, pageWidth - (badgeWidth / 2) - 10 - (statusTextWidth / 2), 25.5);
        
        yPos = 60;
        
        // Bill Information Card
        doc.setDrawColor(230, 230, 250);
        doc.setFillColor(...light);
        doc.roundedRect(15, yPos, pageWidth - 30, 40, 5, 5, 'FD');
        
        // Left Column
        doc.setTextColor(...gray);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('BILL NUMBER', 20, yPos + 8);
        doc.setTextColor(...dark);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(billData.billNumber, 20, yPos + 15);
        
        doc.setTextColor(...gray);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('BILL DATE', 20, yPos + 25);
        doc.setTextColor(...dark);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(billData.billDate, 20, yPos + 32);
        
        // Right Column
        doc.setTextColor(...gray);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('TENANT NAME', pageWidth - 80, yPos + 8);
        doc.setTextColor(...dark);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(billData.tenant, pageWidth - 80, yPos + 15);
        
        doc.setTextColor(...gray);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('DUE DATE', pageWidth - 80, yPos + 25);
        doc.setTextColor(...dark);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const dueDate = new Date(billData.billDate);
        dueDate.setDate(dueDate.getDate() + 15);
        doc.text(dueDate.toISOString().split('T')[0], pageWidth - 80, yPos + 32);
        
        yPos += 50;
        
        // Charges Section Header
        doc.setFillColor(...primary);
        doc.rect(15, yPos, pageWidth - 30, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('BILLING DETAILS', 20, yPos + 7);
        
        yPos += 15;
        
        // Table Header
        doc.setFillColor(245, 247, 250);
        doc.rect(15, yPos, pageWidth - 30, 10, 'F');
        doc.setTextColor(...gray);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('DESCRIPTION', 20, yPos + 7);
        doc.text('DETAILS', pageWidth / 2, yPos + 7);
        const amountHeaderWidth = doc.getTextWidth('AMOUNT');
        doc.text('AMOUNT', pageWidth - 20 - amountHeaderWidth, yPos + 7);
        
        yPos += 15;
        
        // Base Amount
        doc.setTextColor(...dark);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Base Rent', 20, yPos);
        doc.text('Monthly rent', pageWidth / 2, yPos);
        doc.setFont('helvetica', 'bold');
        const baseAmountText = `Rs ${billData.baseAmount.toFixed(2)}`;
        const baseAmountWidth = doc.getTextWidth(baseAmountText);
        doc.text(baseAmountText, pageWidth - 20 - baseAmountWidth, yPos);
        
        yPos += 10;
        
        // Electricity
        doc.setFont('helvetica', 'normal');
        doc.text('Electricity Charges', 20, yPos);
        doc.setFontSize(9);
        doc.setTextColor(...gray);
        const elecUnits = billData.electricity.currentReading - billData.electricity.previousReading;
        doc.text(`Current: ${billData.electricity.currentReading}, Previous: ${billData.electricity.previousReading}`, pageWidth / 2, yPos);
        yPos += 5;
        doc.text(`${elecUnits} units x Rs ${billData.electricity.rate}/unit`, pageWidth / 2, yPos);
        yPos -= 5;
        doc.setTextColor(...dark);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const elecAmountText = `Rs ${billData.electricity.amount.toFixed(2)}`;
        const elecAmountWidth = doc.getTextWidth(elecAmountText);
        doc.text(elecAmountText, pageWidth - 20 - elecAmountWidth, yPos);
        yPos += 5;
        
        yPos += 10;
        
        // Water
        doc.setFont('helvetica', 'normal');
        doc.text('Water Charges', 20, yPos);
        doc.setFontSize(9);
        doc.setTextColor(...gray);
        const waterUnits = billData.water.currentReading - billData.water.previousReading;
        doc.text(`Current: ${billData.water.currentReading}, Previous: ${billData.water.previousReading}`, pageWidth / 2, yPos);
        yPos += 5;
        doc.text(`${waterUnits} units x Rs ${billData.water.rate}/unit`, pageWidth / 2, yPos);
        yPos -= 5;
        doc.setTextColor(...dark);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const waterAmountText = `Rs ${billData.water.amount.toFixed(2)}`;
        const waterAmountWidth = doc.getTextWidth(waterAmountText);
        doc.text(waterAmountText, pageWidth - 20 - waterAmountWidth, yPos);
        yPos += 5;
        
        yPos += 10;
        
        // Additional Charges
        billData.additionalCharges.forEach(charge => {
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFont('helvetica', 'normal');
            doc.text(charge.name, 20, yPos);
            doc.text(charge.description || '-', pageWidth / 2, yPos);
            doc.setFont('helvetica', 'bold');
            const chargeAmountText = `Rs ${charge.amount.toFixed(2)}`;
            const chargeAmountWidth = doc.getTextWidth(chargeAmountText);
            doc.text(chargeAmountText, pageWidth - 20 - chargeAmountWidth, yPos);
            yPos += 10;
        });
        
        yPos += 15;
        
        // Divider Line
        doc.setDrawColor(...primary);
        doc.setLineWidth(0.8);
        doc.line(15, yPos, pageWidth - 15, yPos);
        
        yPos += 20;
        
        // Total Section with Modern Card Design
        doc.setFillColor(102, 126, 234);
        doc.roundedRect(15, yPos - 8, pageWidth - 30, 28, 5, 5, 'F');
        
        // Total Amount Label
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL AMOUNT DUE', 25, yPos + 2);
        
        // Total Amount Value
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        const totalText = `Rs ${billData.total.toFixed(2)}`;
        const totalWidth = doc.getTextWidth(totalText);
        doc.text(totalText, pageWidth - 25 - totalWidth, yPos + 2);
        
        // Due Date Info
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const paymentDueDate = new Date(billData.billDate);
        paymentDueDate.setDate(paymentDueDate.getDate() + 15);
        const dueDateText = `Due by: ${paymentDueDate.toISOString().split('T')[0]}`;
        doc.text(dueDateText, 25, yPos + 12);
        
        yPos += 35;
        
        // Footer Section - Dynamic positioning
        // Check if we need a new page for footer
        const footerHeight = 45; // Estimated footer height
        if (yPos > pageHeight - footerHeight - 10) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setDrawColor(230, 230, 250);
        doc.line(15, yPos, pageWidth - 15, yPos);
        
        yPos += 10;
        
        // Payment Instructions
        doc.setTextColor(...gray);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT INSTRUCTIONS', 20, yPos);
        
        yPos += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const instructions = [
            '• Please make payment within 15 days of bill date',
            '• Late payments may incur additional charges',
            ownerPhone ? `• For queries, contact property owner: ${ownerPhone}` : '• For any queries, please contact your property owner'
        ];
        
        instructions.forEach(instruction => {
            doc.text(instruction, 20, yPos);
            yPos += 5;
        });
        
        yPos += 8; // Add space after instructions
        
        // Footer with divider line
        doc.setDrawColor(...primary);
        doc.setLineWidth(1);
        doc.line(15, yPos, pageWidth - 15, yPos);
        
        yPos += 6;
        
        doc.setTextColor(...gray);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Generated by BillFlow Tenant Billing System', pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 4;
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
        
        // Save the PDF
        const filename = `${billData.billNumber}_${billData.tenant.replace(/\s+/g, '_')}.pdf`;
        console.log('💾 Saving PDF as:', filename);
        doc.save(filename);
        
        console.log('✅ PDF generated and downloaded successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ PDF generation error:', error);
        console.error('Error stack:', error.stack);
        showError(`Failed to generate PDF: ${error.message}. Please check the console for details.`);
        throw error;
    }
}

// Setup navigation
function setupNavigation() {
    // Handle logout link only
    const logoutLink = document.querySelector('.nav-item[href="login.html"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
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
        });
    }
    
    // Breadcrumb link
    const breadcrumbLink = document.querySelector('.breadcrumb-link');
    if (breadcrumbLink) {
        breadcrumbLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'admin-dashboard.html';
        });
    }
}

// Add spinner animation
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .spinner {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(spinnerStyle);

// Helper function to load external scripts dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Show property name required modal
function showPropertyNameRequiredModal() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        backdrop-filter: blur(4px);
        pointer-events: auto;
    `;
    
    // Allow clicks on sidebar but block clicks on overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            e.stopPropagation();
        }
    });
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    modal.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                    <path d="M2 17L12 22L22 17"/>
                    <path d="M2 12L12 17L22 12"/>
                </svg>
            </div>
            <h2 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Property Name Required</h2>
            <p style="margin: 0 0 24px 0; color: #666; font-size: 15px; line-height: 1.6;">
                Please complete your profile with a property name before generating bills. This ensures all bills are properly identified with your property information.
            </p>
            <button onclick="window.location.href='settings.html'" style="
                width: 100%;
                padding: 12px 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 12px;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(102, 126, 234, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                Go to Profile Settings
            </button>
            <button onclick="window.location.href='admin-dashboard.html'" style="
                width: 100%;
                padding: 12px 24px;
                background: #f3f4f6;
                color: #666;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseover="this.style.background='#e5e7eb';" onmouseout="this.style.background='#f3f4f6';">
                Back to Dashboard
            </button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Disable form if it exists
    const form = document.querySelector('.bill-form');
    if (form) {
        form.style.pointerEvents = 'none';
        form.style.opacity = '0.5';
    }
}
