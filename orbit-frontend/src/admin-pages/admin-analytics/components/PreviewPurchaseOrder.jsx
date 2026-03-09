const PreviewPurchaseOrder = ({ purchaseOrder }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-300 dark:border-gray-600 rounded-sm p-4 mb-6 font-mono text-sm">
            <div className="text-center border-b border-gray-300 dark:border-gray-700 pb-3 mb-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">PURCHASE ORDER</h4>
                <p className="text-gray-600 dark:text-gray-400">{purchaseOrder.poNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">FROM:</p>
                    <p className="text-gray-900 dark:text-white font-medium">{purchaseOrder.store.name}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{purchaseOrder.store.address}</p>
                </div>
                <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">TO:</p>
                    <p className="text-gray-900 dark:text-white font-medium">{purchaseOrder.supplier.name}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{purchaseOrder.supplier.address}</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-300 dark:border-gray-700">
                            <th className="py-2 text-gray-700 dark:text-gray-400 text-xs font-medium">#</th>
                            <th className="py-2 text-gray-700 dark:text-gray-400 text-xs font-medium">Product</th>
                            <th className="py-2 text-gray-700 dark:text-gray-400 text-xs font-medium">Qty</th>
                            <th className="py-2 text-gray-700 dark:text-gray-400 text-xs font-medium">Unit Price</th>
                            <th className="py-2 text-gray-700 dark:text-gray-400 text-xs font-medium">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseOrder.items.slice(0, 3).map(item => (
                            <tr key={item.id} className="border-b border-gray-200 dark:border-gray-600">
                                <td className="py-2 text-gray-700 dark:text-gray-300">{item.id}</td>
                                <td className="py-2 text-gray-900 dark:text-white">
                                    <div className="truncate max-w-[120px]" title={item.name}>
                                        {item.name.substring(0, 20)}...
                                    </div>
                                </td>
                                <td className="py-2 text-gray-700 dark:text-gray-300">{item.quantity}</td>
                                <td className="py-2 text-gray-700 dark:text-gray-300">
                                    KES {item.unitPrice.toLocaleString('en-KE')}
                                </td>
                                <td className="py-2 text-green-700 dark:text-green-400 font-medium">
                                    KES {item.lineTotal.toLocaleString('en-KE')}
                                </td>
                            </tr>
                        ))}
                        {purchaseOrder.items.length > 3 && (
                            <tr>
                                <td colSpan="5" className="py-2 text-center text-gray-600 dark:text-gray-500 text-xs italic">
                                    ... and {purchaseOrder.items.length - 3} more items
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Total Items: </span>
                        <span className="text-gray-900 dark:text-white font-medium">{purchaseOrder.summary.itemCount}</span>
                    </div>
                    <div className="text-right">
                        <div className="text-gray-600 dark:text-gray-400 text-xs">Total Amount:</div>
                        <div className="text-blue-600 dark:text-blue-500 font-bold text-lg">
                            KES {purchaseOrder.summary.totalAmount.toLocaleString('en-KE')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PreviewPurchaseOrder;