import { Trash2, CheckCircle, XCircle, X } from "lucide-react"

const BulkActions = ({
    selectedCount,
    onBulkDelete,
    onBulkActivate,
    onBulkDeactivate,
    onClearSelection
}) => {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white">
                        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                    </span>
                </div>
                <button
                    onClick={onClearSelection}
                    className="p-1 hover:bg-gray-700 rounded-sm transition"
                    title="Clear selection"
                >
                    <X className="h-4 w-4 text-gray-400" />
                </button>
            </div>

            <div className="space-y-2">
                <button
                    onClick={onBulkActivate}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-sm transition text-sm font-medium"
                >
                    <CheckCircle className="h-4 w-4" />
                    Activate Selected
                </button>

                <button
                    onClick={onBulkDeactivate}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30 rounded-sm transition text-sm font-medium"
                >
                    <XCircle className="h-4 w-4" />
                    Deactivate Selected
                </button>

                <button
                    onClick={onBulkDelete}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-sm transition text-sm font-medium"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                </button>
            </div>
        </div>
    )
}

export default BulkActions