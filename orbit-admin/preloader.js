// preloader.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    windowMinimize: () => ipcRenderer.send('window-minimize'),
    windowMaximize: () => ipcRenderer.send('window-maximize'),
    windowClose: () => ipcRenderer.send('window-close'),
    
    // Zoom controls
    zoomIn: () => ipcRenderer.send('zoom-in'),
    zoomOut: () => ipcRenderer.send('zoom-out'),
    zoomReset: () => ipcRenderer.send('zoom-reset'),
    
    // Other controls
    openDevTools: () => ipcRenderer.send('open-dev-tools'),
    toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
    
    // App info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // Listeners
    onZoomChange: (callback) => ipcRenderer.on('zoom-change', callback)
});