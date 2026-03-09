import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
} from 'lucide-react';

const StatsCardConsultations = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-2">
            {/* Total Consultations */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
                        Total
                    </span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Consultations</p>
                </div>
            </div>

            {/* Pending */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-1 rounded-full">
                        Pending
                    </span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.pending}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting Response</p>
                </div>
            </div>

            {/* Completed */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
                        Completed
                    </span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.completed}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Successfully Done</p>
                </div>
            </div>

            {/* Cancelled */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 px-2.5 py-1 rounded-full">
                        Cancelled
                    </span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.cancelled}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Not Completed</p>
                </div>
            </div>

            {/* Confirmed */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                        <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2.5 py-1 rounded-full">
                        Confirmed
                    </span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.confirmed}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
                </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">
                        Conversion
                    </span>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.conversionRate}%</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                                style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            Rate
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatsCardConsultations;