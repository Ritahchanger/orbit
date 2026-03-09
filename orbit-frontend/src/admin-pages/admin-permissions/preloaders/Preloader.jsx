import React from 'react';

const PermissionSkeletonLoader = () => (
    <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            </div>
        </div>

        {/* Info Bar Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
        </div>

        {/* Mobile View Skeletons */}
        <div className="md:hidden space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
                            <div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                        </div>
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>

                    <div className="space-y-2">
                        <div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>

                        <div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>

                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Desktop Table View Skeletons */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {['Module', 'Permission', 'Description', 'Action Type', 'Status'].map((header) => (
                            <th key={header} className="px-4 py-3 text-left">
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[1, 2, 3, 4, 5].map((row) => (
                        <tr key={row}>
                            <td className="px-4 py-3">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default PermissionSkeletonLoader;