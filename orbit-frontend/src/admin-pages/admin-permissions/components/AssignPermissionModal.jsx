import { X, Globe, Store } from "lucide-react"
const AssignPermissionModal = ({ setShowAssignModal, selectedUser, permissionData, setPermissionData, allPermissions, handleAssignPermission, assignMutation }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-sm p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Assign Permission</h3>
                    <button
                        onClick={() => setShowAssignModal(false)}
                        className="p-1 hover:bg-gray-700 rounded"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-gray-300 mb-2">
                            Assigning to: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Permission</label>
                        <select
                            value={permissionData.permission}
                            onChange={(e) => setPermissionData(prev => ({ ...prev, permission: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a permission</option>
                            {allPermissions.map(perm => (
                                <option key={perm._id} value={perm.key}>
                                    {perm.key.replace('.', ' - ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>
                        {permissionData.permission && (
                            <p className="text-xs text-gray-400 mt-1">
                                {allPermissions.find(p => p.key === permissionData.permission)?.description}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Scope</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="global"
                                    checked={permissionData.scope === 'global'}
                                    onChange={(e) => setPermissionData(prev => ({ ...prev, scope: e.target.value }))}
                                    className="mr-2"
                                />
                                <span className="flex items-center">
                                    <Globe size={14} className="mr-1" /> Global
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="store"
                                    checked={permissionData.scope === 'store'}
                                    onChange={(e) => setPermissionData(prev => ({ ...prev, scope: e.target.value }))}
                                    className="mr-2"
                                />
                                <span className="flex items-center">
                                    <Store size={14} className="mr-1" /> Store
                                </span>
                            </label>
                        </div>
                    </div>

                    {permissionData.scope === 'store' && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Store ID</label>
                            <input
                                type="text"
                                value={permissionData.storeId}
                                onChange={(e) => setPermissionData(prev => ({ ...prev, storeId: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-sm text-white"
                                placeholder="Enter store ID"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={() => setShowAssignModal(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssignPermission}
                        disabled={!permissionData.permission || (permissionData.scope === 'store' && !permissionData.storeId) || assignMutation?.isPending}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-sm disabled:opacity-50"
                    >
                        {assignMutation?.isPending ? 'Assigning...' : 'Assign Permission'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AssignPermissionModal