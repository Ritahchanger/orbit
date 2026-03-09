import { Users, UserCheck, Shield } from "lucide-react"

const StatsOverview = ({userStats}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
            {/* Total Users */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.total}</p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-sm">
                        <Users className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                </div>
            </div>

            {/* With Permissions */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">With Permissions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.withPermissions}</p>
                    </div>
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-sm">
                        <UserCheck className="text-emerald-600 dark:text-emerald-400" size={20} />
                    </div>
                </div>
            </div>

            {/* Super Admins */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Super Admins</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.superAdmins}</p>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-sm">
                        <Shield className="text-purple-600 dark:text-purple-400" size={20} />
                    </div>
                </div>
            </div>

            {/* Admins */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Admins</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.admins}</p>
                    </div>
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-sm">
                        <Shield className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StatsOverview