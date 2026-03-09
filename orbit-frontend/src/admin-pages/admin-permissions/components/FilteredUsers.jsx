import { Users } from "lucide-react"
import CustomerAvatar from "../../customers/CustomerAvatar"

const FilteredUsers = ({ usersLoading, filteredUsers, setSelectedUser, selectedUser }) => {
    return (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {usersLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                    ))}
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-500" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No users found</p>
                </div>
            ) : (
                filteredUsers.map(user => (
                    <button
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full text-left p-3 rounded-sm transition-colors border ${selectedUser?._id === user._id
                            ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <CustomerAvatar
                                    name={`${user.firstName.charAt(0) || ''} ${user.lastName.charAt(0) || ''}`.trim()}
                                    size="sm"
                                    className="shrink-0"
                                />
                                <div className="ml-3">
                                    <div className="font-medium text-sm">
                                        {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                            <div className={`px-2 py-1 text-xs rounded-sm font-medium ${user.role === 'superadmin'
                                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                : user.role === 'admin'
                                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-400'
                                }`}>
                                {user.role}
                            </div>
                        </div>
                        {user.permissions?.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                {user.permissions.length} permissions assigned
                            </div>
                        )}
                    </button>
                ))
            )}
        </div>
    )
}

export default FilteredUsers