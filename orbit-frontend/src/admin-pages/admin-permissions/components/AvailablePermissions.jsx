import React, { useRef, useState, useEffect } from 'react';

const AvailablePermissions = ({
    filteredPermissions,
    getModuleIcon,
    getPermissionBadgeColor,
    setPermissionData,
    setShowAssignModal
}) => {
    const tableRef = useRef(null);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);

    // Check if table content overflows
    useEffect(() => {
        const checkOverflow = () => {
            if (tableRef.current) {
                const { scrollHeight, clientHeight } = tableRef.current;
                setShowScrollIndicator(scrollHeight > clientHeight);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);

        return () => {
            window.removeEventListener('resize', checkOverflow);
        };
    }, [filteredPermissions]);

    const handleScroll = () => {
        if (tableRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
            // Hide indicator when scrolled to bottom
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                setShowScrollIndicator(false);
            } else {
                setShowScrollIndicator(true);
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Available Permissions
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {filteredPermissions.length} permissions available • Click to assign
                    </p>
                </div>
            </div>

            {/* Search and Info Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing all available system permissions
                    </p>
                    <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full">
                        {filteredPermissions.length} total
                    </div>
                </div>
            </div>

            {/* Mobile Grid View */}
            <div className="md:hidden space-y-3">
                {filteredPermissions.map(perm => {
                    const ModuleIcon = getModuleIcon(perm.module);
                    const action = perm.key.split('.')[1];
                    const badgeColor = getPermissionBadgeColor(perm.key);

                    return (
                        <div
                            key={perm._id}
                            className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                                setPermissionData({
                                    permission: perm.key,
                                    scope: 'global',
                                    storeId: ''
                                });
                                setShowAssignModal(true);
                            }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-2">
                                        <ModuleIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                            {perm.module}
                                        </h4>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Module
                                        </span>
                                    </div>
                                </div>
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                                    {action}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {/* Permission Key */}
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Permission Key
                                    </p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                                        {perm.key}
                                    </span>
                                </div>

                                {/* Description */}
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Description
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {perm.description}
                                    </p>
                                </div>

                                {/* Action Button */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                                        Click to assign this permission →
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop Table View with Scroll */}
            <div className="hidden md:block relative">
                <div
                    ref={tableRef}
                    onScroll={handleScroll}
                    className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                    style={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        position: 'relative'
                    }}
                >
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700">
                                    Module
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700">
                                    Permission
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700">
                                    Action Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-700">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredPermissions.map(perm => {
                                const ModuleIcon = getModuleIcon(perm.module);
                                const action = perm.key.split('.')[1];
                                const badgeColor = getPermissionBadgeColor(perm.key);

                                return (
                                    <tr
                                        key={perm._id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                        onClick={() => {
                                            setPermissionData({
                                                permission: perm.key,
                                                scope: 'global',
                                                storeId: ''
                                            });
                                            setShowAssignModal(true);
                                        }}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-2">
                                                    <ModuleIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                                    {perm.module}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                                                {perm.key}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                                                {perm.description}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                                                {action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                                                Available
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Scroll Indicator */}
                {showScrollIndicator && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center py-2 bg-gradient-to-t from-white to-transparent dark:from-gray-800 dark:to-transparent z-20 pointer-events-none">
                        <div className="animate-bounce flex flex-col items-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Scroll for more
                            </div>
                            <svg
                                className="w-4 h-4 text-gray-400 dark:text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {filteredPermissions.length === 0 && (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                        <div className="h-6 w-6 text-gray-500">🔒</div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Permissions Available
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        There are no permissions available for assignment at the moment.
                        Permissions are configured in the system settings.
                    </p>
                </div>
            )}

            {/* Footer with pagination info */}
            {filteredPermissions.length > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        Showing {filteredPermissions.length} permissions
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            onClick={() => tableRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                        <button
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            onClick={() => tableRef.current?.scrollTo({ top: tableRef.current.scrollHeight, behavior: 'smooth' })}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailablePermissions;