// BillFlow Landing Page - Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    
    // Button click handlers
    const loginBtn = document.getElementById('loginBtn');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const tryFreeBtn = document.getElementById('tryFreeBtn');
    const watchDemoBtn = document.getElementById('watchDemoBtn');
    
    // Login button - Navigate to login page
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }
    
    // Get Started button - Navigate to login/register page
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }
    
    // Try For Free button - Navigate to login/register page
    if (tryFreeBtn) {
        tryFreeBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }
    
    // Watch Demo button - Scroll to features
    if (watchDemoBtn) {
        watchDemoBtn.addEventListener('click', function() {
            const featuresSection = document.getElementById('features');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.boxShadow = '';
            navbar.style.background = 'rgba(255, 255, 255, 0.7)';
        }

        lastScroll = currentScroll;
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .step-card, .doc-card');
    animatedElements.forEach(el => observer.observe(el));

    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.pageYOffset + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Button ripple effect
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-primary-large, .btn-secondary-large, button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: translate(-50%, -50%);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation CSS
    if (!document.getElementById('ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                to {
                    width: 300px;
                    height: 300px;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Dashboard card hover tilt effect
    const dashboardCard = document.querySelector('.dashboard-card');
    if (dashboardCard) {
        dashboardCard.addEventListener('mousemove', (e) => {
            const rect = dashboardCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            dashboardCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        dashboardCard.addEventListener('mouseleave', () => {
            dashboardCard.style.transform = '';
        });
    }

    // Feature cards sequential animation on hover
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            featureCards.forEach((otherCard, otherIndex) => {
                if (otherIndex !== index) {
                    otherCard.style.opacity = '0.6';
                    otherCard.style.transform = 'scale(0.95)';
                }
            });
        });

        card.addEventListener('mouseleave', function() {
            featureCards.forEach(otherCard => {
                otherCard.style.opacity = '';
                otherCard.style.transform = '';
            });
        });
    });

    // Parallax effect for background glows
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const glows = document.querySelectorAll('.glow');
        
        glows.forEach((glow, index) => {
            const speed = 0.5 + (index * 0.2);
            glow.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Count up animation for dashboard stats
    const stats = document.querySelectorAll('.stat-value');
    let counted = false;

    const countUp = (element, target) => {
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    };

    window.addEventListener('scroll', () => {
        if (!counted) {
            stats.forEach(stat => {
                const rect = stat.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    const target = parseInt(stat.textContent);
                    if (!isNaN(target)) {
                        countUp(stat, target);
                    }
                    counted = true;
                }
            });
        }
    });

    // Doc card click handler
    const docCards = document.querySelectorAll('.doc-card');
    docCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('doc-link')) {
                const link = this.querySelector('.doc-link');
                if (link) {
                    link.click();
                }
            }
        });
    });

    // Logo click handler
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Footer links smooth scroll
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Press 'L' to go to login
        if (e.key === 'l' || e.key === 'L') {
            if (!e.target.matches('input, textarea')) {
                window.location.href = 'login.html';
            }
        }
        
        // Press 'H' to go to home
        if (e.key === 'h' || e.key === 'H') {
            if (!e.target.matches('input, textarea')) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
    });

    // Loading animation for images (if any are added later)
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease-in-out';
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    });

    // Performance optimization: Lazy load animations
    const lazyAnimationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                lazyAnimationObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px'
    });

    document.querySelectorAll('.step-card, .doc-card').forEach(el => {
        lazyAnimationObserver.observe(el);
    });

    // Console message for developers
    console.log('%cBillFlow', 'font-size: 48px; font-weight: bold; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
    console.log('%cSmart Tenant Billing Made Simple', 'font-size: 16px; color: #667eea;');
    console.log('%c\nKeyboard Shortcuts:', 'font-size: 14px; font-weight: bold; color: #333;');
    console.log('%c  L - Go to Login\n  H - Scroll to Top', 'font-size: 12px; color: #666;');

    console.log('\n👋 Welcome to BillFlow! Interested in the code? Check out our GitHub repo!');
});

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Resize handler with debounce
const handleResize = debounce(() => {
    // Recalculate positions or adjust layout if needed
    console.log('Window resized');
}, 250);

window.addEventListener('resize', handleResize);
