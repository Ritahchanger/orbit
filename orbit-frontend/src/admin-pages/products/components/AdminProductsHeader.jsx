import {
    Package, DollarSign, TrendingUp,
    AlertCircle
} from 'lucide-react';

const AdminProductsHeader = ({
    stats,
    tabs,
    activeTab,
    setActiveTab,
    loading,
    viewMode
}) => {

    const transformedStats = stats || {};

    const safeStats = {
        totalDevices: transformedStats.totalProducts || transformedStats.totalDevices || 0,
        totalValue: transformedStats.totalValue || transformedStats.totalRevenue || 0,
        todaySales: transformedStats.todaySales || 0,
        todayRevenue: transformedStats.todayRevenue || 0,
        lowStockCount: transformedStats.lowStockCount || 0,
        topSelling: transformedStats.topSelling || 'None',
        viewMode: viewMode || 'Global Products'
    };

    return (
        <div className="mb-2">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2 text-sm lg:text-lg">
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                    <div className="flex items-center justify-between">
                        <Package className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Devices</span>
                    </div>
                    <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mt-2">
                        {safeStats.totalDevices}
                    </h3>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                    <div className="flex items-center justify-between">
                        <DollarSign className="h-6 w-6 text-green-600 dark:text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
                    </div>
                    <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mt-2">
                        KSh {safeStats.totalValue.toLocaleString()}
                    </h3>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                    <div className="flex items-center justify-between">
                        <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Low Stock</span>
                    </div>
                    <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mt-2">
                        {safeStats.lowStockCount}
                    </h3>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-4">
                    <div className="flex items-center justify-between">
                        <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</span>
                    </div>
                    <h3 className="text-lg md:text-lg font-bold text-gray-900 dark:text-white mt-2 truncate">
                        {/* Use outOfStockCount from API if available, otherwise show totalSold */}
                        {transformedStats.outOfStockCount || safeStats.topSelling}
                    </h3>
                </div>
            </div>

            {/* Tabs - Scrollable on mobile */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 text-sm lg:text-lg">
                <div className="flex space-x-1 border-b border-gray-300 dark:border-gray-700 min-w-max">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            disabled={loading}
                            className={`px-4 py-3 text-sm font-medium transition-colors relative flex-shrink-0 whitespace-nowrap ${activeTab === tab.id
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {tab.name}
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminProductsHeader;