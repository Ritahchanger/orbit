const SkeletonPreloader = ({ type = 'profile', count = 1 }) => {
    // Profile skeleton
    if (type === 'profile') {
        return (
            <div className="animate-pulse space-y-6">
                {/* Header skeleton */}
                <div className="mb-8">
                    <div className="h-8 bg-gray-700 rounded-sm w-64 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded-sm w-48"></div>
                </div>

                {/* Stats cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-dark-light border border-gray-800 rounded-sm p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="h-4 bg-gray-700 rounded-sm w-20 mb-2"></div>
                                    <div className="h-7 bg-gray-700 rounded-sm w-12"></div>
                                </div>
                                <div className="h-10 w-10 bg-gray-700 rounded-sm"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main content skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile card skeleton */}
                        <div className="bg-dark-light border border-gray-800 rounded-sm p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
                                    <div>
                                        <div className="h-7 bg-gray-700 rounded-sm w-48 mb-2"></div>
                                        <div className="flex space-x-2">
                                            <div className="h-6 bg-gray-700 rounded-full w-24"></div>
                                            <div className="h-6 bg-gray-700 rounded-sm w-32"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-10 bg-gray-700 rounded-sm w-32"></div>
                            </div>

                            {/* Form skeleton */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i}>
                                        <div className="h-4 bg-gray-700 rounded-sm w-24 mb-2"></div>
                                        <div className="h-10 bg-gray-700 rounded-sm w-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stores section skeleton */}
                        <div className="bg-dark-light border border-gray-800 rounded-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-6 bg-gray-700 rounded-sm w-32"></div>
                                <div className="h-4 bg-gray-700 rounded-sm w-20"></div>
                            </div>
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-700 rounded-sm"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right column skeleton */}
                    <div className="space-y-6">
                        {/* Security card skeleton */}
                        <div className="bg-dark-light border border-gray-800 rounded-sm p-6">
                            <div className="h-6 bg-gray-700 rounded-sm w-24 mb-4"></div>
                            <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-700 rounded-sm"></div>
                                ))}
                            </div>
                        </div>

                        {/* Account info card skeleton */}
                        <div className="bg-dark-light border border-gray-800 rounded-sm p-6">
                            <div className="h-6 bg-gray-700 rounded-sm w-32 mb-4"></div>
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-8 bg-gray-700 rounded-sm"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Simple spinner skeleton
    if (type === 'spinner') {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <div className="h-4 bg-gray-700 rounded-sm w-32"></div>
            </div>
        );
    }

    // Card skeleton
    if (type === 'card') {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="bg-dark-light border border-gray-800 rounded-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-5 bg-gray-700 rounded-sm w-1/3"></div>
                            <div className="h-8 w-8 bg-gray-700 rounded-sm"></div>
                        </div>
                        <div className="h-4 bg-gray-700 rounded-sm w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded-sm w-1/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    // List skeleton
    if (type === 'list') {
        return (
            <div className="animate-pulse space-y-2">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-700 rounded-sm"></div>
                ))}
            </div>
        );
    }

    // Default: Simple centered spinner
    return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <div className="h-4 bg-gray-700 rounded-sm w-32 mx-auto"></div>
            </div>
        </div>
    );
};

export default SkeletonPreloader;