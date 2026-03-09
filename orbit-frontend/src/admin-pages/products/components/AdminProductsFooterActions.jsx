import { Printer, Download } from "lucide-react"

const AdminProductsFooterActions = ({ activeTab, filteredProducts, filteredSales, storeProducts }) => {
    return (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-500">
                Showing {activeTab === 'all' ? filteredProducts.length : activeTab === 'daily' ? filteredSales.length : storeProducts.length} items
            </div>
            <div className="flex space-x-3">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 text-sm md:text-lg transition-colors">
                    <Printer className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">Print Report</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 text-sm md:text-lg transition-colors">
                    <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">Export Data</span>
                </button>
            </div>
        </div>
    )
}

export default AdminProductsFooterActions