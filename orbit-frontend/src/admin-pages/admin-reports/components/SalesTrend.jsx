import { useSalesTrendReport } from "../../hooks/reports.hooks";
import { LineChart, TrendingUp,Sparkles } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import ChartWrapper from "../../admin-analytics/components/Charts/ChartWrapper";

const SalesTrend = ({
  dateRange,
  storeId,
  metrics = { avgTransaction: 0 },
}) => {
  const { data: trendResponse, isLoading: trendLoading } = useSalesTrendReport(
    "daily",
    {
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate,
      storeId: storeId,
    },
  );

  console.log("SalesTrend API Response:", trendResponse);
  console.log("Date Range from props:", dateRange);

  // Extract trend items from the API response
  const trendItems = trendResponse?.data || [];

  console.log("Sales days from API:", trendItems.length, "days with sales");

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "KSh 0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Sort items by date (oldest to newest)
  const displayItems = [...trendItems].sort((a, b) => {
    const dateA = new Date(a.date || a._id);
    const dateB = new Date(b.date || b._id);
    return dateA - dateB;
  });

  // Prepare data for Chart.js
  const chartData = {
    labels: displayItems.map((item) => {
      const date = parseISO(item.date || item._id);
      return format(date, "MMM d");
    }),
    datasets: [
      {
        label: "Sales",
        data: displayItems.map((item) => item.totalSales || 0),
        backgroundColor: displayItems.map((item) => {
          const sales = item.totalSales || 0;
          const date = parseISO(item.date || item._id);
          const isToday = isSameDay(date, new Date());

          // Calculate average for coloring
          const avgSales =
            displayItems.length > 0
              ? displayItems.reduce((sum, d) => sum + (d.totalSales || 0), 0) /
                displayItems.length
              : 0;

          if (isToday) {
            return "rgba(59, 130, 246, 0.8)"; // Blue for today
          } else if (sales > avgSales * 0.8) {
            return "rgba(34, 197, 94, 0.8)"; // Green for above average
          } else {
            return "rgba(59, 130, 246, 0.6)"; // Blue for below average
          }
        }),
        borderColor: displayItems.map((item) => {
          const sales = item.totalSales || 0;
          const date = parseISO(item.date || item._id);
          const isToday = isSameDay(date, new Date());

          const avgSales =
            displayItems.length > 0
              ? displayItems.reduce((sum, d) => sum + (d.totalSales || 0), 0) /
                displayItems.length
              : 0;

          if (isToday) {
            return "rgb(59, 130, 246)"; // Blue for today
          } else if (sales > avgSales * 0.8) {
            return "rgb(34, 197, 94)"; // Green for above average
          } else {
            return "rgb(59, 130, 246)"; // Blue for below average
          }
        }),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(31, 41, 55, 0.95)",
        titleColor: "#e5e7eb",
        bodyColor: "#d1d5db",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const item = displayItems[index];
            if (!item) return "";

            const sales = item.totalSales || 0;
            const transactions = item.transactionCount || 0;
            const itemsSold = item.totalItemsSold || 0;
            const avgTransaction = item.averageTransaction || 0;
            const date = parseISO(item.date || item._id);

            return [
              `Date: ${format(date, "MMM d, yyyy")}`,
              `Sales: ${formatCurrency(sales)}`,
              `Transactions: ${transactions}`,
              `Items Sold: ${itemsSold}`,
              `Avg Transaction: ${formatCurrency(avgTransaction)}`,
            ];
          },
          title: () => "", // Remove title since we include date in label
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(55, 65, 81, 0.3)",
          drawBorder: false,
        },
        ticks: {
          color: "#9ca3af",
          font: {
            size: 10,
            family: "'Inter', sans-serif",
          },
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(55, 65, 81, 0.3)",
          drawBorder: false,
        },
        ticks: {
          color: "#9ca3af",
          font: {
            size: 10,
            family: "'Inter', sans-serif",
          },
          callback: function (value) {
            if (value >= 1000000) {
              return `KSh ${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
              return `KSh ${(value / 1000).toFixed(0)}K`;
            }
            return `KSh ${value}`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  // Calculate stats
  const totalPeriodSales = displayItems.reduce(
    (sum, day) => sum + (day.totalSales || 0),
    0,
  );
  const totalTransactions = displayItems.reduce(
    (sum, day) => sum + (day.transactionCount || 0),
    0,
  );
  const totalItemsSold = displayItems.reduce(
    (sum, day) => sum + (day.totalItemsSold || 0),
    0,
  );
  const avgDailySales =
    displayItems.length > 0 ? totalPeriodSales / displayItems.length : 0;

  // Find peak day
  const peakDay =
    displayItems.length > 0
      ? displayItems.reduce(
          (max, day) =>
            (day.totalSales || 0) > (max.totalSales || 0) ? day : max,
          displayItems[0],
        )
      : null;

  // Calculate best growth day
  const calculateBestGrowth = () => {
    if (displayItems.length < 2) return { growth: 0, day: null };

    let bestGrowth = 0;
    let bestDay = null;

    for (let i = 1; i < displayItems.length; i++) {
      const prev = displayItems[i - 1];
      const curr = displayItems[i];
      const prevSales = prev.totalSales || 0;
      const currSales = curr.totalSales || 0;

      if (prevSales > 0) {
        const growth = ((currSales - prevSales) / prevSales) * 100;
        if (growth > bestGrowth) {
          bestGrowth = growth;
          bestDay = curr;
        }
      }
    }

    return { growth: bestGrowth, day: bestDay };
  };

  const { growth: bestGrowth, day: bestGrowthDay } = calculateBestGrowth();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h3 className="font-medium text-gray-900 dark:text-white">
          Sales Trend (Daily)
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
            <span>Today</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            <span>Above Average</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
            <span>Below Average</span>
          </div>
          <button className="hidden px-4 py-2.5 rounded-sm bg-linear-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 md:flex items-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-sm">{"AI Feedback"}</span>
          </button>
        </div>
      </div>

      {trendLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : displayItems.length > 0 ? (
        <>
          {/* Chart.js Bar Chart */}
          <div className="h-80">
            <ChartWrapper
              type="bar"
              data={chartData}
              options={chartOptions}
              className="w-full h-full"
            />
          </div>

          {/* Stats Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Peak Day
                </p>
                {peakDay && (
                  <>
                    <p className="font-bold text-lg text-green-600">
                      {formatCurrency(peakDay.totalSales)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(
                        parseISO(peakDay.date || peakDay._id),
                        "MMM d, yyyy",
                      )}
                    </p>
                  </>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Average Daily
                </p>
                <p className="font-bold text-lg">
                  {formatCurrency(avgDailySales)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {displayItems.length} sales days
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Period Total
                </p>
                <p className="font-bold text-lg text-blue-600">
                  {formatCurrency(totalPeriodSales)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {totalTransactions} trans • {totalItemsSold} items
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Best Growth
                </p>
                {bestGrowth > 0 && bestGrowthDay ? (
                  <>
                    <p className="font-bold text-lg text-green-600">
                      +{bestGrowth.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(
                        parseISO(bestGrowthDay.date || bestGrowthDay._id),
                        "MMM d",
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-lg text-gray-400">No growth</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      --
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {displayItems.length} days with sales in the selected
              period.
              {avgDailySales > 0 && (
                <span className="ml-2">
                  Average sales per day:{" "}
                  <span className="font-medium">
                    {formatCurrency(avgDailySales)}
                  </span>
                </span>
              )}
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <LineChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Sales Data
          </h4>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            No sales recorded in the selected period. Sales will appear here
            once transactions are completed.
          </p>
        </div>
      )}
    </div>
  );
};

export default SalesTrend;
