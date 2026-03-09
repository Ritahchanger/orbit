// components/StoreSkeleton.jsx


export const StatsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-gray-700 rounded-sm animate-pulse"></div>
                    </div>
                    <div className="w-16 h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="w-32 h-3 bg-gray-800 rounded animate-pulse"></div>
                </div>
            ))}
        </div>
    );
};

export const StoreGridSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-sm p-4 animate-pulse">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-700 rounded-sm"></div>
                            <div className="space-y-2">
                                <div className="w-32 h-4 bg-gray-700 rounded"></div>
                                <div className="w-24 h-3 bg-gray-800 rounded"></div>
                            </div>
                        </div>
                        <div className="w-8 h-8 bg-gray-700 rounded"></div>
                    </div>

                    <div className="space-y-3 mb-4">
                        {[...Array(4)].map((_, j) => (
                            <div key={j} className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-700 rounded"></div>
                                <div className="w-40 h-3 bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <div className="w-20 h-6 bg-gray-700 rounded-sm"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-6 bg-gray-700 rounded-sm"></div>
                            <div className="w-12 h-6 bg-gray-700 rounded-sm"></div>
                            <div className="w-12 h-6 bg-gray-700 rounded-sm"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const StoreListSkeleton = () => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-900/50">
                    <tr>
                        {[...Array(7)].map((_, i) => (
                            <th key={i} className="py-3 px-4 text-left">
                                <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {[...Array(5)].map((_, i) => (
                        <tr key={i} className="hover:bg-gray-900/30">
                            {[...Array(7)].map((_, j) => (
                                <td key={j} className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                        {j === 0 && (
                                            <>
                                                <div className="w-10 h-10 bg-gray-700 rounded-sm"></div>
                                                <div className="space-y-2">
                                                    <div className="w-32 h-4 bg-gray-700 rounded"></div>
                                                    <div className="w-16 h-3 bg-gray-800 rounded"></div>
                                                </div>
                                            </>
                                        )}
                                        {j !== 0 && j !== 6 && (
                                            <div className="w-32 h-4 bg-gray-700 rounded"></div>
                                        )}
                                        {j === 6 && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-700 rounded-sm"></div>
                                                <div className="w-8 h-8 bg-gray-700 rounded-sm"></div>
                                                <div className="w-8 h-8 bg-gray-700 rounded-sm"></div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const StoreSkeleton = ({ viewMode = 'grid' }) => {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="space-y-2">
                    <div className="w-48 h-8 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-64 h-4 bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-sm animate-pulse"></div>
                    <div className="w-32 h-10 bg-gray-700 rounded-sm animate-pulse"></div>
                </div>
            </div>

            {/* Stats Skeleton */}
            <StatsSkeleton />

            {/* Filters and Search Skeleton */}
            <div className="bg-dark-light border border-gray-800 rounded-sm p-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1 w-full">
                        <div className="w-full h-10 bg-gray-700 rounded-sm animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-700 rounded"></div>
                            <div className="w-32 h-10 bg-gray-700 rounded-sm animate-pulse"></div>
                        </div>
                        <div className="w-10 h-10 bg-gray-700 rounded-sm animate-pulse"></div>
                        <div className="w-24 h-10 bg-gray-700 rounded-sm animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Store Display Skeleton */}
            <div className="bg-dark-light border border-gray-800 rounded-sm overflow-hidden">
                {viewMode === 'grid' ? (
                    <StoreGridSkeleton />
                ) : (
                    <StoreListSkeleton />
                )}
            </div>

            {/* Pagination Info Skeleton */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-48 h-4 bg-gray-800 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-gray-800 rounded animate-pulse"></div>
            </div>
        </div>
    );
};

export default StoreSkeleton;