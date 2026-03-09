import Modal from 'react-modal';
import { useEffect } from 'react';
const ModalSetup = () => {
    useEffect(() => {
        // Set the app element for accessibility
        // Use a timeout to ensure the element exists
        const timer = setTimeout(() => {
            const rootElement = document.getElementById('root');
            if (rootElement) {
                Modal.setAppElement('#root');
                Modal.defaultStyles.overlay.backgroundColor = 'rgba(0, 0, 0, 0.75)';
                Modal.defaultStyles.overlay.zIndex = 9999;
                Modal.defaultStyles.overlay.display = 'flex';
                Modal.defaultStyles.overlay.alignItems = 'center';
                Modal.defaultStyles.overlay.justifyContent = 'center';
            } else {
                console.warn('Root element not found for Modal.setAppElement');
                Modal.setAppElement(document.body);
            }
        }, 100);

        // Configure default modal styles
        const defaultStyles = {
            overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                backdropFilter: 'blur(2px)'
            },
            content: {
                position: 'relative',
                inset: 'auto',
                border: 'none',
                background: 'transparent',
                padding: '0',
                maxWidth: '100%',
                maxHeight: '90vh',
                overflow: 'visible',
                borderRadius: '0',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }
        };

        // Merge with existing defaults
        Modal.defaultStyles.overlay = {
            ...Modal.defaultStyles.overlay,
            ...defaultStyles.overlay
        };
        Modal.defaultStyles.content = {
            ...Modal.defaultStyles.content,
            ...defaultStyles.content
        };

        return () => clearTimeout(timer);
    }, []);

    return null;
};

export default ModalSetup;