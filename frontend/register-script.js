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
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const organization = document.getElementById('organization').value;
            const password = passwordInput.value;
            
            // Validate phone number
            if (!/^[0-9]{10}$/.test(phone)) {
                showErrorMessage('Please enter a valid 10-digit phone number');
                return;
            }
            
            // Add button loading animation
            const submitBtn = registerForm.querySelector('.btn-primary');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<svg class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" style="animation: spin 1s linear infinite;"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-dashoffset="25" opacity="0.5"/></svg> Creating Account...';
            submitBtn.style.pointerEvents = 'none';
            
            try {
                // Register with backend API
                const result = await window.api.register(email, password, name, phone, organization);
                
                if (result.status === 'success') {
                    // Store user data
                    localStorage.setItem('userData', JSON.stringify(result.data.user));
                    
                    console.log('=== Registration Successful ===');
                    console.log('Token saved:', localStorage.getItem('authToken') ? 'YES' : 'NO');
                    console.log('User data saved:', localStorage.getItem('userData') ? 'YES' : 'NO');
                    
                    // Show success message
                    submitBtn.innerHTML = '<svg class="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path stroke="currentColor" stroke-width="2" d="M4 10l4 4 8-8"/></svg> Success!';
                    
                    // Redirect to admin dashboard
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1000);
                } else {
                    throw new Error(result.message || 'Registration failed');
                }
                
            } catch (error) {
                console.error('Registration Error:', error);
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.style.pointerEvents = 'auto';
                
                // Show error message
                showErrorMessage(error.message || 'Registration failed. Please try again.');
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
        registerForm.insertBefore(errorDiv, registerForm.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }
    
    // Input focus animations
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Animate bear on page load
    setTimeout(() => {
        if (bearContainer) {
            bearContainer.style.animation = 'float 3s ease-in-out infinite';
        }
    }, 500);
});

// Add CSS animations for error messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
