import React from 'react';

const ConsultationPageSkeleton = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-800 p-4 sm:p-6">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded-sm mb-2 animate-pulse"></div>
                        <div className="h-4 w-80 bg-gray-200 dark:bg-gray-800 rounded-sm animate-pulse"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                        <div className="h-10 w-32 bg-green-500/30 dark:bg-green-600/30 rounded-sm animate-pulse"></div>
                    </div>
                </div>

                {/* Stats Grid - Shimmer Animation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-sm animate-pulse"></div>
                            </div>
                            <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-300/10 dark:via-gray-700/10 to-transparent animate-shimmer"></div>
                        </div>
                    ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-2">
                        <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                        <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4 mb-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i}>
                            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded-sm mb-2"></div>
                            <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm overflow-hidden">
                {/* Table Header */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <th key={i} className="px-6 py-3">
                                        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
                            {/* Table Rows - Staggered Animation */}
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((row, rowIndex) => (
                                <React.Fragment key={row}>
                                    {/* Main Row */}
                                    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 ${rowIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/30' : ''}`}>
                                        {/* Checkbox */}
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                                        </td>

                                        {/* Customer Column */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                                <div className="ml-4">
                                                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded-sm mb-1 animate-pulse"></div>
                                                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded-sm animate-pulse"></div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Setup Type */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-sm mr-2 animate-pulse"></div>
                                                <div>
                                                    <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded-sm mb-1 animate-pulse"></div>
                                                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded-sm animate-pulse"></div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Date & Time */}
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded-sm mb-1 animate-pulse"></div>
                                            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-sm animate-pulse"></div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                                                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                                                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded Row (every other row) */}
                                    {rowIndex % 2 === 0 && (
                                        <tr className="bg-gray-100 dark:bg-gray-800/30">
                                            <td colSpan="8" className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {[1, 2, 3].map((col) => (
                                                        <div key={col}>
                                                            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded-sm mb-3 animate-pulse"></div>
                                                            <div className="space-y-2">
                                                                {[1, 2, 3, 4].map((item) => (
                                                                    <div key={item} className="flex items-center gap-2">
                                                                        <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded-sm animate-pulse"></div>
                                                                        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm animate-pulse"></div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State Skeleton */}
                <div className="text-center py-12 animate-pulse">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-800 rounded-sm"></div>
                    </div>
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded-sm mx-auto mb-2"></div>
                    <div className="h-4 w-64 bg-gray-100 dark:bg-gray-900 rounded-sm mx-auto"></div>
                </div>
            </div>

            {/* Calendar View Skeleton (if view mode is calendar) */}
            <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-6 animate-pulse">
                <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded-sm mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="bg-gray-100 dark:bg-gray-900 rounded-sm p-3">
                            <div className="text-center mb-2">
                                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded-sm mx-auto mb-1"></div>
                                <div className="h-6 w-8 bg-gray-300 dark:bg-gray-700 rounded-sm mx-auto mb-1"></div>
                                <div className="h-3 w-10 bg-gray-200 dark:bg-gray-800 rounded-sm mx-auto"></div>
                            </div>
                            <div className="space-y-2">
                                {[1, 2].map((j) => (
                                    <div key={j} className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Loading Text Overlay */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                <div className="text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mb-4"></div>
                    <div className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                        Loading consultation data...
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        Please wait a moment
                    </div>
                </div>
            </div>

            {/* Add CSS for shimmer animation if not already in your global styles */}
            <style jsx>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </div>
    );
};

export default ConsultationPageSkeleton;