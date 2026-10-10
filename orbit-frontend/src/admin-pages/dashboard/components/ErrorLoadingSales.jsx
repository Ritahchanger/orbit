import AdminLayout from "../layout/Layout"
import { BarChart3 } from "lucide-react"
const ErrorLoadingSales = ({ error, refetch }) => {
    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 flex items-center justify-center">
                <div className="text-center bg-white dark:bg-gray-800 border border-red-200 dark:border-red-500/30 p-6 rounded-sm max-w-md">
                    <BarChart3 className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-red-600 dark:text-red-400 font-semibold mb-2">Failed to load sales data</h3>
                    <p className="text-gray-600 dark:text-gray-400">{error?.message || "Please try again later"}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-sm transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        </AdminLayout>
    )
}

export default ErrorLoadingSales