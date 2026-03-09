import { useState, useMemo } from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Archive,
  BarChart3,
  PieChart,
  Activity,
  Star,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Award,
  Layers,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
} from "recharts";

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
  COLORS.primary,
  COLORS.success,
  COLORS.purple,
  COLORS.warning,
  COLORS.pink,
  COLORS.indigo,
  COLORS.teal,
  COLORS.orange,
];

const ProductVisualization = ({ products, summaryMetrics, onRefresh }) => {
  const [viewType, setViewType] = useState("performance"); // performance, distribution, treemap, radar
  const [chartType, setChartType] = useState("bar"); // bar, pie, line, scatter
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Prepare data for different visualizations
  const performanceData = useMemo(() => {
    return products.map((p) => ({
      name:
        p.productName.length > 20
          ? p.productName.substring(0, 20) + "..."
          : p.productName,
      fullName: p.productName,
      revenue: p.totalRevenue || 0,
      profit: p.totalProfit || 0,
      units: p.totalSold || 0,
      margin: p.profitMargin || 0,
      stock: p.currentStock || 0,
      turnover: p.stockTurnover || 0,
      category: p.category || "Uncategorized",
      brand: p.brand || "Unknown",
      sku: p.sku,
    }));
  }, [products]);

  // Category distribution data
  const categoryData = useMemo(() => {
    const categories = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!categories[cat]) {
        categories[cat] = {
          category: cat,
          count: 0,
          revenue: 0,
          profit: 0,
          units: 0,
        };
      }
      categories[cat].count++;
      categories[cat].revenue += p.totalRevenue || 0;
      categories[cat].profit += p.totalProfit || 0;
      categories[cat].units += p.totalSold || 0;
    });
    return Object.values(categories).sort((a, b) => b.revenue - a.revenue);
  }, [products]);

  // Stock vs Sales scatter data
  const scatterData = useMemo(() => {
    return products.map((p) => ({
      name: p.productName,
      stock: p.currentStock || 0,
      sales: p.totalSold || 0,
      revenue: p.totalRevenue || 0,
      category: p.category || "Uncategorized",
      margin: p.profitMargin || 0,
      size: Math.sqrt(p.totalRevenue || 0) / 10,
    }));
  }, [products]);

  // Performance metrics for radar
  const radarData = useMemo(() => {
    const topProducts = [...products]
      .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
      .slice(0, 5);

    return topProducts.map((p) => ({
      product:
        p.productName.length > 15
          ? p.productName.substring(0, 15) + "..."
          : p.productName,
      revenue: (p.totalRevenue || 0) / 1000, // Scale down for radar
      profit: (p.totalProfit || 0) / 1000,
      units: p.totalSold || 0,
      margin: p.profitMargin || 0,
      turnover: (p.stockTurnover || 0) * 100, // Scale up percentage
    }));
  }, [products]);

  // Treemap data
  const treemapData = useMemo(() => {
    return {
      name: "Products",
      children: products.map((p) => ({
        name: p.productName,
        size: p.totalRevenue || 0,
        category: p.category,
        value: p.totalRevenue || 0,
        profit: p.totalProfit || 0,
        units: p.totalSold || 0,
      })),
    };
  }, [products]);

  // Get metric value for charts
  const getMetricValue = (item, metric) => {
    switch (metric) {
      case "revenue":
        return item.revenue;
      case "profit":
        return item.profit;
      case "units":
        return item.units;
      case "margin":
        return item.margin;
      case "turnover":
        return item.turnover;
      default:
        return item.revenue;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num || 0);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-sm shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            {payload[0]?.payload?.fullName || label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name.toLowerCase().includes("revenue") ||
              entry.name.toLowerCase().includes("profit")
                ? formatCurrency(entry.value)
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4 overflow-auto" : ""}`}
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
                Product Analytics Dashboard
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {products.length} products • {categoryData.length} categories
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
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
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
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Control Panel */}
        {showControls && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Visualization Type
                </label>
                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="performance">Performance Analysis</option>
                  <option value="distribution">Category Distribution</option>
                  <option value="treemap">Revenue Treemap</option>
                  <option value="radar">Top Products Radar</option>
                  <option value="scatter">Stock vs Sales</option>
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
                  disabled={viewType === "treemap" || viewType === "radar"}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="line">Line Chart</option>
                  {viewType === "scatter" && (
                    <option value="scatter">Scatter Plot</option>
                  )}
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
                  <option value="revenue">Revenue</option>
                  <option value="profit">Profit</option>
                  <option value="units">Units Sold</option>
                  <option value="margin">Profit Margin</option>
                  <option value="turnover">Stock Turnover</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="flex space-x-1">
                  <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700">
                    Apply
                  </button>
                  <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Visualization Area */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewType === "performance" &&
              (chartType === "bar" ? (
                <BarChart
                  data={performanceData.slice(0, 10)}
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
                    fill={COLORS.primary}
                    name={
                      selectedMetric.charAt(0).toUpperCase() +
                      selectedMetric.slice(1)
                    }
                  />
                </BarChart>
              ) : chartType === "pie" ? (
                <RePieChart>
                  <Pie
                    data={performanceData.slice(0, 8)}
                    dataKey={selectedMetric}
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={(entry) => entry.name}
                  >
                    {performanceData.slice(0, 8).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RePieChart>
              ) : (
                <LineChart
                  data={performanceData}
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
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke={COLORS.primary}
                    strokeWidth={2}
                  />
                </LineChart>
              ))}

            {viewType === "distribution" && (
              <RePieChart>
                <Pie
                  data={categoryData}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label={(entry) =>
                    `${entry.category}: ${formatCurrency(entry.revenue)}`
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RePieChart>
            )}

            {viewType === "treemap" && (
              <Treemap
                data={treemapData.children}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill={COLORS.primary}
                content={<CustomTreemapContent />}
              />
            )}

            {viewType === "radar" && (
              <RadarChart outerRadius={200} data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="product"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                />
                <PolarRadiusAxis tick={{ fill: "#9CA3AF" }} />
                <Radar
                  name="Revenue"
                  dataKey="revenue"
                  stroke={COLORS.primary}
                fill={COLORS.primary}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Profit"
                  dataKey="profit"
                  stroke={COLORS.success}
                  fill={COLORS.success}
                  fillOpacity={0.6}
                />
                <Radar
                  name="Units"
                  dataKey="units"
                  stroke={COLORS.warning}
                  fill={COLORS.warning}
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            )}

            {viewType === "scatter" && (
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid stroke="#374151" />
                <XAxis
                  type="number"
                  dataKey="stock"
                  name="Stock"
                  unit=" units"
                  tick={{ fill: "#9CA3AF" }}
                />
                <YAxis
                  type="number"
                  dataKey="sales"
                  name="Sales"
                  unit=" units"
                  tick={{ fill: "#9CA3AF" }}
                />
                <ZAxis type="number" dataKey="size" range={[50, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={<ScatterTooltip />}
                />
                <Legend />
                <Scatter
                  name="Products"
                  data={scatterData}
                  fill={COLORS.primary}
                  shape="circle"
                />
              </ScatterChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-sm">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Total
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summaryMetrics?.totalRevenue || 0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total Revenue
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-sm">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {summaryMetrics?.avgProfitMargin?.toFixed(1)}% avg
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summaryMetrics?.totalProfit || 0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total Profit
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-sm">
              <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatNumber(summaryMetrics?.totalSold || 0)} units
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(summaryMetrics?.totalTransactions || 0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total Transactions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-sm">
              <Archive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatNumber(summaryMetrics?.currentStock || 0)} total
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {products.filter((p) => p.currentStock <= 5).length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Low Stock Products
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <PieChart className="h-4 w-4 mr-2 text-blue-500" />
          Category Performance Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {categoryData.slice(0, 6).map((cat, index) => (
            <div
              key={cat.category}
              className="border border-gray-200 dark:border-gray-700 rounded-sm p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {cat.category}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {cat.count} products
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Revenue:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(cat.revenue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Profit:
                  </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(cat.profit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Units Sold:
                  </span>
                  <span className="font-medium">{formatNumber(cat.units)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{
                      width: `${(cat.revenue / categoryData[0].revenue) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Custom Treemap Content
const CustomTreemapContent = (props) => {
  const { x, y, width, height, name, value, profit } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: profit > 0 ? COLORS.primary : COLORS.gray,
          stroke: "#fff",
          strokeWidth: 2,
          fillOpacity: 0.8,
        }}
      />
      {width > 50 && height > 30 && (
        <>
          <text
            x={x + 5}
            y={y + 15}
            fill="#fff"
            fontSize={12}
            fontWeight="bold"
          >
            {name?.substring(0, 15)}
          </text>
          <text x={x + 5} y={y + 30} fill="#fff" fontSize={10}>
            {formatCurrency(value)}
          </text>
        </>
      )}
    </g>
  );
};

// Scatter Plot Tooltip
const ScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-sm shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white mb-1">
          {data.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Stock: {formatNumber(data.stock)} units
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Sales: {formatNumber(data.sales)} units
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Revenue: {formatCurrency(data.revenue)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Margin: {data.margin?.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

// Helper functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US").format(num || 0);
};

export default ProductVisualization;
