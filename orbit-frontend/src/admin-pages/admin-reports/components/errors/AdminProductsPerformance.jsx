import { AlertCircle } from "lucide-react"
const AdminProductsPerformanceError = ({refetchProducts}) => {
    return (
        <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                Error Loading Data
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Failed to load product performance data
            </p>
            <button
                onClick={() => refetchProducts()}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
                Retry
            </button>
        </div>
    )
}

export default AdminProductsPerformanceError