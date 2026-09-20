import { AlertTriangle, RefreshCw, Home, XCircle } from 'lucide-react';
const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4">
            <div className="max-w-[899px] w-full bg-dark-light border border-gray-800 rounded-sm p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-500/10 rounded-sm">
                        <AlertTriangle className="h-12 w-12 text-red-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                <p className="text-gray-400 mb-6">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>

                {process.env.NODE_ENV === 'development' && error && (
                    <div className="mb-6 text-left">
                        <details className="bg-red-900/20 border border-red-800 rounded p-4">
                            <summary className="cursor-pointer font-medium text-red-300">
                                Error Details
                            </summary>
                            <div className="mt-2">
                                <div className="flex items-start gap-2 mb-2">
                                    <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                                    <code className="text-sm text-red-200 break-all">
                                        {error.message}
                                    </code>
                                </div>
                                {error.stack && (
                                    <pre className="text-xs text-red-300 whitespace-pre-wrap overflow-auto mt-2">
                                        {error.stack}
                                    </pre>
                                )}
                            </div>
                        </details>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={resetErrorBoundary}
                        className="px-6 py-3 bg-primary text-white rounded-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-gray-700 text-white rounded-sm hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Go to Home
                    </button>
                </div>

                <p className="text-gray-500 text-sm mt-6">
                    If the problem persists, please contact support.
                </p>
            </div>
        </div>
    );
};

export default ErrorFallback;