const AdminManualSaleModal = ({newSale,storeProducts,setNewSale,handleAddManualSale,setShowAddModal}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-dark-light border border-gray-800 rounded-sm p-6 w-full max-w-lg">
                <h3 className="text-lg font-heading font-semibold text-white mb-4">Add Manual Sale</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Select Gaming Device</label>
                        <select
                            value={newSale.productId}
                            onChange={(e) => setNewSale({ ...newSale, productId: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                        >
                            <option value="">Select a device</option>
                            {storeProducts.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} (Stock: {product.quantity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Quantity</label>
                            <input
                                type="number"
                                value={newSale.quantity}
                                onChange={(e) => setNewSale({ ...newSale, quantity: parseInt(e.target.value) || 1 })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Payment Method</label>
                            <select
                                value={newSale.paymentMethod}
                                onChange={(e) => setNewSale({ ...newSale, paymentMethod: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                            >
                                <option value="cash">Cash</option>
                                <option value="paybill">PayBill</option>
                                <option value="card">Credit Card</option>
                                <option value="installment">Installment Plan</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Customer Name</label>
                        <input
                            type="text"
                            value={newSale.customerName}
                            onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                            placeholder="Enter customer name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Customer Phone (Optional)</label>
                        <input
                            type="tel"
                            value={newSale.customerPhone}
                            onChange={(e) => setNewSale({ ...newSale, customerPhone: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                            placeholder="0712345678"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Discount (KSh)</label>
                            <input
                                type="number"
                                value={newSale.discount}
                                onChange={(e) => setNewSale({ ...newSale, discount: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Final Amount</label>
                            <div className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white">
                                KSh {newSale.productId ? (storeProducts.find(p => p.id === parseInt(newSale.productId))?.sellingPrice * newSale.quantity - newSale.discount || 0) : 0}
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={handleAddManualSale}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-sm hover:bg-blue-600"
                        >
                            Record Sale
                        </button>
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 border border-gray-700 rounded-sm hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminManualSaleModal