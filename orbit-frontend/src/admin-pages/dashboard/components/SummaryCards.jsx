import {
    DollarSign,
    TrendingUp,
    ShoppingCart,
    BarChart3,
} from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../../context/authentication/AuthenticationContext";

// Main SummaryCards Component
const SummaryCards = ({ summary, formatCurrency: propsFormatCurrency, itemsSold }) => {
    const { userRole } = useAuth();

    // Use provided formatCurrency or default
    const formatCurrency = propsFormatCurrency || ((amount) => {
        if (!amount && amount !== 0) return 'KSh 0';
        return `KSh ${Math.round(amount).toLocaleString()}`;
    });

    const margin =
        summary?.totalProfit > 0 && summary?.totalSales > 0
            ? `${Math.round((summary.totalProfit / summary.totalSales) * 100)}% margin`
            : "No profit";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
                title="Total Revenue"
                value={formatCurrency(summary?.totalSales || 0)}
                icon={<DollarSign className="h-5 w-5" />}
                color="blue"
                hint={`${summary?.totalTransactions || 0} transactions`}
            />

            {/* Profit Card - Only for superadmin */}
            {userRole === "superadmin" && (
                <StatCard
                    title="Total Profit"
                    value={formatCurrency(summary?.totalProfit || 0)}
                    valueClassName="text-green-600 dark:text-green-400"
                    icon={<TrendingUp className="h-5 w-5" />}
                    color="green"
                    hint={margin}
                />
            )}

            <StatCard
                title="Items Sold"
                value={summary?.totalItemsSold || 0}
                icon={<ShoppingCart className="h-5 w-5" />}
                color="purple"
                hint={`${itemsSold?.length || 0} products sold`}
            />

            <StatCard
                title="Avg. Transaction"
                value={formatCurrency(summary?.averageTransaction || 0)}
                icon={<BarChart3 className="h-5 w-5" />}
                color="yellow"
                hint="Per transaction average"
            />
        </div>
    );
};

export default SummaryCards;