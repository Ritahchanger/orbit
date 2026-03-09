// src/components/TitleBar.js
import { app, BrowserWindow } from 'electron';

class TitleBar {
    constructor(window) {
        this.window = window;
    }

    createTitleBar() {
        // Create title bar HTML
        return `
            <div class="title-bar">
                <div class="window-controls">
                    <button class="control-btn minimize" title="Minimize">
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <rect x="2" y="5" width="8" height="2" fill="currentColor"/>
                        </svg>
                    </button>
                    <button class="control-btn maximize" title="Maximize">
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <rect x="2" y="2" width="8" height="8" fill="currentColor" stroke="currentColor" stroke-width="1"/>
                        </svg>
                    </button>
                    <button class="control-btn close" title="Close">
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <path d="M2,2 L10,10 M10,2 L2,10" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </button>
                </div>
                <div class="window-title">Orbit Admin</div>
                <div class="tabs">
                    <button class="tab active" data-tab="dashboard">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        <span>Dashboard</span>
                    </button>
                    <button class="tab" data-tab="inventory">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                        <span>Inventory</span>
                    </button>
                    <button class="tab" data-tab="sales">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        <span>Sales</span>
                    </button>
                    <button class="tab" data-tab="analytics">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        <span>Analytics</span>
                    </button>
                    <button class="tab" data-tab="settings">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>Settings</span>
                    </button>
                </div>
                <div class="zoom-controls">
                    <button class="zoom-btn zoom-out" title="Zoom Out">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                            <path d="M8 11h6"/>
                        </svg>
                    </button>
                    <span class="zoom-level">100%</span>
                    <button class="zoom-btn zoom-in" title="Zoom In">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                            <path d="M11 8v6"/>
                            <path d="M8 11h6"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        // Minimize
        document.querySelector('.control-btn.minimize')?.addEventListener('click', () => {
            this.window.minimize();
        });

        // Maximize/Restore
        const maximizeBtn = document.querySelector('.control-btn.maximize');
        maximizeBtn?.addEventListener('click', () => {
            if (this.window.isMaximized()) {
                this.window.unmaximize();
                maximizeBtn.title = 'Maximize';
            } else {
                this.window.maximize();
                maximizeBtn.title = 'Restore';
            }
        });

        // Close
        document.querySelector('.control-btn.close')?.addEventListener('click', () => {
            this.window.close();
        });

        // Zoom controls
        const zoomLevel = document.querySelector('.zoom-level');
        let currentZoom = 1.0;

        document.querySelector('.zoom-btn.zoom-in')?.addEventListener('click', () => {
            if (currentZoom < 2.0) {
                currentZoom += 0.1;
                this.window.webContents.setZoomFactor(currentZoom);
                zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
            }
        });

        document.querySelector('.zoom-btn.zoom-out')?.addEventListener('click', () => {
            if (currentZoom > 0.5) {
                currentZoom -= 0.1;
                this.window.webContents.setZoomFactor(currentZoom);
                zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
            }
        });

        // Double-click title to maximize/restore
        document.querySelector('.window-title')?.addEventListener('dblclick', () => {
            if (this.window.isMaximized()) {
                this.window.unmaximize();
            } else {
                this.window.maximize();
            }
        });

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                
                // Update active tab
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Navigate to tab (you'll need to implement this based on your app)
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Implement tab switching logic here
        console.log(`Switching to tab: ${tabName}`);
        
        // Example: Send IPC message to main process or update URL
        if (this.window && this.window.webContents) {
            this.window.webContents.send('switch-tab', tabName);
        }
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .title-bar {
                -webkit-app-region: drag;
                height: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 10px;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                user-select: none;
            }

            .window-controls {
                -webkit-app-region: no-drag;
                display: flex;
                gap: 8px;
            }

            .control-btn {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .control-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .control-btn.close:hover {
                background: #e81123;
            }

            .window-title {
                font-weight: 500;
                font-size: 14px;
                letter-spacing: 0.5px;
            }

            .tabs {
                -webkit-app-region: no-drag;
                display: flex;
                gap: 2px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 6px;
                padding: 2px;
            }

            .tab {
                padding: 6px 12px;
                border-radius: 4px;
                border: none;
                background: transparent;
                color: rgba(255, 255, 255, 0.8);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.2s ease;
            }

            .tab:hover {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }

            .tab.active {
                background: rgba(255, 255, 255, 0.15);
                color: white;
            }

            .zoom-controls {
                -webkit-app-region: no-drag;
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 6px;
                padding: 4px 8px;
            }

            .zoom-btn {
                width: 24px;
                height: 24px;
                border-radius: 4px;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .zoom-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .zoom-level {
                font-size: 12px;
                font-weight: 500;
                min-width: 40px;
                text-align: center;
            }

            /* Add padding to body to account for title bar */
            body {
                padding-top: 40px;
            }
        `;
        document.head.appendChild(style);
    }
}

module.exports = TitleBar;