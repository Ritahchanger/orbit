import AdminLayout from "../layout/Layout"
import { BarChart3 } from "lucide-react"
const ErrorLoadingSales = ({ error, refetch }) => {
    return (
        <AdminLayout>
            <div className="min-h-screen bg-dark text-white p-4 sm:p-6 flex items-center justify-center">
                <div className="text-center bg-red-500/10 border border-red-500/20 p-6 rounded-sm max-w-md">
                    <BarChart3 className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-red-400 font-semibold mb-2">Failed to load sales data</h3>
                    <p className="text-gray-400">{error?.message || "Please try again later"}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 bg-dark-light border border-gray-700 text-white rounded-sm hover:bg-gray-800 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        </AdminLayout>
    )
}

export default ErrorLoadingSales