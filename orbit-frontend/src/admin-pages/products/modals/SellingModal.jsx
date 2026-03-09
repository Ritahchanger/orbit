// SellModal.jsx - Simplified with React Query mutation only
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, X } from 'lucide-react'
import { toast } from "react-hot-toast"

import { useStoreId } from '../../../context/store/StoreContext'

import { useNavigate } from 'react-router-dom'

import {
    closeSellModal,
    updateSaleData,
    incrementQuantity,
    decrementQuantity,
    selectSaleProduct,
    selectSaleData,
    selectSaleTotals
} from '../redux/sell-modal-slice'

import { paymentMethods } from '../data'
import SaleConfirmationModal from './SellConfirmationModal'
import { useRecordSale } from '../../hooks/sales.hooks'
import { Navigate } from 'react-router-dom'

const SellModal = () => {
    const dispatch = useDispatch()
    const product = useSelector(selectSaleProduct)
    const saleData = useSelector(selectSaleData)
    const totals = useSelector(selectSaleTotals)

    const [showConfirmation, setShowConfirmation] = useState(false)

    // Use React Query mutation
    const { mutate: recordSale, isPending: isSubmitting } = useRecordSale()

    const navigate = useNavigate()

    // Calculate totals
    const calculateTotals = useMemo(() => {
        if (!product) return { subtotal: 0, total: 0, profit: 0 }
        const subtotal = (product.price || product.sellingPrice) * saleData.quantity
        const total = subtotal - saleData.discount
        const profit = ((product.price || product.sellingPrice) - (product.costPrice || product.buyingPrice || 0)) * saleData.quantity
        return { subtotal, total, profit }
    }, [product, saleData.quantity, saleData.discount])

    // Handle input changes
    const handleInputChange = (field, value) => {
        dispatch(updateSaleData({ field, value }))
    }

    // Handle select changes
    const handleSelectChange = (e) => {
        handleInputChange('paymentMethod', e.target.value)
    }

    // Handle quantity change
    const handleQuantityChange = (value) => {
        const max = product?.stock || product?.quantity || 1
        const newQuantity = Math.min(max, Math.max(1, parseInt(value) || 1))
        handleInputChange('quantity', newQuantity)
    }

    // Add this validation function at the top of your component
    const validatePhoneNumber = (phone) => {
        if (!phone || phone.trim() === '') return true; // Empty is okay (optional)

        const cleaned = phone.trim();

        // Check if starts with 01 or 07
        if (!cleaned.startsWith('01') && !cleaned.startsWith('07')) {
            return false;
        }

        // Check if exactly 10 digits
        if (cleaned.length !== 10) {
            return false;
        }

        // Check if all characters are digits
        if (!/^\d+$/.test(cleaned)) {
            return false;
        }

        return true;
    };

    // Handle discount change
    const handleDiscountChange = (value) => {
        if (value === '' || value === '0' || value === '0.') {
            handleInputChange('discount', 0)
        } else {
            const parsedValue = parseFloat(value)
            if (!isNaN(parsedValue)) {
                const max = (product?.price || product?.sellingPrice) * saleData.quantity
                const newDiscount = Math.min(max, Math.max(0, parsedValue))
                handleInputChange('discount', newDiscount)
            }
        }
    }

    // Handle sale submission
    const handleSubmitSale = () => {
        if (!product) return

        // Validation
        const errors = []

        if ((product.stock || product.quantity) < saleData.quantity) {
            errors.push(`Only ${product.stock || product.quantity} units available in stock`)
        }

        if (!saleData.customerName?.trim()) {
            errors.push('Customer name is required')
        }

        // Phone validation only if provided
        if (saleData.customerPhone?.trim()) {
            if (!validatePhoneNumber(saleData.customerPhone.trim())) {
                errors.push('Phone number must start with 01 or 07 and be exactly 10 digits (e.g., 0712345678)')
            }
        }

        // Phone is required for M-Pesa
        if (saleData.paymentMethod === 'mpesa') {
            if (!saleData.customerPhone?.trim()) {
                errors.push('Phone number is required for M-Pesa payments')
            } else if (!validatePhoneNumber(saleData.customerPhone.trim())) {
                errors.push('M-Pesa phone number must start with 01 or 07 and be exactly 10 digits (e.g., 0712345678)')
            }
        }

        if (errors.length > 0) {
            toast.error(errors.join('. '))
            return
        }

        // Show confirmation modal
        setShowConfirmation(true)
    }

    const handleConfirmedSale = () => {
        if (!product) return
        const salePayload = {
            productId: product._id || product.id,
            quantity: saleData.quantity,
            paymentMethod: saleData.paymentMethod,
            customerName: saleData.customerName.trim(),
            customerPhone: saleData.customerPhone?.trim() || '',
            discount: saleData.discount,
            notes: saleData.notes || '',
        }

        console.log(salePayload)

        // Use React Query mutation instead of Redux thunk
        recordSale(salePayload, {
            onSuccess: (data) => {
                // Success - close both modals first
                setShowConfirmation(false)
                dispatch(closeSellModal())

                // Add a small delay to ensure modals are unmounted
                setTimeout(() => {
                    navigate("/admin/dashboard")
                }, 50) // 50ms delay
            },
            onError: (error) => {
                setShowConfirmation(false)
            }
        })
    }

    // If no product or modal is closed, don't render
    if (!product) return null


    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 z-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sell Product</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {product.name}
                            </p>
                        </div>
                        <button
                            onClick={() => dispatch(closeSellModal())}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Product Info */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">{product.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{product.sku}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-900 dark:text-white font-medium">
                                    KSh {product.sellingPrice?.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Stock: {product.quantity} units
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                            Quantity
                        </label>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => dispatch(decrementQuantity())}
                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={saleData.quantity <= 1}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="1"
                                max={product.quantity}
                                value={saleData.quantity}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                                className="w-20 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-center placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            <button
                                onClick={() => dispatch(incrementQuantity())}
                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={saleData.quantity >= product.quantity}
                            >
                                +
                            </button>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                Max: {product.quantity} units
                            </span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                            Payment Method
                        </label>
                        <select
                            value={saleData.paymentMethod}
                            onChange={handleSelectChange}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        >
                            {paymentMethods.filter(p => p.id !== 'all').map(method => (
                                <option key={method.id} value={method.id}>
                                    {method.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                value={saleData.customerName || ''}
                                onChange={(e) => handleInputChange('customerName', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={saleData.customerPhone || ''}
                                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="0712345678"
                            />
                        </div>
                    </div>

                    {/* Discount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                            Discount (KSh)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 dark:text-gray-400">KSh</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                max={product.sellingPrice * saleData.quantity}
                                value={saleData.discount === 0 ? '' : saleData.discount}
                                onChange={(e) => handleDiscountChange(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-12 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="text-gray-900 dark:text-white">
                                KSh {calculateTotals.subtotal.toLocaleString()}
                            </span>
                        </div>
                        {saleData.discount > 0 && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                                <span className="text-red-600 dark:text-red-400">
                                    - KSh {saleData.discount.toLocaleString()}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-800">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                            <span className="text-lg font-bold text-primary dark:text-primary">
                                KSh {calculateTotals.total.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end space-x-3">
                    <button
                        onClick={() => dispatch(closeSellModal())}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmitSale}
                        disabled={!saleData.customerName?.trim()}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart size={16} />
                        <span>Continue to Review</span>
                    </button>
                </div>
            </div>

            <SaleConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                saleData={saleData}
                product={product}
                handleConfirmedSale={handleConfirmedSale}
                totals={calculateTotals}
            />
        </div>
    )
}

export default SellModal