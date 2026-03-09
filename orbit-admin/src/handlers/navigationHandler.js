const { ALLOWED_ROUTES, FRONTEND_BASE_URL } = require('../config/constants');

module.exports = {
    setupNavigationHandler: (mainWindow) => {
        if (!mainWindow || !mainWindow.webContents) return;

        // Handle external links
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            // Check if URL is allowed
            const isAllowed = ALLOWED_ROUTES.some(route => url.includes(route));
            
            if (isAllowed) {
                return { action: 'allow' };
            }
            
            // Block external links
            console.log('Blocked external navigation to:', url);
            return { action: 'deny' };
        });

        // Handle navigation within the window
        mainWindow.webContents.on('will-navigate', (event, url) => {
            // Allow navigation within the same origin
            if (url.startsWith(FRONTEND_BASE_URL) || url.startsWith('http://localhost:5173')) {
                return;
            }
            
            // Block external navigation
            event.preventDefault();
            console.log('Blocked navigation to:', url);
        });
    }
};