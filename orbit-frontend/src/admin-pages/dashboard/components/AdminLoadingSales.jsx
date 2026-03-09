import AdminLayout from "../layout/Layout";
const AdminLoadingSales = () => {
    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white p-4 sm:p-6">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2 animate-pulse">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                        <div className="h-4 w-80 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                        <div className="h-3 w-48 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Store Selector Skeleton */}
                        <div className="h-9 w-48 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                        {/* Date Selector Skeleton */}
                        <div className="h-9 w-36 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                        {/* Today Button Skeleton */}
                        <div className="h-9 w-20 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                        {/* Export Button Skeleton */}
                        <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                        {/* Store Items Button Skeleton */}
                        <div className="h-9 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                    </div>
                </div>

                {/* Info Banner Skeleton */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-gray-800/30 border border-blue-100 dark:border-gray-700 rounded-sm animate-pulse">
                    <div className="flex items-start gap-3">
                        <div className="h-5 w-5 bg-blue-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-blue-200 dark:bg-gray-700 rounded-sm"></div>
                            <div className="h-3 w-64 bg-blue-200 dark:bg-gray-700 rounded-sm"></div>
                            <div className="h-3 w-48 bg-blue-200 dark:bg-gray-700 rounded-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2 animate-pulse">
                    {/* Revenue Card */}
                    <div className="bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                            </div>
                            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                        </div>
                        <div className="h-2 w-24 bg-gray-200 dark:bg-gray-800 rounded-sm mt-3"></div>
                    </div>

                    {/* Units Sold Card */}
                    <div className="bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                            </div>
                            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                        </div>
                        <div className="h-2 w-24 bg-gray-200 dark:bg-gray-800 rounded-sm mt-3"></div>
                    </div>

                    {/* Transactions Card */}
                    <div className="bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                            </div>
                            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                        </div>
                        <div className="h-2 w-24 bg-gray-200 dark:bg-gray-800 rounded-sm mt-3"></div>
                    </div>

                    {/* Profit Card */}
                    <div className="bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                            </div>
                            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                        </div>
                        <div className="h-2 w-24 bg-gray-200 dark:bg-gray-800 rounded-sm mt-3"></div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden animate-pulse">
                    {/* Table Header Skeleton */}
                    <div className="border-b border-gray-200 dark:border-gray-800 p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                            <div className="space-y-2">
                                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                                <div className="h-3 w-60 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                            </div>
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                        </div>
                    </div>

                    {/* Table Content Skeleton */}
                    <div className="p-4">
                        {/* Table Header Row Skeleton */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                        </div>

                        {/* Table Rows Skeleton */}
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="flex items-center border-t border-gray-200 dark:border-gray-800 p-4">
                                <div className="flex-1 grid grid-cols-12 gap-4">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-sm col-span-1"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-sm col-span-2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-sm col-span-1"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-sm col-span-2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-sm col-span-1"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-sm col-span-1"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-sm col-span-2"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-sm col-span-1"></div>
                                </div>
                            </div>
                        ))}

                        {/* Table Footer Skeleton */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section Skeleton */}
                <div className="mt-2 animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Profitability Summary Skeleton */}
                        <div className="h-24 bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-sm p-4">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm mb-3"></div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                            </div>
                        </div>

                        {/* Store Comparison Skeleton */}
                        <div className="h-24 bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-sm p-4">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-sm mb-3"></div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminLoadingSales;