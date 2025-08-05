/* Common Utility Functions */

/**
 * Display a message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success, error, warning, info)
 */
export function showMessage(message, type = 'info') {
    try {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) {
            console.warn('Message container not found');
            return;
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        messageElement.innerHTML = `
            ${message}
            <button class="close-button" onclick="this.parentElement.remove()">×</button>
        `;
        
        messageContainer.appendChild(messageElement);
        
        // Auto-remove non-error messages after 5 seconds
        if (type !== 'error') {
            setTimeout(() => {
                if (messageContainer.contains(messageElement)) {
                    messageContainer.removeChild(messageElement);
                }
            }, 5000);
        }
    } catch (error) {
        console.error('Error showing message:', error);
        alert(message);
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (fallbackError) {
            console.error('Clipboard copy failed:', fallbackError);
            return false;
        }
    }
}

/**
 * Format date to localized string
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return '날짜 형식 오류';
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
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

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export function deepClone(obj) {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        console.error('Error cloning object:', error);
        return null;
    }
}

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} - Unique ID
 */
export function generateId(prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array/object)
 * @param {*} value - Value to check
 * @returns {boolean} - True if empty
 */
export function isEmpty(value) {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Safely get nested property value
 * @param {Object} obj - Object to get value from
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} - Property value or default
 */
export function getNestedValue(obj, path, defaultValue = null) {
    try {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result == null) return defaultValue;
            result = result[key];
        }
        
        return result !== undefined ? result : defaultValue;
    } catch (error) {
        return defaultValue;
    }
}

/**
 * Download data as JSON file
 * @param {Object} data - Data to download
 * @param {string} filename - Filename for download
 */
export function downloadJSON(data, filename) {
    try {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        showMessage('파일 다운로드에 실패했습니다.', 'error');
    }
}

/**
 * Load JSON file from input element
 * @param {HTMLInputElement} input - File input element
 * @returns {Promise<Object>} - Parsed JSON data
 */
export async function loadJSONFile(input) {
    return new Promise((resolve, reject) => {
        const file = input.files[0];
        if (!file) {
            reject(new Error('파일이 선택되지 않았습니다.'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('JSON 파싱 오류: ' + error.message));
            }
        };
        reader.onerror = () => {
            reject(new Error('파일 읽기 오류'));
        };
        reader.readAsText(file);
    });
}