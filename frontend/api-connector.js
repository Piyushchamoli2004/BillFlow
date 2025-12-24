// API Configuration
// Automatically detect API URL based on environment
const API_BASE_URL = (() => {
    // If running on production domain, use production API
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Use same domain with /api path for production
        return `${window.location.protocol}//${window.location.hostname}/api`;
    }
    // For local development, use localhost:3000
    return 'http://localhost:3000/api';
})();

console.log('🌐 API Base URL:', API_BASE_URL);

// API Helper Class
class API {
    constructor() {
        // Always reload token from localStorage on initialization
        this.token = localStorage.getItem('authToken');
        console.log('API initialized, token:', this.token ? 'present' : 'missing');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
        console.log('Token saved to localStorage');
    }

    // Clear authentication token
    clearToken() {
        console.trace('clearToken called - stack trace:');
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Get headers with authentication
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // Generic API call method
    async call(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: this.getHeaders()
            };

            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            // Check if response is ok before parsing
            if (!response.ok) {
                let errorMessage = 'API request failed';
                try {
                    const result = await response.json();
                    errorMessage = result.message || errorMessage;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Error:', error);
            // Check if it's a network error
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                console.error('❌ Cannot connect to backend. Make sure the server is running on', API_BASE_URL);
                throw new Error('Cannot connect to server. Please ensure the backend is running.');
            }
            throw error;
        }
    }

    // Authentication APIs
    async register(email, password, name, phone = '', organization = '') {
        const result = await this.call('/auth/register', 'POST', {
            email,
            password,
            name,
            phone,
            organization
        });
        if (result.data && result.data.token) {
            this.setToken(result.data.token);
        }
        return result;
    }

    async login(email, password, rememberMe = false) {
        const result = await this.call('/auth/login', 'POST', {
            email,
            password,
            rememberMe
        });
        if (result.data && result.data.token) {
            this.setToken(result.data.token);
        }
        return result;
    }

    async logout() {
        console.log('logout() called');
        this.clearToken();
        // Clear all user data
        localStorage.clear();
    }

    async forgotPassword(email) {
        return await this.call('/auth/forgot-password', 'POST', { email });
    }

    async resetPassword(email, resetCode, newPassword) {
        return await this.call('/auth/reset-password', 'POST', {
            email,
            resetCode,
            newPassword
        });
    }

    async verifyToken() {
        if (!this.token) return null;
        try {
            const result = await this.call('/auth/verify-token', 'POST', {
                token: this.token
            });
            return result.data;
        } catch (error) {
            this.clearToken();
            return null;
        }
    }

    // User Profile APIs
    async getProfile() {
        return await this.call('/user/profile', 'GET');
    }

    async updateProfile(name, phone, organization) {
        return await this.call('/user/profile', 'PUT', {
            name,
            phone,
            organization
        });
    }

    // Tenant APIs
    async getTenants(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/tenants?${queryParams}` : '/tenants';
        return await this.call(endpoint, 'GET');
    }

    async getTenant(tenantId) {
        return await this.call(`/tenants/${tenantId}`, 'GET');
    }

    async createTenant(tenantData) {
        return await this.call('/tenants', 'POST', tenantData);
    }

    async updateTenant(tenantId, tenantData) {
        return await this.call(`/tenants/${tenantId}`, 'PUT', tenantData);
    }

    async deleteTenant(tenantId) {
        return await this.call(`/tenants/${tenantId}`, 'DELETE');
    }

    async getTenantStats() {
        return await this.call('/tenants/stats', 'GET');
    }

    // Bill APIs
    async getBills(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/bills?${queryParams}` : '/bills';
        return await this.call(endpoint, 'GET');
    }

    async getBill(billId) {
        return await this.call(`/bills/${billId}`, 'GET');
    }

    async createBill(billData) {
        return await this.call('/bills', 'POST', billData);
    }

    async updateBill(billId, billData) {
        return await this.call(`/bills/${billId}`, 'PUT', billData);
    }

    async deleteBill(billId) {
        return await this.call(`/bills/${billId}`, 'DELETE');
    }

    async updateBillStatus(billId, status, paymentDate = null, paymentMethod = null) {
        return await this.call(`/bills/${billId}/status`, 'PATCH', {
            paymentStatus: status,
            paymentDate,
            paymentMethod
        });
    }

    async getBillStats() {
        return await this.call('/bills/stats', 'GET');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }
}

// Create global API instance
window.api = new API();

// Authentication check for protected pages - DISABLED (each page handles its own auth)
/*
(function() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuth);
    } else {
        checkAuth();
    }
    
    function checkAuth() {
        const currentPage = window.location.pathname;
        const publicPages = ['/login.html', '/register.html', '/index.html', '/'];
        
        // Check if current page is public
        const isPublicPage = publicPages.some(page => 
            currentPage.endsWith(page) || currentPage === '/'
        );

        if (!isPublicPage) {
            // Check both API instance and localStorage
            const hasToken = window.api.isAuthenticated() || localStorage.getItem('authToken');
            
            if (!hasToken) {
                console.log('No authentication token found, redirecting to login');
                window.location.href = 'login.html';
            }
        }
    }
})();
*/

console.log('✅ API connector loaded');
