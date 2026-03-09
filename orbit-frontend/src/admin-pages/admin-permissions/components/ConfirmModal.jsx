import { AlertCircle, CheckCircle, XCircle, Info, X } from "lucide-react"

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "warning", // 'warning', 'danger', 'info', 'success'
    isLoading = false,
    confirmDisabled = false,
    size = "md" // 'sm', 'md', 'lg'
}) => {
    if (!isOpen) return null

    // Variant configurations
    const variants = {
        warning: {
            icon: AlertCircle,
            iconColor: "text-yellow-400",
            bgColor: "bg-yellow-500/10",
            borderColor: "border-yellow-500/30",
            confirmButton: "bg-yellow-600 hover:bg-yellow-700",
            cancelButton: "bg-gray-800 hover:bg-gray-700"
        },
        danger: {
            icon: XCircle,
            iconColor: "text-red-400",
            bgColor: "bg-red-500/10",
            borderColor: "border-red-500/30",
            confirmButton: "bg-red-600 hover:bg-red-700",
            cancelButton: "bg-gray-800 hover:bg-gray-700"
        },
        info: {
            icon: Info,
            iconColor: "text-blue-400",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/30",
            confirmButton: "bg-blue-600 hover:bg-blue-700",
            cancelButton: "bg-gray-800 hover:bg-gray-700"
        },
        success: {
            icon: CheckCircle,
            iconColor: "text-green-400",
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/30",
            confirmButton: "bg-green-600 hover:bg-green-700",
            cancelButton: "bg-gray-800 hover:bg-gray-700"
        }
    }

    // Size configurations
    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg"
    }

    const config = variants[variant]
    const Icon = config.icon
    const modalSize = sizes[size]

    const handleConfirm = () => {
        if (!isLoading && !confirmDisabled) {
            onConfirm()
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose()
        }
        if (e.key === 'Enter' && !isLoading && !confirmDisabled) {
            handleConfirm()
        }
    }

    // Add event listener for keyboard shortcuts
    React.useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            return () => {
                document.removeEventListener('keydown', handleKeyDown)
            }
        }
    }, [isOpen, isLoading, confirmDisabled])

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="flex min-h-screen items-center justify-center p-4">
                <div className={`relative w-full ${modalSize} transform transition-all`}>
                    <div className="bg-dark border border-gray-700 rounded-sm shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="border-b border-gray-700 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-sm ${config.bgColor} ${config.borderColor} border`}>
                                        <Icon className={`h-5 w-5 ${config.iconColor}`} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">{title}</h2>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Please review this action carefully
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-gray-800 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-300">{message}</p>
                            </div>

                            {/* Warning/Danger Note */}
                            {variant === 'danger' && (
                                <div className={`mb-6 p-4 rounded-sm ${config.bgColor} ${config.borderColor} border`}>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className={`h-4 w-4 mt-0.5 ${config.iconColor}`} />
                                        <div>
                                            <p className="text-sm font-medium text-white mb-1">Irreversible Action</p>
                                            <p className="text-xs text-gray-300">
                                                This action cannot be undone. All data associated with this item will be permanently removed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`px-4 py-2 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${config.cancelButton}`}
                                    disabled={isLoading}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={isLoading || confirmDisabled}
                                    className={`px-4 py-2 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${config.confirmButton}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        {variant === 'danger' && (
                            <div className="border-t border-gray-800 p-4 bg-gray-900/30">
                                <p className="text-xs text-gray-400 text-center">
                                    For safety, you have 30 seconds to cancel this action
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal