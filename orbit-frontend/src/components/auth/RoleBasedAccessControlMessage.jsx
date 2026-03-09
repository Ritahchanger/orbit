import { Shield, ArrowLeft, Home } from "lucide-react"
import { useNavigate } from "react-router-dom"
const RoleBasedAccessControlMessage = ({ userRole, roles }) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark">
            <div className="max-w-md w-full p-8 bg-dark-light border border-gray-800 rounded-sm text-center">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
                <p className="text-gray-400 mb-4">
                    You don't have permission to access this page.
                </p>
                <div className="mb-6 p-4 bg-gray-900/50 rounded-sm">
                    <p className="text-sm text-gray-300">
                        <span className="text-gray-500">Required roles:</span> {roles.join(', ')}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                        <span className="text-gray-500">Your role:</span> {userRole}
                    </p>
                </div>
                <div className="flex space-x-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-gray-700 text-white rounded-sm hover:bg-gray-600 transition-colors flex items-center"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="px-6 py-2 bg-primary text-white rounded-sm hover:bg-blue-600 transition-colors flex items-center"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RoleBasedAccessControlMessage