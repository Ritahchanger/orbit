const path = require('path');

module.exports = {
    // Development flag
    isDev: process.env.NODE_ENV === 'development' || process.argv.includes('--dev'),

    // Application info
    APP_NAME: 'Orbit Admin',
    APP_VERSION: '1.0.0',

    // Frontend URL (development)
    FRONTEND_URL: 'http://localhost:5173/admin/dashboard',
    FRONTEND_BASE_URL: 'http://localhost:5173',

    // File paths
    PATHS: {
        icon: path.join(__dirname, '../../logo/megagamer.ico'),
        preload: path.join(__dirname, '../..                                                                                                                                                                                                                                                                                                                                                /preloader.js'),
        downloads: () => require('electron').app.getPath('downloads')
    },

    // Window settings
    WINDOW: {
        width: 1600,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        backgroundColor: '#0f172a'
    },

    // Allowed routes
    ALLOWED_ROUTES: [
        '/admin/',
        'localhost:5173'
    ]
};