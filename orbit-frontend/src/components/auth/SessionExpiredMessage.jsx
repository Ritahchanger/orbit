import { useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"
const SessionExpiredMessage = () => {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen flex items-center justify-center bg-dark">
            <div className="max-w-md w-full p-8 bg-dark-light border border-gray-800 rounded-lg text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Session Expired</h2>
                <p className="text-gray-400 mb-6">
                    Your session has expired due to inactivity. Please log in again to continue.
                </p>
                <div className="flex space-x-3 justify-center">
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="px-6 py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Go to Login
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SessionExpiredMessage