
import { useModal } from "../../../context/modal-context/ModalContext";

const ShowRoleModal = ({
    selectedUser,
    setShowRoleModal,
    setNewRole,
    handleUpdateRole,
    newRole,
    updateUserRoleMutation,
    roles
}) => {
    const { openModal } = useModal();

    const getRoleName = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : roleId;
    };

    const handleRoleChange = async () => {
        if (!newRole) return;
        
        openModal({
            title: "Confirm Role Change",
            message: (
                <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-300">
                        You are about to change <strong className="text-gray-900 dark:text-white">{selectedUser.firstName} {selectedUser.lastName}</strong>'s role.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">From:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{selectedUser.role}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-gray-600 dark:text-gray-400">To:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{getRoleName(newRole)}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        This change will affect the user's permissions and access levels.
                    </p>
                </div>
            ),
            type: "warning",
            confirmText: "Update Role",
            cancelText: "Cancel",
            onConfirm: async () => {
                await handleUpdateRole();
                setShowRoleModal(false);
                setNewRole('');
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-6 max-w-md w-full shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Change User Role
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Current role: <span className="font-medium text-gray-900 dark:text-white">{selectedUser.role}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    User: <strong className="text-gray-900 dark:text-white">{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email})
                </p>
                
                {/* Role Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Role
                    </label>
                    <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    >
                        <option value="" className="text-gray-500 dark:text-gray-400">
                            Select a role
                        </option>
                        {roles.map(role => (
                            <option 
                                key={role.id} 
                                value={role.id}
                                className="text-gray-900 dark:text-white"
                            >
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => {
                            setShowRoleModal(false);
                            setNewRole('');
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-sm transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRoleChange}
                        disabled={!newRole || updateUserRoleMutation.isPending}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {updateUserRoleMutation.isPending ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </>
                        ) : 'Update Role'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowRoleModal;