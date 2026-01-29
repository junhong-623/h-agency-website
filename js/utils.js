// ===== Utility Functions =====

// Password hashing function (simple hash for client-side)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        hash = ((hash << 5) - hash) + password.charCodeAt(i);
        hash = hash & hash;
    }
    return hash.toString();
}

// Show notification
function showNotification(title, message, duration = 5000) {
    const notification = document.getElementById('notification');
    const titleEl = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    
    if (!notification || !titleEl || !messageEl) return;
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        hideNotification();
    }, duration);
}

// Hide notification
function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.remove('show');
    }
}

// Format date to local string
function formatDate(isoString, locale = 'zh-CN') {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kuala_Lumpur'
    });
}

// Format number with thousand separators
function formatNumber(num) {
    if (!num) return '0';
    return num.toLocaleString();
}

// Smooth scroll to element
function scrollToElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Debounce function
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

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number (basic)
function isValidPhone(phone) {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone.replace(/[\s-]/g, ''));
}

// Check password strength
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'weak', text: '弱', color: '#f44336', width: '33%' };
    if (strength <= 3) return { level: 'medium', text: '中等', color: '#ff9800', width: '66%' };
    return { level: 'strong', text: '强', color: '#4caf50', width: '100%' };
}

// Local storage helpers
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    }
};

// Session storage helpers
const sessionStorage = {
    set: (key, value) => {
        try {
            window.sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Session storage set error:', e);
            return false;
        }
    },
    
    get: (key) => {
        try {
            const item = window.sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Session storage get error:', e);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            window.sessionStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Session storage remove error:', e);
            return false;
        }
    }
};

// Export all utilities
window.utils = {
    hashPassword,
    showNotification,
    hideNotification,
    formatDate,
    formatNumber,
    scrollToElement,
    debounce,
    isValidEmail,
    isValidPhone,
    checkPasswordStrength,
    storage,
    sessionStorage
};
