import { AlertCircle } from "lucide-react"
const RevokePermissionModal = ({  setSelectedPermission, handleRevokePermission, setShowRevokeModal, revokeMutation }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-sm p-6 max-w-md w-full">
                <div className="flex items-center mb-4">
                    <AlertCircle className="text-red-400 mr-3" size={24} />
                    <h3 className="text-lg font-semibold">Revoke Permission</h3>
                </div>

                <p className="text-gray-300 mb-6">
                    Are you sure you want to revoke the permission <strong>{selectedPermission.permission}</strong> from <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>?
                </p>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => {
                            setShowRevokeModal(false);
                            setSelectedPermission(null);
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            handleRevokePermission(selectedPermission);
                            setShowRevokeModal(false);
                        }}
                        disabled={revokeMutation?.isPending}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-sm disabled:opacity-50"
                    >
                        {revokeMutation?.isPending ? 'Revoking...' : 'Revoke Permission'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RevokePermissionModal