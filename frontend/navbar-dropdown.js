// Shared navbar dropdown functionality

// Toggle user dropdown
function toggleUserDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    
    const dropdown = document.getElementById('userDropdown');
    console.log('Toggle dropdown clicked, dropdown element:', dropdown);
    
    if (dropdown) {
        const isShowing = dropdown.classList.toggle('show');
        console.log('Dropdown is now:', isShowing ? 'visible' : 'hidden');
        
        // Add visual feedback
        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            if (isShowing) {
                userProfile.style.background = 'rgba(102, 126, 234, 0.1)';
            } else {
                userProfile.style.background = '';
            }
        }
    } else {
        console.error('Dropdown element not found!');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('userDropdown');
    const profileContainer = document.querySelector('.user-profile-container');
    
    if (dropdown && profileContainer && !profileContainer.contains(event.target)) {
        dropdown.classList.remove('show');
        
        // Remove visual feedback
        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            userProfile.style.background = '';
        }
    }
});

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    // Check if mobile view
    const isMobile = window.innerWidth <= 768;
    
    if (sidebar) {
        if (isMobile) {
            // Mobile behavior - show/hide sidebar
            const isShowing = sidebar.classList.toggle('show');
            
            if (overlay) {
                if (isShowing) {
                    overlay.classList.add('show');
                } else {
                    overlay.classList.remove('show');
                }
            }
            
            // Close sidebar when clicking outside on mobile
            if (isShowing) {
                setTimeout(() => {
                    if (overlay) {
                        overlay.addEventListener('click', closeSidebarOutside, { once: true });
                    }
                    document.addEventListener('click', closeSidebarOutside, { once: true });
                }, 100);
            }
        } else {
            // Desktop behavior - collapse/expand sidebar
            sidebar.classList.toggle('collapsed');
            
            // Save preference
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        }
    }
}

// Load sidebar state on page load
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (sidebar && sidebarCollapsed && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
    }
});

// Close sidebar when clicking outside
function closeSidebarOutside(event) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (sidebar && !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
        sidebar.classList.remove('show');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
    }
}

// Load user info in dropdown
document.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('userData');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            
            // Update all user name elements
            document.querySelectorAll('.user-name').forEach(el => {
                el.textContent = user.name || 'Admin User';
            });
            
            // Update dropdown header
            const dropdownName = document.querySelector('.dropdown-header-name');
            if (dropdownName) {
                dropdownName.textContent = user.name || 'Admin User';
            }
            
            const dropdownEmail = document.querySelector('.dropdown-header-email');
            if (dropdownEmail) {
                dropdownEmail.textContent = user.email || 'admin@billflow.com';
            }
            
            // Update avatar if custom image exists
            if (settings.avatarUrl) {
                document.querySelectorAll('.user-avatar img').forEach(img => {
                    img.src = settings.avatarUrl;
                });
            } else if (user.name) {
                // Update avatar with first letter
                const initial = user.name.charAt(0).toUpperCase();
                const svgUrl = `data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23667eea'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='16' font-weight='bold'%3E${initial}%3C/text%3E%3C/svg%3E`;
                document.querySelectorAll('.user-avatar img').forEach(img => {
                    img.src = svgUrl;
                    img.alt = user.name;
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
});
