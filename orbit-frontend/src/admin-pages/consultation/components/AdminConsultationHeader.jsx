import { RefreshCw, Download } from "lucide-react"

const AdminConsultationHeader = ({ refetch, exportData, filteredConsultations, canExportConsultations }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-[#00D4FF] bg-clip-text text-transparent">
                    Booking Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all gaming setup consultations</p>
            </div>

            <div className="flex items-center space-x-3">
                <button
                    onClick={() => refetch()}
                    className="p-2 rounded-sm bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                    title="Refresh"
                >
                    <RefreshCw className="h-5 w-5" />
                </button>
                
                {canExportConsultations && (
                    <button
                        onClick={exportData}
                        disabled={filteredConsultations.length === 0}
                        className="px-4 py-2 rounded-sm bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors font-medium"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export default AdminConsultationHeader