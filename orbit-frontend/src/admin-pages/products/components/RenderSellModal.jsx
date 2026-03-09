const RenderSellModal = () => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-light border border-gray-800 rounded-sm w-full max-w-md">
                {/* Header */}
                <div className="border-b border-gray-800 p-4">
                    <h3 className="text-lg font-semibold text-white">Sell Product</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        {selectedProductForSale?.name}
                    </p>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Product Info */}
                    <div className="bg-gray-900/50 p-3 rounded-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-white font-medium">{selectedProductForSale?.name}</p>
                                <p className="text-sm text-gray-400">{selectedProductForSale?.sku}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-medium">
                                    KSh {selectedProductForSale?.sellingPrice?.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Stock: {selectedProductForSale?.quantity} units
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Quantity
                        </label>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSaleData(prev => ({
                                    ...prev,
                                    quantity: Math.max(1, prev.quantity - 1)
                                }))}
                                className="w-8 h-8 rounded-sm bg-gray-900 flex items-center justify-center text-white hover:bg-gray-800"
                                disabled={saleData.quantity <= 1}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="1"
                                max={selectedProductForSale?.quantity}
                                value={saleData.quantity}
                                onChange={(e) => setSaleData(prev => ({
                                    ...prev,
                                    quantity: Math.min(
                                        selectedProductForSale?.quantity || 1,
                                        Math.max(1, parseInt(e.target.value) || 1)
                                    )
                                }))}
                                className="w-20 px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white text-center"
                            />
                            <button
                                onClick={() => setSaleData(prev => ({
                                    ...prev,
                                    quantity: Math.min(
                                        selectedProductForSale?.quantity || 1,
                                        prev.quantity + 1
                                    )
                                }))}
                                className="w-8 h-8 rounded-sm bg-gray-900 flex items-center justify-center text-white hover:bg-gray-800"
                                disabled={saleData.quantity >= (selectedProductForSale?.quantity || 1)}
                            >
                                +
                            </button>
                            <span className="text-sm text-gray-400 ml-2">
                                Max: {selectedProductForSale?.quantity} units
                            </span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Payment Method
                        </label>
                        <select
                            value={saleData.paymentMethod}
                            onChange={(e) => setSaleData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
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
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                value={saleData.customerName}
                                onChange={(e) => setSaleData(prev => ({ ...prev, customerName: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={saleData.customerPhone}
                                onChange={(e) => setSaleData(prev => ({ ...prev, customerPhone: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                                placeholder="0712345678"
                            />
                        </div>
                    </div>

                    {/* Discount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Discount (KSh)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max={selectedProductForSale?.sellingPrice * saleData.quantity}
                            value={saleData.discount}
                            onChange={(e) => setSaleData(prev => ({
                                ...prev,
                                discount: Math.min(
                                    selectedProductForSale?.sellingPrice * prev.quantity,
                                    Math.max(0, parseFloat(e.target.value) || 0)
                                )
                            }))}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={saleData.notes}
                            onChange={(e) => setSaleData(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                            rows="2"
                            placeholder="Additional notes about this sale..."
                        />
                    </div>

                    {/* Total Summary */}
                    <div className="bg-gray-900/50 p-4 rounded-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400">Subtotal:</span>
                            <span className="text-white">
                                KSh {(selectedProductForSale?.sellingPrice * saleData.quantity).toLocaleString()}
                            </span>
                        </div>
                        {saleData.discount > 0 && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Discount:</span>
                                <span className="text-red-400">
                                    - KSh {saleData.discount.toLocaleString()}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                            <span className="text-lg font-semibold text-white">Total:</span>
                            <span className="text-lg font-bold text-primary">
                                KSh {calculateTotal().toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-800 p-4 flex justify-end space-x-3">
                    <button
                        onClick={() => {
                            setShowSellModal(false)
                            setSelectedProductForSale(null)
                        }}
                        className="px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmitSale}
                        className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-sm font-medium flex items-center space-x-2"
                    >
                        <ShoppingCart size={16} />
                        <span>Complete Sale</span>
                    </button>
                </div>
            </div>
        </div>
    )
}