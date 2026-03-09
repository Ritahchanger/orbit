import Modal from 'react-modal';
import { X, AlertTriangle, CheckCircle, Info, Shield } from 'lucide-react';
import PropTypes from 'prop-types';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'confirm',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    children,
    closeOnOverlayClick = true,
    showCloseButton = true
}) => {

    const typeConfig = {
        danger: {
            icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
            confirmClass: 'bg-red-500 hover:bg-red-600',
            iconBg: 'bg-red-500/10'
        },
        warning: {
            icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
            confirmClass: 'bg-yellow-500 hover:bg-yellow-600',
            iconBg: 'bg-yellow-500/10'
        },
        success: {
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            confirmClass: 'bg-green-500 hover:bg-green-600',
            iconBg: 'bg-green-500/10'
        },
        info: {
            icon: <Info className="h-5 w-5 text-blue-500" />,
            confirmClass: 'bg-blue-500 hover:bg-blue-600',
            iconBg: 'bg-blue-500/10'
        },
        confirm: {
            icon: <Shield className="h-5 w-5 text-primary" />,
            confirmClass: 'bg-primary hover:bg-primary/90',
            iconBg: 'bg-primary/10'
        }
    };

    const config = typeConfig[type] || typeConfig.confirm;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={closeOnOverlayClick}
            className="outline-none"
            overlayClassName="fixed inset-0 z-[9999]"
        >
            <div className="bg-gray-800 border border-gray-700 rounded-sm shadow-xl max-w-md w-full mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-sm ${config.iconBg}`}>
                            {config.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                            {title}
                        </h3>
                    </div>

                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-sm"
                            aria-label="Close modal"
                            disabled={isLoading}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {children ? (
                        <div className="text-gray-300">
                            {children}
                        </div>
                    ) : (
                        <p className="text-gray-300 leading-relaxed">
                            {message}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-700 bg-gray-800/50">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm text-white rounded-sm transition-colors ${config.confirmClass} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[80px] justify-center`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    type: PropTypes.oneOf(['confirm', 'danger', 'warning', 'info', 'success']),
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    isLoading: PropTypes.bool,
    children: PropTypes.node,
    closeOnOverlayClick: PropTypes.bool,
    showCloseButton: PropTypes.bool
};

export default ConfirmationModal;