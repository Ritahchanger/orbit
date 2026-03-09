import { RefreshCw, FileText, Download } from "lucide-react"
const AdminReportsHeader = ({loadReportData,loading,exportToPDF,exportToExcel,quickStats}) => {
    return (
        <div className="mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-[#00D4FF] bg-clip-text text-transparent">
                        Reports & Analytics
                    </h1>
                    <p className="text-gray-400 mt-1">Track performance across all stores and departments</p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={loadReportData}
                        disabled={loading}
                        className="p-2 rounded-sm bg-dark-light border border-gray-800 hover:bg-gray-800 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-5 w-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="px-4 py-2 rounded-sm bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2"
                    >
                        <FileText className="h-4 w-4" />
                        <span>Export PDF</span>
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="px-4 py-2 rounded-sm bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export Excel</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                {quickStats?.map((stat, index) => (
                    <div key={index} className="bg-dark-light border border-gray-800 rounded-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-gray-900/50 rounded-sm">
                                <stat.icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className={`text-sm font-medium px-2 py-1 rounded-sm ${stat.color === 'green' ? 'bg-green-500/20 text-green-400' :
                                stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                    stat.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                                        'bg-orange-500/20 text-orange-400'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white">{stat.value}</h3>
                        <p className="text-sm text-gray-400">{stat.title}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminReportsHeader