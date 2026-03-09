const AdminReportsDataTable = () => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-900/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Product/Service
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Revenue
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Growth
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {[1, 2, 3, 4, 5].map((row, index) => (
                        <tr key={index} className="hover:bg-gray-900/30">
                            <td className="px-4 py-3 text-white">Product {String.fromCharCode(65 + index)}</td>
                            <td className="px-4 py-3 text-gray-300">{(index + 1) * 25}</td>
                            <td className="px-4 py-3 text-gray-300">KSh {((index + 1) * 15000).toLocaleString()}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-sm text-xs ${index % 3 === 0 ? 'bg-green-500/20 text-green-400' :
                                    index % 3 === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                    {index % 3 === 0 ? '+15.2%' : index % 3 === 1 ? '+2.1%' : '-5.8%'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AdminReportsDataTable