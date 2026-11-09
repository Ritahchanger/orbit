import {
    Package, DollarSign, TrendingUp,
    AlertCircle
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
                <StatCard
                    title="Total Devices"
                    value={safeStats.totalDevices}
                    icon={<Package className="h-5 w-5" />}
                    color="blue"
                />
                <StatCard
                    title="Total Value"
                    value={`KSh ${safeStats.totalValue.toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    color="green"
                />
                <StatCard
                    title="Low Stock"
                    value={safeStats.lowStockCount}
                    icon={<AlertCircle className="h-5 w-5" />}
                    color="yellow"
                />
                <StatCard
                    title="Out of Stock"
                    // Use outOfStockCount from API if available, otherwise show topSelling
                    value={transformedStats.outOfStockCount ?? safeStats.topSelling}
                    icon={<TrendingUp className="h-5 w-5" />}
                    color="purple"
                />
            </div>

            {/* Tabs - Scrollable on mobile */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
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