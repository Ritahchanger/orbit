// src/globals/hooks/useElectronRouter.js
const useElectronRouter = () => {
    const isElectron = window.electronAPI !== undefined;

    const navigateTo = (path) => {
        if (isElectron) {
            
            window.location.hash = path;
        } else {
           
        }
    };

    return { isElectron, navigateTo };
};