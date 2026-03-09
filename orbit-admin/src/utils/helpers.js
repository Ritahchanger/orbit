module.exports = {
    // Check if a URL is allowed
    isAllowedUrl: (url, allowedPatterns) => {
        return allowedPatterns.some(pattern => url.includes(pattern));
    },

    // Format file size
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Show error dialog
    showErrorDialog: (window, title, message) => {
        const { dialog } = require('electron');
        dialog.showErrorBox(title, message);
    }
};