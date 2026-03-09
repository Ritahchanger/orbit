import { createContext, useContext, useState, useCallback } from 'react';
import ConfirmationModal from '../../globals/modals/confirmation-modal/ConfirmationModal';

const ModalContext = createContext();

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within ModalProvider');
    }
    return context;
};

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'confirm',
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        isLoading: false,
        customContent: null
    });

    const openModal = useCallback((config) => {
        setModalState({
            isOpen: true,
            type: config.type || 'confirm',
            title: config.title || '',
            message: config.message || '',
            onConfirm: config.onConfirm || (() => { }),
            onCancel: config.onCancel || (() => { }),
            confirmText: config.confirmText || 'Confirm',
            cancelText: config.cancelText || 'Cancel',
            isLoading: false,
            customContent: config.customContent || null
        });
    }, []);

    const closeModal = useCallback(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const setLoading = useCallback((isLoading) => {
        setModalState(prev => ({ ...prev, isLoading }));
    }, []);

    const handleConfirm = async () => {
        if (modalState.onConfirm) {
            setModalState(prev => ({ ...prev, isLoading: true }));
            try {
                await modalState.onConfirm();
                closeModal();
            } catch (error) {
                setModalState(prev => ({ ...prev, isLoading: false }));
                throw error;
            }
        } else {
            closeModal();
        }
    };

    const handleCancel = () => {
        if (modalState.onCancel) {
            modalState.onCancel();
        }
        closeModal();
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal, setLoading }}>
            {children}
            {/* Global Confirmation Modal */}
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                isLoading={modalState.isLoading}
            >
                {modalState.customContent}
            </ConfirmationModal>
        </ModalContext.Provider>
    );
};