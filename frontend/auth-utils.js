// ============================================
// SECURE AUTHENTICATION UTILITIES
// ============================================
// This file contains shared authentication and user data management functions

// Session Management
const AuthSession = {
    validate() {
        const sessionData = localStorage.getItem('authSession');
        if (!sessionData) return false;
        
        try {
            const session = JSON.parse(sessionData);
            const now = Date.now();
            
            // Check if expired
            if (now > session.expiresAt) {
                this.destroy();
                return false;
            }
            
            // Update last activity
            session.lastActivity = now;
            localStorage.setItem('authSession', JSON.stringify(session));
            
            return true;
        } catch {
            return false;
        }
    },
    
    destroy() {
        // Get current user ID before destroying session
        const userId = this.getUserId();
        
        if (userId) {
            // Save user data before logout
            saveUserDataToStorage(userId);
        }
        
        // Clear session data
        localStorage.removeItem('authSession');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Clear temporary data (not user-specific)
        localStorage.removeItem('generatedBills');
        localStorage.removeItem('tenants');
    },
    
    getUserId() {
        const sessionData = localStorage.getItem('authSession');
        if (!sessionData) return null;
        
        try {
            const session = JSON.parse(sessionData);
            return session.userId;
        } catch {
            return null;
        }
    },
    
    isAuthenticated() {
        return this.validate();
    }
};

// User-specific storage keys
function getUserStorageKey(userId, key) {
    return `user_${userId}_${key}`;
}

// Save current data to user-specific storage
function saveUserDataToStorage(userId) {
    if (!userId) return;
    
    try {
        // Save bills
        const bills = localStorage.getItem('generatedBills');
        if (bills) {
            const userBillsKey = getUserStorageKey(userId, 'bills');
            localStorage.setItem(userBillsKey, bills);
        }
        
        // Save tenants
        const tenants = localStorage.getItem('tenants');
        if (tenants) {
            const userTenantsKey = getUserStorageKey(userId, 'tenants');
            localStorage.setItem(userTenantsKey, tenants);
        }
        
        // Save user profile data
        const userData = localStorage.getItem('userData');
        if (userData) {
            const userDataKey = getUserStorageKey(userId, 'data');
            localStorage.setItem(userDataKey, userData);
        }
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

// Load user-specific data
function loadUserDataFromStorage(userId) {
    if (!userId) return;
    
    try {
        const userDataKey = getUserStorageKey(userId, 'data');
        const userBillsKey = getUserStorageKey(userId, 'bills');
        const userTenantsKey = getUserStorageKey(userId, 'tenants');
        
        // Load user data
        const userData = localStorage.getItem(userDataKey);
        if (userData) {
            localStorage.setItem('userData', userData);
        }
        
        // Load user bills
        const userBills = localStorage.getItem(userBillsKey);
        if (userBills) {
            localStorage.setItem('generatedBills', userBills);
        } else {
            localStorage.setItem('generatedBills', '[]');
        }
        
        // Load user tenants
        const userTenants = localStorage.getItem(userTenantsKey);
        if (userTenants) {
            localStorage.setItem('tenants', userTenants);
        } else {
            localStorage.setItem('tenants', '[]');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Auto-save data periodically
let autoSaveInterval = null;

function startAutoSave() {
    // Save every 30 seconds
    autoSaveInterval = setInterval(() => {
        const userId = AuthSession.getUserId();
        if (userId) {
            saveUserDataToStorage(userId);
        }
    }, 30000);
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    if (!AuthSession.isAuthenticated()) {
        // Redirect to login if not authenticated (except on login/register pages)
        const currentPage = window.location.pathname.split('/').pop();
        const publicPages = ['login.html', 'register.html', 'index.html', ''];
        
        if (!publicPages.includes(currentPage)) {
            window.location.href = 'login.html';
            return;
        }
    } else {
        // Load user data
        const userId = AuthSession.getUserId();
        if (userId) {
            loadUserDataFromStorage(userId);
            startAutoSave();
        }
    }
});

// Save data before page unload
window.addEventListener('beforeunload', () => {
    const userId = AuthSession.getUserId();
    if (userId) {
        saveUserDataToStorage(userId);
    }
    stopAutoSave();
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Save when leaving page
        const userId = AuthSession.getUserId();
        if (userId) {
            saveUserDataToStorage(userId);
        }
    } else {
        // Reload when returning to page
        const userId = AuthSession.getUserId();
        if (userId) {
            loadUserDataFromStorage(userId);
        }
    }
});

// Export for use in other scripts
window.AuthSession = AuthSession;
window.saveUserDataToStorage = saveUserDataToStorage;
window.loadUserDataFromStorage = loadUserDataFromStorage;
window.getUserStorageKey = getUserStorageKey;
