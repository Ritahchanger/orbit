const SkeletonPreloader = ({ type = 'analytics', rows = 1 }) => {
    // Analytics Dashboard Skeleton
    if (type === 'analytics') {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 animate-pulse">
                {/* Header */}
                <div className="mb-6">
                    <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
                    <div className="h-4 w-80 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    {/* View Mode Toggle */}
                    <div className="h-10 w-48 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    {/* Time Range */}
                    <div className="h-10 w-40 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    {/* Chart Type */}
                    <div className="h-10 w-32 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <div className="h-10 w-28 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                        <div className="h-10 w-32 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex justify-between">
                                <div>
                                    <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded-md mb-3"></div>
                                    <div className="h-8 w-40 bg-gray-200 dark:bg-gray-600 rounded-md mb-2"></div>
                                    <div className="h-3 w-24 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                                </div>
                                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Top Products Chart */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex justify-between mb-4">
                                <div className="h-6 w-40 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                                <div className="h-6 w-24 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                            </div>
                            <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-md"></div>
                        </div>
                    </div>

                    {/* Category Chart */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex justify-between mb-4">
                                <div className="h-6 w-40 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                                <div className="h-6 w-24 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                            </div>
                            <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-md"></div>
                        </div>
                    </div>
                </div>

                {/* Inventory Health & Low Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Inventory Health */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex justify-between mb-4">
                                <div className="h-6 w-40 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                                <div className="h-6 w-20 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                            </div>
                            <div className="h-48 bg-gray-50 dark:bg-gray-900/50 rounded-full mb-4"></div>
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="text-center">
                                        <div className="h-6 w-12 bg-gray-100 dark:bg-gray-700 rounded-md mx-auto mb-1"></div>
                                        <div className="h-3 w-16 bg-gray-50 dark:bg-gray-800 rounded-md mx-auto"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex justify-between mb-4">
                                <div className="h-6 w-40 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                                <div className="h-6 w-24 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                                            <div>
                                                <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded-md mb-2"></div>
                                                <div className="h-3 w-24 bg-gray-50 dark:bg-gray-800 rounded-md"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-6 w-16 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                                            <div className="h-8 w-20 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Products Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
                    <div className="flex justify-between mb-4">
                        <div className="h-6 w-40 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                        <div className="h-6 w-32 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-8 gap-2 mb-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-6 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                        ))}
                    </div>

                    {/* Table Rows */}
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                            <div key={row} className="grid grid-cols-8 gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                                    <div key={col} className="h-8 bg-gray-50 dark:bg-gray-900/50 rounded-md"></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-md"></div>
            </div>
        );
    }

    // Generic Table Skeleton
    if (type === 'table') {
        return (
            <div className="animate-pulse">
                {/* Table Header */}
                <div className="grid grid-cols-8 gap-2 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-6 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    ))}
                </div>

                {/* Table Rows */}
                <div className="space-y-3">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-8 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((colIndex) => (
                                <div key={colIndex} className="h-10 bg-gray-50 dark:bg-gray-900/50 rounded-md"></div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Generic Card Skeleton
    if (type === 'card') {
        return (
            <div className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="h-6 w-32 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                        <div className="h-8 w-24 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    </div>
                    <div className="h-48 bg-gray-50 dark:bg-gray-900/50 rounded-md mb-4"></div>
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Stats Card Skeleton
    if (type === 'stats') {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded-md mb-3"></div>
                        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-600 rounded-md mb-2"></div>
                        <div className="h-3 w-24 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    </div>
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                </div>
            </div>
        );
    }

    // Chart Skeleton
    if (type === 'chart') {
        return (
            <div className="animate-pulse">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-6 w-40 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                    <div className="h-6 w-24 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
                </div>
                <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-md"></div>
            </div>
        );
    }

    // Default generic skeleton
    return (
        <div className="animate-pulse">
            <div className="space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div 
                        key={i} 
                        className="h-4 bg-gray-100 dark:bg-gray-700 rounded-md"
                        style={{ width: `${i % 2 === 0 ? '100%' : '80%'}` }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default SkeletonPreloader;