const AdminTopSellingProducts = ({storeProducts}) => {
    return (
        <div className="bg-dark-light border border-gray-800 rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-900/50">
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Rank</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Device</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Total Sold</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Total Revenue</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Avg. Price</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Stock Status</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {storeProducts
                            .sort((a, b) => b.totalSold - a.totalSold)
                            .slice(0, 10)
                            .map((product, index) => (
                                <tr key={product.id} className="border-t border-gray-800 hover:bg-gray-900/30">
                                    <td className="py-4 px-4">
                                        <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${index < 3 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-400'}`}>
                                            <span className="font-bold">#{index + 1}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div>
                                            <p className="font-medium text-white">{product.name}</p>
                                            <p className="text-sm text-gray-400">{product.brand}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-white text-lg font-semibold">{product.totalSold}</p>
                                        <p className="text-xs text-gray-400">units</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-white">KSh {product.totalRevenue?.toLocaleString() || '0'}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-white">KSh {product.sellingPrice.toLocaleString()}</p>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AdminTopSellingProducts