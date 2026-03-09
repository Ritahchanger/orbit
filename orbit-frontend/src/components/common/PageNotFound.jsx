import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Home, ArrowLeft, Search, AlertTriangle, Ghost } from 'lucide-react';

const PageNotFound = () => {
    const location = useLocation();

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-dark py-12 px-4">
            <div className="max-w-2xl w-full text-center">
              

                {/* Main Content */}
                <div className="bg-dark-light border border-gray-700 rounded-sm p-8 mb-8 shadow-2xl">
                    <div className="flex items-center justify-center mb-4">
                        <Ghost className="h-12 w-12 text-gray-400 animate-pulse" />
                    </div>

                    <h3 className="text-xl font-heading font-bold text-white mb-4">
                        This Page Has Been Disconnected
                    </h3>

                    <p className="text-gray-400 mb-6">
                        The page you're trying to access
                        <span className="block font-medium text-primary bg-dark/50 p-2 rounded-sm my-2">
                            {location.pathname}
                        </span>
                        doesn't exist in our gaming universe.
                    </p>

                    <div className="text-center">
                        <h3 className='text-red-500 text-[3rzem]'>
                            404
                        </h3>
                    </div>

                  

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-sm transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </button>

                        <Link
                            to="/"
                            className="px-6 py-3 bg-gradient-to-r from-primary to-[#00D4FF] hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-sm transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Home className="h-4 w-4" />
                            Home Page
                        </Link>

                        <Link
                            to="/products"
                            className="px-6 py-3 bg-gradient-to-r from-secondary to-orange-500 hover:from-orange-600 hover:to-red-500 text-white font-medium rounded-sm transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Gamepad2 className="h-4 w-4" />
                            Browse Products
                        </Link>
                    </div>
                </div>

                {/* Help Section */}
            
            </div>
        </div>
    );
};

export default PageNotFound;