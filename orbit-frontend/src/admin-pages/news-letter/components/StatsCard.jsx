import { UserCheck, Users, UserX, Clock } from "lucide-react";

const StatsCard = ({ isLoadingStats, stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
            {/* Total Subscribers */}
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Total Subscribers</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {isLoadingStats ? (
                                <span className="inline-block h-7 w-12 animate-pulse bg-gray-300 dark:bg-gray-700 rounded"></span>
                            ) : (
                                stats?.total || 0
                            )}
                        </p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <Users className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                </div>
            </div>

            {/* Active */}
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:border-green-200 dark:hover:border-green-500/30 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Active</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                            {isLoadingStats ? (
                                <span className="inline-block h-7 w-12 animate-pulse bg-gray-300 dark:bg-gray-700 rounded"></span>
                            ) : (
                                stats?.subscribed || 0
                            )}
                        </p>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <UserCheck className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                </div>
                {stats?.activePercentage > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {stats.activePercentage}% of total
                    </p>
                )}
            </div>

            {/* Unsubscribed */}
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:border-yellow-200 dark:hover:border-yellow-500/30 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Unsubscribed</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                            {isLoadingStats ? (
                                <span className="inline-block h-7 w-12 animate-pulse bg-gray-300 dark:bg-gray-700 rounded"></span>
                            ) : (
                                stats?.unsubscribed || 0
                            )}
                        </p>
                    </div>
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <UserX className="text-yellow-600 dark:text-yellow-400" size={20} />
                    </div>
                </div>
            </div>

            {/* Recent (30 days) */}
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:border-cyan-200 dark:hover:border-cyan-500/30 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Recent (30 days)</p>
                        <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                            {isLoadingStats ? (
                                <span className="inline-block h-7 w-12 animate-pulse bg-gray-300 dark:bg-gray-700 rounded"></span>
                            ) : (
                                stats?.recentSubscribers || 0
                            )}
                        </p>
                    </div>
                    <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded">
                        <Clock className="text-cyan-600 dark:text-cyan-400" size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;