import { Plus } from "lucide-react"

const SelectedUserInfo = ({ selectedUser, setShowAssignModal }) => {
    return (
        <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Selected User</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {selectedUser.firstName} {selectedUser.lastName}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Email:</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[200px]">
                        {selectedUser.email}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Role:</span>
                    <span className={`px-2 py-1 text-xs rounded-sm font-medium ${selectedUser.role === 'superadmin'
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                        : selectedUser.role === 'admin'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-400'
                        }`}>
                        {selectedUser.role}
                    </span>
                </div>
                <button
                    onClick={() => setShowAssignModal(true)}
                    disabled={!selectedUser}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    <span>Assign New Permission</span>
                </button>
            </div>
        </div>
    )
}

export default SelectedUserInfo