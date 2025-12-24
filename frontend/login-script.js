// Password Toggle Functionality with Bear Animation
document.addEventListener('DOMContentLoaded', function() {
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const bearContainer = document.querySelector('.bear-container');
    
    if (togglePasswordBtn && passwordInput && bearContainer) {
        togglePasswordBtn.addEventListener('click', function() {
            // Toggle password visibility
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle bear eyes animation
            if (type === 'text') {
                bearContainer.classList.add('password-visible');
            } else {
                bearContainer.classList.remove('password-visible');
            }
            
            // Add subtle bounce effect
            bearContainer.style.transform = 'scale(1.1)';
            setTimeout(() => {
                bearContainer.style.transform = 'scale(1)';
            }, 300);
        });
    }
    
    // Form submission handling with backend API
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const email = document.getElementById('email').value;
            const password = passwordInput.value;
            
            // Add button loading animation
            const submitBtn = loginForm.querySelector('.btn-primary');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<svg class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" style="animation: spin 1s linear infinite;"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-dashoffset="25" opacity="0.5"/></svg> Logging in...';
            submitBtn.style.pointerEvents = 'none';
            
            try {
                // Login with backend API
                const result = await window.api.login(email, password, true);
                
                if (result.status === 'success') {
                    // Store user data
                    localStorage.setItem('userData', JSON.stringify(result.data.user));
                    
                    console.log('=== Login Successful ===');
                    console.log('Token saved:', localStorage.getItem('authToken') ? 'YES' : 'NO');
                    console.log('User data saved:', localStorage.getItem('userData') ? 'YES' : 'NO');
                    
                    // Show success message
                    submitBtn.innerHTML = '<svg class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path stroke="currentColor" stroke-width="2" d="M4 10l4 4 8-8"/></svg> Success!';
                    
                    // Redirect to admin dashboard
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1000);
                } else {
                    throw new Error(result.message || 'Login failed');
                }
                
            } catch (error) {
                console.error('Login Error:', error);
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.style.pointerEvents = 'auto';
                
                // Show error message
                showErrorMessage(error.message || 'Login failed. Please check your credentials.');
            }
        });
    }
    
    // Error message display function
    function showErrorMessage(message) {
        // Remove existing error message
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            text-align: center;
            animation: slideDown 0.3s ease-out;
        `;
        errorDiv.textContent = message;
        
        // Insert error message before form
        loginForm.insertBefore(errorDiv, loginForm.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }
    
    // Input focus animations
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // Checkbox animation
    const checkboxWrapper = document.querySelector('.checkbox-wrapper');
    if (checkboxWrapper) {
        checkboxWrapper.addEventListener('click', function() {
            const customCheckbox = this.querySelector('.checkbox-custom');
            customCheckbox.style.transform = 'scale(0.95)';
            setTimeout(() => {
                customCheckbox.style.transform = 'scale(1)';
            }, 150);
        });
    }
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.width = '0';
            ripple.style.height = '0';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }
        
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
});
