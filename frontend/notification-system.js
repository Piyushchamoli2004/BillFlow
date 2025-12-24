// Modern Notification System - JavaScript
// Linus UI Style - Non-intrusive, beautiful notifications

class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    // Show toast notification
    showToast(options) {
        const {
            type = 'info', // success, error, warning, info
            title,
            message,
            duration = 2500,
            showProgress = true
        } = options;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Icon based on type
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 6.667V10M10 13.333h.008M18.333 10a8.333 8.333 0 11-16.666 0 8.333 8.333 0 0116.666 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 6.667V10M10 13.333h.008M2.5 10l7.5-7.5L17.5 10l-7.5 7.5L2.5 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="2"/><path d="M10 10V14M10 7h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
            ${showProgress ? `<div class="toast-progress"><div class="toast-progress-bar" style="width: 100%; transition: width ${duration}ms linear;"></div></div>` : ''}
        `;

        this.container.appendChild(toast);

        // Start progress bar animation
        if (showProgress) {
            setTimeout(() => {
                const progressBar = toast.querySelector('.toast-progress-bar');
                if (progressBar) progressBar.style.width = '0%';
            }, 10);
        }

        // Auto remove after duration
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    }

    // Convenience methods
    success(title, message, duration) {
        return this.showToast({ type: 'success', title, message, duration });
    }

    error(title, message, duration) {
        return this.showToast({ type: 'error', title, message, duration });
    }

    warning(title, message, duration) {
        return this.showToast({ type: 'warning', title, message, duration });
    }

    info(title, message, duration) {
        return this.showToast({ type: 'info', title, message, duration });
    }

    // Show confirmation modal
    confirm(options) {
        return new Promise((resolve) => {
            const {
                type = 'danger', // danger, warning
                title = 'Are you sure?',
                message = 'This action cannot be undone.',
                confirmText = 'Confirm',
                cancelText = 'Cancel',
                icon = 'trash'
            } = options;

            const overlay = document.createElement('div');
            overlay.className = 'confirmation-modal-overlay';

            const icons = {
                trash: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                alert: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            };

            overlay.innerHTML = `
                <div class="confirmation-modal">
                    <div class="confirmation-icon ${type}">
                        ${icons[icon] || icons.alert}
                    </div>
                    <div class="confirmation-title">${title}</div>
                    <div class="confirmation-message">${message}</div>
                    <div class="confirmation-actions">
                        <button class="confirmation-btn confirmation-btn-cancel" data-action="cancel">${cancelText}</button>
                        <button class="confirmation-btn confirmation-btn-danger" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Handle clicks
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    resolve(false);
                }
            });

            overlay.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action === 'confirm';
                    overlay.remove();
                    resolve(action);
                });
            });
        });
    }

    // Show inline confirmation banner
    showInlineConfirmation(options) {
        return new Promise((resolve) => {
            const {
                targetElement,
                message = 'Are you sure you want to proceed?',
                confirmText = 'Yes',
                cancelText = 'No'
            } = options;

            const banner = document.createElement('div');
            banner.className = 'inline-confirmation';
            banner.innerHTML = `
                <div class="inline-confirmation-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 6.667V10M10 13.333h.008M18.333 10a8.333 8.333 0 11-16.666 0 8.333 8.333 0 0116.666 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <div class="inline-confirmation-content">
                    <div class="inline-confirmation-message">${message}</div>
                </div>
                <div class="inline-confirmation-actions">
                    <button class="inline-confirmation-btn inline-confirmation-btn-secondary" data-action="cancel">${cancelText}</button>
                    <button class="inline-confirmation-btn inline-confirmation-btn-primary" data-action="confirm">${confirmText}</button>
                </div>
            `;

            targetElement.insertBefore(banner, targetElement.firstChild);

            banner.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action === 'confirm';
                    banner.remove();
                    resolve(action);
                });
            });
        });
    }
}

// Create global instance
window.notify = new NotificationSystem();

// Convenience global functions
window.showToast = (type, title, message, duration) => {
    window.notify.showToast({ type, title, message, duration });
};

window.showSuccess = (message, duration = 2500) => {
    window.notify.success('Success', message, duration);
};

window.showError = (message, duration = 3500) => {
    window.notify.error('Error', message, duration);
};

window.showWarning = (message, duration = 3000) => {
    window.notify.warning('Warning', message, duration);
};

window.showInfo = (message, duration = 2500) => {
    window.notify.info('Info', message, duration);
};

window.confirmAction = async (options) => {
    return await window.notify.confirm(options);
};
