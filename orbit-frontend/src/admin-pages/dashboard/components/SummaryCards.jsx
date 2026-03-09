import {
    DollarSign,
    TrendingUp,
    ShoppingCart,
    BarChart3,
} from "lucide-react";
import { useAuth } from "../../../context/authentication/AuthenticationContext";

// Main SummaryCards Component
const SummaryCards = ({ summary, formatCurrency: propsFormatCurrency, itemsSold }) => {
    const { userRole } = useAuth();

    // Use provided formatCurrency or default
    const formatCurrency = propsFormatCurrency || ((amount) => {
        if (!amount && amount !== 0) return 'KSh 0';
        return `KSh ${Math.round(amount).toLocaleString()}`;
    });

    return (
        <>
            {/* Summary Cards - Match theme */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                {/* Revenue Card */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatCurrency(summary?.totalSales || 0)}
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/20 rounded-sm">
                            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                        {summary?.totalTransactions || 0} transactions
                    </p>
                </div>

                {/* Profit Card - Only for superadmin */}
                {userRole === 'superadmin' && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Profit</p>
                                <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                                    {formatCurrency(summary?.totalProfit || 0)}
                                </h3>
                            </div>
                            <div className="p-2 bg-green-50 dark:bg-green-500/20 rounded-sm">
                                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-500" />
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                            {summary?.totalProfit > 0 && summary?.totalSales > 0 ?
                                `${Math.round((summary.totalProfit / summary.totalSales) * 100)}% margin` :
                                'No profit'
                            }
                        </p>
                    </div>
                )}

                {/* Items Sold Card */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Items Sold</p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                {summary?.totalItemsSold || 0}
                            </h3>
                        </div>
                        <div className="p-2 bg-purple-50 dark:bg-purple-500/20 rounded-sm">
                            <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                        </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                        {itemsSold?.length || 0} products sold
                    </p>
                </div>

                {/* Average Transaction Card */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Avg. Transaction</p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatCurrency(summary?.averageTransaction || 0)}
                            </h3>
                        </div>
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-500/20 rounded-sm">
                            <BarChart3 className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                        </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                        Per transaction average
                    </p>
                </div>
            </div>
        </>
    );
};

export default SummaryCards;