const SalesAnalysisSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Quick Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-dark-light border border-gray-800 rounded-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-gray-800 rounded-lg"></div>
                            <div className="w-12 h-6 bg-gray-800 rounded-full"></div>
                        </div>
                        <div className="h-8 bg-gray-800 rounded mb-1 w-3/4"></div>
                        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                        <div className="flex items-center gap-2 mt-3">
                            <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                            <div className="h-3 bg-gray-800 rounded w-20"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid Skeleton */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Chart Skeleton */}
                <div className="bg-dark-light border border-gray-800 rounded-sm p-5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-800 rounded w-48"></div>
                            <div className="h-4 bg-gray-800 rounded w-32"></div>
                        </div>
                        <div className="h-8 bg-gray-800 rounded w-40"></div>
                    </div>
                    <div className="h-72 bg-gray-900 rounded-sm flex items-end justify-between px-4 py-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div
                                    className="w-12 bg-gradient-to-t from-gray-800 to-gray-700 rounded-t-sm"
                                    style={{ height: `${Math.random() * 100 + 50}px` }}
                                ></div>
                                <div className="h-3 bg-gray-800 rounded w-16 mt-2"></div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-800">
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-800 rounded w-16 mx-auto"></div>
                            <div className="h-4 bg-gray-800 rounded w-24 mx-auto"></div>
                            <div className="h-4 bg-gray-800 rounded w-32 mx-auto"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-800 rounded w-20 mx-auto"></div>
                            <div className="h-4 bg-gray-800 rounded w-28 mx-auto"></div>
                            <div className="h-4 bg-gray-800 rounded w-20 mx-auto"></div>
                        </div>
                    </div>
                </div>

                {/* Right Chart Skeleton */}
                <div className="bg-dark-light border border-gray-800 rounded-sm p-5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-800 rounded w-40"></div>
                            <div className="h-4 bg-gray-800 rounded w-36"></div>
                        </div>
                        <div className="h-8 bg-gray-800 rounded w-28"></div>
                    </div>
                    <div className="h-72 flex items-center justify-center">
                        <div className="relative w-48 h-48">
                            <div className="absolute inset-0 border-8 border-gray-800 rounded-full"></div>
                            <div className="absolute inset-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-full animate-spin-slow"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-800">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-gray-900/30 rounded-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                                    <div className="h-3 bg-gray-800 rounded w-16"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-3 bg-gray-800 rounded w-12 ml-auto"></div>
                                    <div className="h-2 bg-gray-800 rounded w-8 ml-auto"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transaction Trends Skeleton */}
            <div className="bg-dark-light border border-gray-800 rounded-sm p-5">
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-2">
                        <div className="h-6 bg-gray-800 rounded w-40"></div>
                        <div className="h-4 bg-gray-800 rounded w-32"></div>
                    </div>
                    <div className="h-8 bg-gray-800 rounded w-40"></div>
                </div>
                <div className="h-64 bg-gray-900 rounded-sm relative overflow-hidden">
                    {/* Wave animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 animate-shimmer"></div>
                    {/* Graph lines */}
                    <div className="absolute inset-0 flex items-end">
                        <div className="w-full h-full flex items-end justify-between px-4">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-8 bg-gradient-to-t from-gray-800 to-gray-700 rounded-t-sm"
                                    style={{ height: `${Math.random() * 80 + 20}px` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="text-center space-y-2">
                            <div className="h-3 bg-gray-800 rounded w-24 mx-auto"></div>
                            <div className="h-5 bg-gray-800 rounded w-16 mx-auto"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Insights Grid Skeleton */}
            <div className="grid lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-900/50 to-gray-800/20 border border-gray-800 rounded-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 bg-gray-800 rounded"></div>
                            <div className="h-6 bg-gray-800 rounded w-32"></div>
                        </div>
                        <ul className="space-y-3">
                            {[...Array(3)].map((_, j) => (
                                <li key={j} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-1.5"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Performance Summary Skeleton */}
            <div className="bg-dark-light border border-gray-800 rounded-sm p-5">
                <div className="h-6 bg-gray-800 rounded w-40 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="text-center p-4 bg-gray-900/30 rounded-sm space-y-2">
                            <div className="h-3 bg-gray-800 rounded w-16 mx-auto"></div>
                            <div className="h-6 bg-gray-800 rounded w-24 mx-auto"></div>
                            {i === 3 && <div className="h-3 bg-gray-800 rounded w-12 mx-auto"></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SalesAnalysisSkeleton