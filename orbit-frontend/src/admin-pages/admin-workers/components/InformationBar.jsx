import { Globe, Shield } from "lucide-react"

const InformationBar = ({ usersLoading, filteredUsers }) => {
    return (
        <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                {/* Left side - Global badge */}
                <div className="flex items-center space-x-2">
                    <Globe size={16} className="text-purple-600 dark:text-purple-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Global Users Management
                    </span>
                </div>
                
                {/* Right side - Info and count */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    {/* Admin access badge */}
                    <div className="flex items-center space-x-2">
                        <Shield size={14} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Admin Access Required
                        </span>
                    </div>
                    
                    {/* User count badge */}
                    <div className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-sm font-medium">
                        {usersLoading ? 'Loading...' : `${filteredUsers.length} users displayed`}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InformationBar