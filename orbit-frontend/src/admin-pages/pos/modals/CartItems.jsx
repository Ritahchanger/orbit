import { useState } from 'react';
import {
    ShoppingCart, Package, Plus, Minus, Trash2, AlertCircle
} from 'lucide-react';
import AdminCopySKU from '../../products/components/AdminCopySKU';

const CartItems = ({
    cart,
    handleDecrement,
    handleIncrement,
    handleRemoveItem,
    handleQuantityChange,
    formatCurrency
}) => {
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    const openRemoveModal = (productId, productName) => {
        setItemToRemove({ productId, productName });
        setShowRemoveModal(true);
    };

    const closeRemoveModal = () => {
        setShowRemoveModal(false);
        setItemToRemove(null);
    };

    const confirmRemoveItem = () => {
        if (itemToRemove) {
            handleRemoveItem(itemToRemove.productId);
            closeRemoveModal();
        }
    };

    const handleIncrementWithCheck = (productId, item) => {
        if (item.product.currentStock !== undefined && 
            item.quantity >= item.product.currentStock) {
            return;
        }
        handleIncrement(productId);
    };

    // Calculate totals
    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + item.total, 0);
    };

    const calculateTotalItems = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    return (
        <>
            <div className="flex-1 overflow-hidden flex flex-col">
                {cart.length === 0 ? (
                    <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                        <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cart is Empty</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Start typing a SKU or product name above to add items
                        </p>
                        <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                            <p>• Press Enter to quickly add first result</p>
                            <p>• Use arrow keys to navigate search results</p>
                            <p>• Press Ctrl+B to focus search</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 sticky top-0 z-10">
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <div className="col-span-5">Product</div>
                                <div className="col-span-2 text-center">Unit Price</div>
                                <div className="col-span-2 text-center">Quantity</div>
                                <div className="col-span-2 text-center">Total</div>
                                <div className="col-span-1 text-center">Actions</div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                {cart.map((item) => {
                                    const isAtStockLimit = item.product.currentStock !== undefined && 
                                        item.quantity >= item.product.currentStock;

                                    return (
                                        <div 
                                            key={item.product._id}
                                            className={`px-6 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                isAtStockLimit ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''
                                            }`}
                                        >
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                {/* Product Info */}
                                                <div className="col-span-5">
                                                    <div className="flex items-center gap-3">
                                                     
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                                    {item.product.name}
                                                                </h4>
                                                                {isAtStockLimit && (
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded">
                                                                        <AlertCircle size={10} className="mr-1" />
                                                                        Max
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <AdminCopySKU productSku={item.product.sku} />
                                                                {item.product.currentStock !== undefined && (
                                                                    <span className={`text-xs ${isAtStockLimit ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                        Stock: {item.product.currentStock}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Unit Price */}
                                                <div className="col-span-2 text-center">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatCurrency(item.unitPrice)}
                                                    </div>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="col-span-2">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => handleDecrement(item.product._id)}
                                                            className="w-8 h-8 rounded-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                                            disabled={item.quantity <= 1}
                                                            title="Decrease quantity"
                                                        >
                                                            <Minus size={14} className="text-gray-700 dark:text-gray-300" />
                                                        </button>

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={item.product.currentStock || 999}
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(item.product._id, e.target.value)}
                                                            className={`w-14 text-center px-2 py-1.5 border rounded-sm font-medium text-sm ${
                                                                isAtStockLimit
                                                                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300'
                                                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                                            }`}
                                                        />

                                                        <button
                                                            onClick={() => handleIncrementWithCheck(item.product._id, item)}
                                                            className={`w-8 h-8 rounded-sm flex items-center justify-center transition-colors ${
                                                                isAtStockLimit
                                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 cursor-not-allowed opacity-60'
                                                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                            }`}
                                                            disabled={isAtStockLimit}
                                                            title={isAtStockLimit ? "Maximum stock reached" : "Increase quantity"}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Total */}
                                                <div className="col-span-2 text-center">
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {formatCurrency(item.total)}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="col-span-1 text-center">
                                                    <button
                                                        onClick={() => openRemoveModal(item.product._id, item.product.name)}
                                                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors"
                                                        title="Remove item from cart"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary Footer */}
                        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">{calculateTotalItems()}</span> items • Subtotal: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(calculateSubtotal())}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-sm mx-1">↑</kbd> and <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-sm mx-1">↓</kbd> to navigate
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Remove Confirmation Modal */}
            {showRemoveModal && itemToRemove && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
                            Remove Item from Cart
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                            Are you sure you want to remove <span className="font-semibold text-gray-900 dark:text-white">"{itemToRemove.productName}"</span> from the cart?
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={closeRemoveModal}
                                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            
                            <button
                                onClick={confirmRemoveItem}
                                className="flex-1 px-4 py-3 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-sm font-medium transition-all hover:shadow-lg hover:shadow-red-500/20"
                            >
                                Yes, Remove Item
                            </button>
                        </div>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                            This action cannot be undone
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default CartItems;