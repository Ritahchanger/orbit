import { useEffect, useState } from 'react';
import { useStoreContext } from '../../../context/store/StoreContext';
import { Check, AlertTriangle, Store, Package, X } from 'lucide-react';

const QuickAddModal = ({
    quickAddSku,
    setQuickAddSku,
    quickAddQuantity,
    setQuickAddQuantity,
    setShowQuickAddModal,
    handleQuickAdd,
    quickAddMutation
}) => {
    const { currentStore } = useStoreContext();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [validationError, setValidationError] = useState('');

    const handleQuantityChange = (e) => {
        const value = e.target.value;

        if (value === '') {
            setQuickAddQuantity('');
            return;
        }

        const numValue = parseInt(value, 10);

        if (!isNaN(numValue) && numValue > 0) {
            setQuickAddQuantity(numValue);
        } else if (numValue <= 0) {
            setQuickAddQuantity(1);
        }
    };

    // Validate inputs before showing confirmation
    const validateInputs = () => {
        if (!quickAddSku.trim()) {
            setValidationError('SKU is required');
            return false;
        }
        if (!quickAddQuantity || quickAddQuantity < 1) {
            setValidationError('Quantity must be at least 1');
            return false;
        }
        if (quickAddQuantity > 1000) {
            setValidationError('Quantity cannot exceed 1000 units');
            return false;
        }
        setValidationError('');
        return true;
    };

    // Handle quick add with confirmation
    const handleQuickAddWithConfirmation = () => {
        if (!validateInputs()) return;
        setShowConfirmation(true);
    };

    // Handle confirmed add
    const handleConfirmedAdd = () => {
        setShowConfirmation(false);
        handleQuickAdd();
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (showConfirmation) {
                    setShowConfirmation(false);
                } else {
                    setShowQuickAddModal(false);
                }
            }
            if (e.key === 'Enter' && !showConfirmation && quickAddSku.trim() && quickAddQuantity > 0) {
                handleQuickAddWithConfirmation();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [quickAddSku, quickAddQuantity, showConfirmation]);

    // Confirmation Dialog
    const ConfirmationDialog = () => (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/70 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm w-full max-w-md shadow-xl">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Inventory Addition</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Please review before adding</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Store Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-sm mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Store className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Store:</span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium">{currentStore?.name || 'Unknown Store'}</p>
                        {currentStore?.code && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Code: {currentStore.code}</p>
                        )}
                    </div>

                    {/* Product Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-sm mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Product Details:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">SKU</p>
                                <p className="text-gray-900 dark:text-white font-medium">{quickAddSku}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quantity</p>
                                <p className="text-gray-900 dark:text-white font-medium">{quickAddQuantity} units</p>
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-4 rounded-sm">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-amber-700 dark:text-amber-400 text-sm font-medium mb-1">Are you sure?</p>
                                <p className="text-amber-600 dark:text-amber-400/90 text-sm">
                                    This will add <span className="font-bold">{quickAddQuantity} units</span> of SKU
                                    <span className="font-bold ml-1">"{quickAddSku}"</span> to {currentStore?.name || 'this store'}.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={() => setShowConfirmation(false)}
                        disabled={quickAddMutation.isPending}
                        className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-sm transition-colors font-medium text-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmedAdd}
                        disabled={quickAddMutation.isPending}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-sm font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {quickAddMutation.isPending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                <span>Confirm & Add</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black/50 dark:bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm w-full max-w-md">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Add by SKU</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Adding to: <span className="text-blue-600 dark:text-blue-400 font-medium">{currentStore?.name || 'Unknown Store'}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowQuickAddModal(false)}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* Store Display */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <Store className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    <div>
                                        <p className="text-gray-900 dark:text-white text-sm font-medium">{currentStore?.name || 'Unknown Store'}</p>
                                        {currentStore?.code && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Store Code: {currentStore.code}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SKU Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    value={quickAddSku}
                                    onChange={(e) => {
                                        setQuickAddSku(e.target.value.toUpperCase());
                                        setValidationError('');
                                    }}
                                    placeholder="Enter product SKU"
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                    autoFocus
                                />
                            </div>

                            {/* Quantity Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    value={quickAddQuantity}
                                    onChange={(e) => {
                                        handleQuantityChange(e);
                                        setValidationError('');
                                    }}
                                    min="1"
                                    max="1000"
                                    step="1"
                                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center text-sm"
                                    onFocus={(e) => e.target.select()}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Maximum: 1000 units</p>
                            </div>

                            {/* Validation Error */}
                            {validationError && (
                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 p-4 rounded-sm">
                                    <p className="text-red-700 dark:text-red-400 text-sm">{validationError}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> to confirm
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowQuickAddModal(false)}
                                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-sm transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleQuickAddWithConfirmation}
                                disabled={!quickAddSku.trim() || !quickAddQuantity || quickAddQuantity < 1 || quickAddMutation.isPending}
                                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-sm font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {quickAddMutation.isPending ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Adding...
                                    </span>
                                ) : 'Add to Inventory'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmation && <ConfirmationDialog />}
        </>
    );
};

export default QuickAddModal;