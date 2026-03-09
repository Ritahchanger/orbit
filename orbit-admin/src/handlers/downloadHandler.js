const path = require('path');
const { PATHS } = require('../config/constants');

module.exports = {
    setupDownloadHandler: (mainWindow) => {
        if (!mainWindow || !mainWindow.webContents) return;

        // Listen for download events
        mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
            // Set the save path (Downloads folder by default)
            const fileName = item.getFilename();
            const downloadsPath = PATHS.downloads();
            const filePath = path.join(downloadsPath, fileName);

            item.setSavePath(filePath);

            // Track download progress
            item.on('updated', (event, state) => {
                if (state === 'interrupted') {
                    console.log('Download interrupted');
                } else if (state === 'progressing') {
                    if (item.isPaused()) {
                        console.log('Download paused');
                    } else {
                        console.log(`Downloading: ${Math.round(item.getReceivedBytes() / item.getTotalBytes() * 100)}%`);
                    }
                }
            });

            // Handle download completion
            item.once('done', (event, state) => {
                if (state === 'completed') {
                    console.log(`Download completed: ${filePath}`);

                    // Show notification to user
                    if (mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
                        mainWindow.webContents.send('download-complete', {
                            fileName: fileName,
                            filePath: filePath,
                            size: item.getTotalBytes()
                        });
                    }
                } else {
                    console.log(`Download failed: ${state}`);
                }
            });
        });
    }
};