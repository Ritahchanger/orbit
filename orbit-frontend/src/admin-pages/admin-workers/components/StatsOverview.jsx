import { StatsSkeletonLoader } from "../preloaders/UsersPreloader"
import {
    Users,
    Shield,
    Store,
    Mail
} from 'lucide-react';

const StatsOverview = ({statsLoading,stats}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
            {statsLoading ? (
                <StatsSkeletonLoader />
            ) : (
                <>
                    {/* Total Users Card */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalUsers || 0}
                                </p>
                            </div>
                            <Users className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                            +{stats.recentUsers || 0} this week
                        </div>
                    </div>

                    {/* Admins Card */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Admins</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.adminUsers || 0}
                                </p>
                            </div>
                            <Shield className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            {stats.superAdminUsers || 0} super admins
                        </div>
                    </div>

                    {/* Store Access Card */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Store Access</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.usersWithStores || 0}
                                </p>
                            </div>
                            <Store className="text-yellow-600 dark:text-yellow-400" size={24} />
                        </div>
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            With store assignments
                        </div>
                    </div>

                    {/* Newsletter Card */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Newsletter</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.newsletterSubscribers || 0}
                                </p>
                            </div>
                            <Mail className="text-purple-600 dark:text-purple-400" size={24} />
                        </div>
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            Subscribed users
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default StatsOverview