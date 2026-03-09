import { XCircle, DollarSign, CheckCircle, BarChart3 } from "lucide-react"

const StatsConsultationTypes = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                <div className="flex items-center justify-between">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Types</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                <div className="flex items-center justify-between">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.active}</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                <div className="flex items-center justify-between">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Inactive</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.inactive}</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                <div className="flex items-center justify-between">
                    <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Free / Paid</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.free} / {stats.paid}</h3>
            </div>
        </div>
    )
}

export default StatsConsultationTypes