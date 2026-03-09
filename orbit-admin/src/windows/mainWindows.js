const { BrowserWindow } = require('electron');
const {
    isDev,
    FRONTEND_URL,
    WINDOW,
    PATHS
} = require('../config/constants');
const { createApplicationMenu } = require('../menus/applicationMenu');
const { setupDownloadHandler } = require('../handlers/downloadHandler');
const { setupNavigationHandler } = require('../handlers/navigationHandler');

class MainWindow {
    constructor() {
        this.window = null;
        this.createWindow();
        this.setupEventHandlers();
    }

    createWindow() {
        this.window = new BrowserWindow({
            width: WINDOW.width,
            height: WINDOW.height,
            minWidth: WINDOW.minWidth,
            minHeight: WINDOW.minHeight,
            icon: PATHS.icon,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: PATHS.preload,
                webSecurity: true,
                allowRunningInsecureContent: false,
                devTools: isDev
            },
            frame: true,
            titleBarStyle: 'default',
            backgroundColor: WINDOW.backgroundColor,
            show: false
        });

        // Hide menu bar for cleaner look
        this.window.setMenuBarVisibility(false);

        console.log('Loading URL:', FRONTEND_URL);
        this.window.loadURL(FRONTEND_URL);

        // Show window when content is loaded
        this.window.once('ready-to-show', () => {
            this.window.show();
            // Auto-open DevTools in development
            if (isDev) {
                this.window.webContents.openDevTools({ mode: 'detach' });
            }
        });

        // Handle window closed
        this.window.on('closed', () => {
            this.window = null;
        });
    }

    setupEventHandlers() {
        if (!this.window) return;

        // Setup handlers
        setupDownloadHandler(this.window);
        setupNavigationHandler(this.window);
        this.setupFailedLoadHandler();

        // Create application menu
        createApplicationMenu(this.window);
    }

    setupFailedLoadHandler() {
        this.window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            console.error('Failed to load:', errorCode, errorDescription);
            console.log('Make sure your frontend is running on port 5173!');
            console.log('Run: cd ../mega-gamers-frontend && npm run dev');

            // Show error page
            this.window.loadURL(`data:text/html;charset=utf-8,
                <html>
                    <body style="background: #0f172a; color: white; font-family: Arial; padding: 40px; text-align: center;">
                        <h1>🔌 Frontend Not Running</h1>
                        <p>Please start the frontend server first:</p>
                        <code style="background: #1e293b; padding: 10px; border-radius: 5px; display: block; margin: 20px;">
                            cd ../mega-gamers-frontend && npm run dev
                        </code>
                        <p>Then restart the Electron app.</p>
                        <p>Error: ${errorDescription}</p>
                        <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 20px;">
                            Retry Connection
                        </button>
                    </body>
                </html>
            `);
        });
    }

    // Public methods
    reload() {
        if (this.window) {
            this.window.reload();
        }
    }

    reloadIgnoringCache() {
        if (this.window) {
            this.window.webContents.reloadIgnoringCache();
        }
    }

    openDevTools() {
        if (this.window) {
            this.window.webContents.openDevTools();
        }
    }

    focus() {
        if (this.window) {
            if (this.window.isMinimized()) this.window.restore();
            this.window.focus();
        }
    }
}

module.exports = MainWindow;