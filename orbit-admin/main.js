const { app, session } = require('electron');

const MainWindow = require("./src/windows/mainWindows")

const { isDev } = require('./src/config/constants');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new MainWindow();

    // Enable persistent sessions
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['User-Agent'] = 'MegaGamersAdmin/1.0.0';
        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null || mainWindow.window === null) {
        mainWindow = new MainWindow();
    }
});

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, focus our window instead
        if (mainWindow && mainWindow.window) {
            if (mainWindow.window.isMinimized()) mainWindow.window.restore();
            mainWindow.window.focus();
        }
    });
}

// Enable dev mode with --dev flag
if (process.argv.includes('--dev')) {
    console.log('Running in development mode');
}