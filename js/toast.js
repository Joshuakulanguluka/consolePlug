// Toast Notification System
// Modern toast notifications to replace alert() calls

(function() {
    // Create toast container on page load
    function createToastContainer() {
        if (document.getElementById('toast-container')) return;
        
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createToastContainer);
    } else {
        createToastContainer();
    }
})();

// Toast function
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error('Toast container not found');
        return;
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Get icon based on type
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle',
        info: 'info'
    };
    const iconName = icons[type] || icons.info;
    
    // Get title based on type
    const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info'
    };
    const title = titles[type] || titles.info;
    
    // Build toast HTML
    toast.innerHTML = `
        <div class="toast-icon">
            <i data-lucide="${iconName}" style="width: 16px; height: 16px;"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close" onclick="closeToast(this)">
            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
        </div>
    `;
    
    // Add to container
    container.appendChild(toast);
    
    // Initialize Lucide icons for this toast
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Auto remove after duration
    setTimeout(() => {
        removeToast(toast);
    }, duration);
}

// Close toast manually
function closeToast(closeBtn) {
    const toast = closeBtn.closest('.toast');
    if (toast) {
        removeToast(toast);
    }
}

// Remove toast with animation
function removeToast(toast) {
    toast.classList.add('hiding');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Convenience functions
function showSuccess(message, duration) {
    showToast(message, 'success', duration);
}

function showError(message, duration) {
    showToast(message, 'error', duration);
}

function showWarning(message, duration) {
    showToast(message, 'warning', duration);
}

function showInfo(message, duration) {
    showToast(message, 'info', duration);
}
