import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  BarChart3,
  PieChart,
  Store,
  DollarSign,
  Package,
  Award,
  AlertCircle,
  Layers,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(1)}%`;
};

const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  pink: "#EC4899",
  indigo: "#6366F1",
  teal: "#14B8A6",
  orange: "#F97316",
  gray: "#6B7280",
};

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#6366F1",
  "#14B8A6",
];

const StoreComparisonVisualization = ({ data, onRefresh, isLoading }) => {
  const [viewType, setViewType] = useState("overview"); // overview, performance, inventory, risk
  const [chartType, setChartType] = useState("bar"); // bar, radar, scatter, pie
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedStores, setSelectedStores] = useState([]);

  // Process store data
  const processedStores = useMemo(() => {
    if (!data?.stores) return [];

    return data.stores.map((store) => ({
      id: store.storeInfo.id,
      name: store.storeInfo.name,
      code: store.storeInfo.code,
      city: store.storeInfo.address?.city || "Unknown",
      status: store.storeInfo.status,

      // Sales metrics
      revenue: store.metrics.sales.revenue || 0,
      profit: store.metrics.sales.profit || 0,
      profitMargin: store.metrics.sales.profitMargin || 0,
      transactions: store.metrics.sales.transactions || 0,
      avgTransaction: store.metrics.sales.avgTransactionValue || 0,
      itemsSold: store.metrics.sales.itemsSold || 0,

      // Inventory metrics
      inventoryValue: store.metrics.inventory.inventoryValue || 0,
      inventoryItems: store.metrics.inventory.totalItems || 0,
      inventoryTurnover: store.metrics.inventory.inventoryTurnover || 0,
      lowStockItems: store.metrics.inventory.lowStockItems || 0,
      outOfStockItems: store.metrics.inventory.outOfStockItems || 0,

      // Efficiency metrics
      operationalHours: store.metrics.efficiency.operationalHours || 0,
      revenuePerHour: store.metrics.efficiency.revenuePerHour || 0,

      // Risk metrics
      profitabilityRisk: store.metrics.risk.profitabilityRisk || 0,
      marketRisk: store.metrics.risk.marketRisk || 0,

      // Scores
      salesScore: store.scores?.sales || 0,
      inventoryScore: store.scores?.inventory || 0,
      riskScore: store.scores?.risk || 0,
      overallScore: store.overallScore || 0,

      // Rankings
      overallRank: store.rankings?.overall?.rank || 0,
      salesRank: store.rankings?.sales?.rank || 0,
      inventoryRank: store.rankings?.inventory?.rank || 0,

      // Trends
      trend: store.trends?.direction || "neutral",

      // vs Benchmark
      vsRevenue: store.vsBenchmark?.sales?.revenue?.status || "equal",
      vsProfit: store.vsBenchmark?.sales?.profit?.status || "equal",
    }));
  }, [data]);

  // Sort stores by revenue
  const sortedStores = useMemo(() => {
    return [...processedStores].sort((a, b) => b.revenue - a.revenue);
  }, [processedStores]);

  // Metrics for selection
  const metrics = [
    {
      id: "revenue",
      name: "Revenue",
      color: COLORS.primary,
      format: formatCurrency,
    },
    {
      id: "profit",
      name: "Profit",
      color: COLORS.success,
      format: formatCurrency,
    },
    {
      id: "profitMargin",
      name: "Profit Margin",
      color: COLORS.warning,
      format: formatPercent,
    },
    {
      id: "inventoryValue",
      name: "Inventory Value",
      color: COLORS.purple,
      format: formatCurrency,
    },
    {
      id: "inventoryTurnover",
      name: "Inventory Turnover",
      color: COLORS.teal,
      format: (v) => v.toFixed(2),
    },
    {
      id: "transactions",
      name: "Transactions",
      color: COLORS.pink,
      format: (v) => v.toLocaleString(),
    },
    {
      id: "itemsSold",
      name: "Items Sold",
      color: COLORS.orange,
      format: (v) => v.toLocaleString(),
    },
    {
      id: "overallScore",
      name: "Overall Score",
      color: COLORS.indigo,
      format: (v) => `${v}/100`,
    },
  ];

  // Radar chart data - top 3 stores
  const radarData = useMemo(() => {
    const topStores = sortedStores.slice(0, 3);
    return topStores.map((store) => ({
      store: store.name.split(" ").slice(0, 2).join(" "),
      Sales: store.salesScore,
      Inventory: store.inventoryScore,
      Risk: 100 - store.riskScore, // Invert risk so higher is better
      Overall: store.overallScore,
      fullName: store.name,
    }));
  }, [sortedStores]);

  // Scatter plot data - Revenue vs Inventory
  const scatterData = useMemo(() => {
    return sortedStores.map((store) => ({
      name: store.name,
      revenue: store.revenue,
      inventory: store.inventoryValue,
      profitMargin: store.profitMargin,
      itemsSold: store.itemsSold,
      score: store.overallScore,
      size: Math.max(50, Math.min(500, store.revenue / 1000)),
      fill:
        store.overallScore >= 70
          ? COLORS.success
          : store.overallScore >= 50
            ? COLORS.primary
            : store.overallScore >= 30
              ? COLORS.warning
              : COLORS.danger,
    }));
  }, [sortedStores]);

  // Distribution by score range
  const distributionData = useMemo(() => {
    const ranges = [
      { name: "Excellent (70-100)", min: 70, max: 100, color: COLORS.success },
      { name: "Good (50-69)", min: 50, max: 69, color: COLORS.primary },
      { name: "Fair (30-49)", min: 30, max: 49, color: COLORS.warning },
      { name: "Poor (0-29)", min: 0, max: 29, color: COLORS.danger },
    ];

    return ranges
      .map((range) => ({
        name: range.name,
        value: processedStores.filter(
          (s) => s.overallScore >= range.min && s.overallScore <= range.max,
        ).length,
        color: range.color,
      }))
      .filter((d) => d.value > 0);
  }, [processedStores]);

  // Category comparison data
  const categoryData = useMemo(() => {
    const avgSales =
      processedStores.reduce((sum, s) => sum + s.salesScore, 0) /
      processedStores.length;
    const avgInventory =
      processedStores.reduce((sum, s) => sum + s.inventoryScore, 0) /
      processedStores.length;
    const avgRisk =
      processedStores.reduce((sum, s) => sum + (100 - s.riskScore), 0) /
      processedStores.length;

    return [
      { category: "Sales", average: avgSales, target: 80 },
      { category: "Inventory", average: avgInventory, target: 80 },
      { category: "Risk Management", average: avgRisk, target: 80 },
    ];
  }, [processedStores]);

  // Inventory vs Sales performance
  const inventoryPerformanceData = useMemo(() => {
    return sortedStores.map((store) => ({
      name: store.name.split(" ").slice(0, 2).join(" "),
      inventory: store.inventoryValue / 1000, // Scale for chart
      sales: store.revenue / 1000,
      turnover: store.inventoryTurnover * 10, // Scale for visibility
    }));
  }, [sortedStores]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-sm shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px]">
          <p className="font-medium text-gray-900 dark:text-white mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            {data.fullName || data.name || data.store || label}
          </p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-4">
                  {entry.name.toLowerCase().includes("revenue") ||
                  entry.name.toLowerCase().includes("profit") ||
                  entry.name.toLowerCase().includes("inventory") ||
                  entry.name.toLowerCase().includes("sales")
                    ? formatCurrency(entry.value)
                    : entry.name.toLowerCase().includes("margin")
                      ? formatPercent(entry.value)
                      : typeof entry.value === "number"
                        ? entry.value.toFixed(1)
                        : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data?.stores?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <Store className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Store Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            There are no stores to display in the comparison.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-gray-900 p-4 overflow-auto" : ""}`}
    >
      {/* Header with Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-sm">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Store Performance Analytics
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {processedStores.length} stores • {distributionData.length}{" "}
                performance tiers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
              title="Toggle Controls"
            >
              <Layers className="h-4 w-4" />
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                title="Refresh Data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Control Panel */}
        {showControls && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  View Type
                </label>
                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="overview">Overview Dashboard</option>
                  <option value="performance">Performance Comparison</option>
                  <option value="inventory">Inventory Analysis</option>
                  <option value="risk">Risk Assessment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Chart Type
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="radar">Radar Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="pie">Distribution</option>
                  <option value="area">Area Chart</option>
                  <option value="composed">Composed Chart</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Primary Metric
                </label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  {metrics.map((metric) => (
                    <option key={metric.id} value={metric.id}>
                      {metric.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700 w-full">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-sm">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                data.summary?.bestPerforming?.store
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Top:{" "}
              {data.summary?.bestPerforming?.store
                ?.split(" ")
                .slice(0, 2)
                .join(" ") || "N/A"}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(
              processedStores.reduce((sum, s) => sum + s.revenue, 0),
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total Revenue • {processedStores.length} stores
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-sm">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-green-600">
              Avg:{" "}
              {formatPercent(
                processedStores.reduce((sum, s) => sum + s.profitMargin, 0) /
                  processedStores.length,
              )}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(
              processedStores.reduce((sum, s) => sum + s.profit, 0),
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total Profit
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-sm">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-purple-600">
              {processedStores.reduce((sum, s) => sum + s.inventoryItems, 0)}{" "}
              items
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(
              processedStores.reduce((sum, s) => sum + s.inventoryValue, 0),
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total Inventory Value
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-sm">
              <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-medium text-amber-600">
              Score:{" "}
              {Math.round(
                processedStores.reduce((sum, s) => sum + s.overallScore, 0) /
                  processedStores.length,
              )}
              /100
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {sortedStores[0]?.name || "N/A"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Top Performer • Score: {sortedStores[0]?.overallScore || 0}
          </p>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewType === "overview" &&
              (chartType === "bar" ? (
                <BarChart
                  data={sortedStores}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#9CA3AF" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey={selectedMetric}
                    fill={
                      metrics.find((m) => m.id === selectedMetric)?.color ||
                      COLORS.primary
                    }
                  >
                    {sortedStores.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.overallScore >= 70
                            ? COLORS.success
                            : entry.overallScore >= 50
                              ? COLORS.primary
                              : entry.overallScore >= 30
                                ? COLORS.warning
                                : COLORS.danger
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : chartType === "radar" ? (
                <RadarChart outerRadius={150} data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis
                    dataKey="store"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <Radar
                    name="Sales"
                    dataKey="Sales"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Inventory"
                    dataKey="Inventory"
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Risk Management"
                    dataKey="Risk"
                    stroke={COLORS.warning}
                    fill={COLORS.warning}
                    fillOpacity={0.3}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RadarChart>
              ) : chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={150}
                    paddingAngle={2}
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              ) : chartType === "area" ? (
                <AreaChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" tick={{ fill: "#9CA3AF" }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stackId="1"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stackId="2"
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              ) : (
                <ComposedChart
                  data={inventoryPerformanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  />
                  <YAxis yAxisId="left" tick={{ fill: "#9CA3AF" }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="inventory"
                    fill={COLORS.purple}
                    name="Inventory (KSh '000)"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="sales"
                    fill={COLORS.success}
                    name="Sales (KSh '000)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="turnover"
                    stroke={COLORS.warning}
                    name="Turnover Rate"
                  />
                </ComposedChart>
              ))}

            {viewType === "performance" && (
              <BarChart
                data={sortedStores}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "#9CA3AF" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" fill={COLORS.primary} name="Revenue" />
                <Bar dataKey="profit" fill={COLORS.success} name="Profit" />
              </BarChart>
            )}

            {viewType === "inventory" && (
              <ScatterChart
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid stroke="#374151" />
                <XAxis
                  type="number"
                  dataKey="inventory"
                  name="Inventory Value"
                  tickFormatter={(v) =>
                    formatCurrency(v).replace("KES", "").trim()
                  }
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  label={{
                    value: "Inventory Value (KES)",
                    position: "bottom",
                    fill: "#9CA3AF",
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="revenue"
                  name="Revenue"
                  tickFormatter={(v) =>
                    formatCurrency(v).replace("KES", "").trim()
                  }
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  label={{
                    value: "Revenue (KES)",
                    angle: -90,
                    position: "left",
                    fill: "#9CA3AF",
                  }}
                />
                <ZAxis type="number" dataKey="size" range={[50, 400]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Scatter name="Stores" data={scatterData} shape="circle">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            )}

            {viewType === "risk" && (
              <BarChart
                data={sortedStores}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "#9CA3AF" }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="profitabilityRisk"
                  fill={COLORS.danger}
                  name="Profitability Risk"
                />
                <Bar
                  dataKey="marketRisk"
                  fill={COLORS.warning}
                  name="Market Risk"
                />
                <Bar
                  dataKey="overallScore"
                  fill={COLORS.success}
                  name="Overall Score"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Panel */}
      {data.insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Performers */}
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center mb-3">
              <Award className="h-5 w-5 text-yellow-500 mr-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Top Performers
              </h4>
            </div>
            <div className="space-y-3">
              {data.insights.topPerformers?.map((performer, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-green-50 dark:bg-green-900/20 rounded-sm"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {performer.store}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Score: {performer.score} • {performer.strengths?.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Improvement */}
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center mb-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Needs Improvement
              </h4>
            </div>
            <div className="space-y-3">
              {data.insights.improvementAreas?.map((area, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-sm"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {area.store}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Score: {area.score} •{" "}
                    {area.weaknesses?.slice(0, 2).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies & Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center mb-3">
              <Target className="h-5 w-5 text-purple-500 mr-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Key Recommendations
              </h4>
            </div>
            <div className="space-y-3">
              {data.insights.anomalies?.slice(0, 2).map((anomaly, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-sm"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {anomaly.store}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {anomaly.anomaly}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Store Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Store Performance Details
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {processedStores.length} stores • Last updated:{" "}
            {data.timestamp ? new Date(data.timestamp).toLocaleString() : "N/A"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Margin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Inventory
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Turnover
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedStores.map((store) => (
                <tr
                  key={store.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {store.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {store.city}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(store.revenue)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                    {formatCurrency(store.profit)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        store.profitMargin >= 80
                          ? "bg-green-100 text-green-800"
                          : store.profitMargin >= 60
                            ? "bg-blue-100 text-blue-800"
                            : store.profitMargin >= 40
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {formatPercent(store.profitMargin)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(store.inventoryValue)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {store.inventoryTurnover.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            store.overallScore >= 70
                              ? "bg-green-500"
                              : store.overallScore >= 50
                                ? "bg-blue-500"
                                : store.overallScore >= 30
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${store.overallScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {store.overallScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    #{store.overallRank}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoreComparisonVisualization;
