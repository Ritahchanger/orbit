// components/SaleConfirmationModal.jsx
import { useState, useRef, useEffect } from 'react'
import { useOptimisticRecordSale } from '../../hooks/sales.hooks'
import { useQueryClient } from '@tanstack/react-query' // ADD THIS
import { CheckCircle, XCircle, DollarSign, Package, User, CreditCard, Move, Loader2 } from 'lucide-react'
import Draggable from "react-draggable"

import { closeSellModal } from '../redux/sell-modal-slice'

import { useDispatch } from 'react-redux'

const SaleConfirmationModal = ({
    isOpen,
    onClose,
    saleData,
    product,
    totals
}) => {
    const [isMaximized] = useState(false)
    const [dragDisabled, setDragDisabled] = useState(false)
    const nodeRef = useRef(null)
    const modalRef = useRef(null)

    const dispatch = useDispatch();

    // ✅ ADD QueryClient for cache updates
    const queryClient = useQueryClient()

    // Use the mutation hook
    const recordSaleMutation = useOptimisticRecordSale(); // or useRecordSale()
    const { isPending, isError, error } = recordSaleMutation;

    // Close modal on ESC key
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscKey)
        return () => document.removeEventListener('keydown', handleEscKey)
    }, [isOpen, onClose])

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    const handleConfirmSale = async () => {
        if (!product) return;

        // Prepare sale payload
        const salePayload = {
            productId: product._id || product.id,
            productName: product.name,
            sku: product.sku,
            quantity: saleData.quantity,
            unitPrice: product.sellingPrice || product.price,
            discount: saleData.discount || 0,
            subtotal: totals?.subtotal || (product.sellingPrice * saleData.quantity),
            total: totals?.total || ((product.sellingPrice * saleData.quantity) - (saleData.discount || 0)),
            profit: (product.sellingPrice - (product.buyingPrice || product.costPrice || 0)) * saleData.quantity,
            paymentMethod: saleData.paymentMethod,
            customerName: saleData.customerName,
            customerPhone: saleData.customerPhone,
            notes: saleData.notes
        };

        try {
            // ✅ IMPORTANT: Optimistically update the cache BEFORE the API call
            queryClient.setQueryData(
                ['products'], // Your product query key
                (oldData) => {
                    if (!oldData) return oldData

                    // Update the specific product's stock
                    return {
                        ...oldData,
                        products: oldData.products.map(p =>
                            p._id === product._id || p.id === product.id
                                ? {
                                    ...p,
                                    stock: p.stock - saleData.quantity,
                                    quantity: p.quantity - saleData.quantity, // Update both stock and quantity
                                    totalSold: (p.totalSold || 0) + saleData.quantity,
                                    status: p.quantity - saleData.quantity <= 0 ? 'Out of Stock' :
                                        p.quantity - saleData.quantity <= (p.minStock || 5) ? 'Low Stock' :
                                            'In Stock'
                                }
                                : p
                        )
                    }
                }
            );

            // Trigger the mutation
            await recordSaleMutation.mutateAsync(salePayload);

            // ✅ Refresh all product-related queries
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['low-stock'] })
            queryClient.invalidateQueries({ queryKey: ['product-stats'] })

            // Close modal on success
            setTimeout(() => {
                onClose();

                dispatch(closeSellModal())

            }, 500);

        } catch (error) {
            // ✅ Rollback on error
            queryClient.invalidateQueries({ queryKey: ['products'] })
            console.error('Sale failed:', error);
        }
    }

    if (!isOpen || !product) return null

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />

            {/* Draggable Modal Container */}
            <Draggable
                nodeRef={nodeRef}
                handle=".drag-handle"
                bounds="parent"
                disabled={dragDisabled || isMaximized}
                defaultPosition={{ x: window.innerWidth / 2 - 290, y: window.innerHeight / 2 - 300 }}
                onStart={() => setDragDisabled(false)}
            >
                <div
                    ref={nodeRef}
                    className="absolute"
                    style={{ transform: 'none' }}
                >
                    <div
                        ref={modalRef}
                        className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-2xl transition-all duration-200 ${isMaximized
                            ? 'w-[95vw] h-[95vh]'
                            : 'w-full max-w-[580px] max-h-[90vh]'
                            }`}
                    >
                        {/* Header with drag handle */}
                        <div className="drag-handle border-b border-gray-200 dark:border-gray-800 p-4 cursor-move select-none hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors active:cursor-grabbing">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary/20 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="h-6 w-6 text-primary dark:text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Sale</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {isMaximized ? 'Maximized - Click minimize to drag' : 'Drag header to move • Click outside to close'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {/* Drag indicator */}
                                    <Move className="h-5 w-5 text-gray-400 dark:text-gray-500" />

                                    {/* Close button */}
                                    <button
                                        onClick={onClose}
                                        disabled={isPending}
                                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                        title="Close"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className={`p-4 space-y-4 overflow-y-auto ${isMaximized ? 'h-[calc(95vh-8rem)]' : 'max-h-[60vh]'}`}>
                            {/* Loading overlay */}
                            {isPending && (
                                <div className="absolute inset-0 bg-black/70 dark:bg-black/80 z-10 flex items-center justify-center rounded-lg">
                                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg flex flex-col items-center space-y-4 shadow-xl">
                                        <Loader2 className="h-12 w-12 text-primary dark:text-primary animate-spin" />
                                        <p className="text-gray-900 dark:text-white font-medium">Processing sale...</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Updating inventory and recording transaction</p>
                                    </div>
                                </div>
                            )}

                            {/* Error message */}
                            {isError && (
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                                        <div>
                                            <h4 className="text-red-600 dark:text-red-400 font-medium mb-1">Sale Failed</h4>
                                            <p className="text-red-600/90 dark:text-red-400/90 text-sm">
                                                {error?.response?.data?.message || 'Failed to process sale. Please try again.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Product Details */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Package className="h-5 w-5 text-primary dark:text-primary" />
                                    <h4 className="text-gray-900 dark:text-white font-medium">Product Details</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Product</p>
                                        <p className="text-gray-900 dark:text-white font-medium text-base">{product.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">SKU</p>
                                        <code className="text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{product.sku}</code>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Quantity</p>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-900 dark:text-white font-medium text-base">{saleData.quantity} units</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                ({product.quantity} in stock → {product.quantity - saleData.quantity} after sale)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Unit Price</p>
                                        <p className="text-gray-900 dark:text-white font-medium text-base">KSh {product.sellingPrice?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3 mb-4">
                                    <User className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                                    <h4 className="text-gray-900 dark:text-white font-medium">Customer Details</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Name</p>
                                        <p className="text-gray-900 dark:text-white font-medium text-base">
                                            {saleData.customerName || <span className="text-yellow-600 dark:text-yellow-400 italic">Not provided</span>}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Phone</p>
                                        <p className="text-gray-900 dark:text-white font-medium text-base">
                                            {saleData.customerPhone || <span className="text-yellow-600 dark:text-yellow-400 italic">Not provided</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3 mb-4">
                                    <CreditCard className="h-5 w-5 text-green-600 dark:text-green-500" />
                                    <h4 className="text-gray-900 dark:text-white font-medium">Payment Details</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Method</p>
                                        <p className="text-gray-900 dark:text-white font-medium text-base capitalize px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg inline-block">
                                            {saleData.paymentMethod === 'mpesa' ? 'M-Pesa' :
                                                saleData.paymentMethod === 'cash' ? 'Cash' :
                                                    saleData.paymentMethod === 'paybill' ? 'PayBill' :
                                                        saleData.paymentMethod === 'card' ? 'Credit Card' :
                                                            saleData.paymentMethod === 'installment' ? 'Installment' :
                                                                saleData.paymentMethod}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Discount</p>
                                        <p className="text-gray-900 dark:text-white font-medium text-base">
                                            KSh {saleData.discount?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                </div>
                                {saleData.notes && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-2">Notes</p>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm italic bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg">
                                            {saleData.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Total Summary */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6 rounded-lg border border-gray-300 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                                        <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                                        <div>
                                            <h4 className="text-gray-900 dark:text-white font-semibold text-lg">Total Amount</h4>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">Including all charges</p>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-bold text-primary dark:text-primary">
                                        KSh {totals?.total?.toLocaleString() || '0'}
                                    </span>
                                </div>

                                <div className="space-y-3 text-sm bg-gray-200/50 dark:bg-gray-800/30 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                        <span className="text-gray-900 dark:text-white font-medium">KSh {totals?.subtotal?.toLocaleString() || '0'}</span>
                                    </div>
                                    {saleData.discount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                                            <span className="text-red-600 dark:text-red-400 font-medium">
                                                - KSh {saleData.discount?.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-300 dark:border-gray-700">
                                        <div>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">Stock After Sale:</span>
                                            <p className="text-gray-500 dark:text-gray-500 text-xs">
                                                Current: {product.quantity} → After: {product.quantity - saleData.quantity}
                                            </p>
                                        </div>
                                        <span className={`font-bold ${product.quantity - saleData.quantity <= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                            {product.quantity - saleData.quantity} units
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Warning if stock goes low */}
                            {product.quantity - saleData.quantity <= product.minStock && (
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 border border-yellow-200 dark:border-yellow-500/20 p-4 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <XCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-yellow-700 dark:text-yellow-400 font-medium mb-1">Low Stock Warning</h4>
                                            <p className="text-yellow-700/90 dark:text-yellow-400/90 text-sm">
                                                Stock will be reduced to <span className="font-bold">{product.quantity - saleData.quantity} units</span> after this sale.
                                            </p>
                                            <p className="text-yellow-700/70 dark:text-yellow-400/70 text-xs mt-2">
                                                {product.quantity - saleData.quantity <= 0
                                                    ? '⚠️ Product will be out of stock! Consider restocking immediately.'
                                                    : product.quantity - saleData.quantity <= product.minStock
                                                        ? '⚠️ Stock is below minimum threshold. Consider restocking soon.'
                                                        : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={onClose}
                                        disabled={isPending}
                                        className="px-5 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm flex items-center space-x-2 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle size={16} />
                                        <span>Cancel</span>
                                    </button>

                                    <button
                                        onClick={onClose}
                                        disabled={isPending}
                                        className="px-5 py-2 text-gray-700 dark:text-gray-300 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-600 dark:to-emerald-600 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-700 dark:hover:to-emerald-700 hover:text-gray-900 dark:hover:text-white rounded-sm transition-colors disabled:opacity-50"
                                    >
                                        Edit Details
                                    </button>

                                    <button
                                        onClick={handleConfirmSale}
                                        disabled={isPending}
                                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-600 dark:to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-700 text-white rounded-sm font-medium flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={16} />
                                                <span className="font-semibold">Confirm & Process Sale</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Draggable>
        </div>
    )
}

export default SaleConfirmationModal