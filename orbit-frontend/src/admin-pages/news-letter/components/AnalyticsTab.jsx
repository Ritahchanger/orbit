import { BarChart3, Users, Download } from "lucide-react"
import { toast } from "react-hot-toast"

const AnalyticsTab = ({ stats }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Analytics Dashboard</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Engagement Stats */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-sm border border-gray-300 dark:border-gray-700">
                        <h4 className="text-gray-900 dark:text-white font-medium mb-3">Engagement Rate</h4>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {stats?.activePercentage || 0}%
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active subscribers</p>
                            </div>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                <BarChart3 size={28} className="text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    {/* Recent Growth */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-sm border border-gray-300 dark:border-gray-700">
                        <h4 className="text-gray-900 dark:text-white font-medium mb-3">Recent Growth</h4>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                                    +{stats?.recentSubscribers || 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last 30 days</p>
                            </div>
                            <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded">
                                <Users size={28} className="text-cyan-600 dark:text-cyan-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Data */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-sm border border-gray-300 dark:border-gray-700">
                    <h4 className="text-gray-900 dark:text-white font-medium mb-3">Export Data</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => {
                                // TODO: Implement CSV export
                                toast.success('Export functionality coming soon');
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-sm hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                        >
                            <Download size={16} />
                            Export Subscribers
                        </button>
                        <button
                            onClick={() => {
                                // TODO: Implement report generation
                                toast.success('Report generation coming soon');
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-sm hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-all"
                        >
                            <BarChart3 size={16} />
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsTab