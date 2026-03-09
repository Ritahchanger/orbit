import { useState } from "react";

import { useStoreComparison } from "../../hooks/store-comparison.mutations";
import {
  Minus,
  Award,
  AlertTriangle,
  Package,
  Sparkles,
  DollarSign,
  BarChart3,
  Star,
  TrendingUp as ArrowUp,
  TrendingDown as ArrowDown,
} from "lucide-react";

import StoreComparisonVisualization from "./StoreComparisonVisualization";

import { useDispatch } from "react-redux";

import { openAiResults } from "../../ai-results/ai-slice";

import { generateQuickAiInsights } from "./data";

import useAiAnalysis from "../../ai-results/use-ai-analytics.hook";

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

const StoresPerformanceComparison = () => {
  const {
    data: comparisonData,
    isLoading,
    error,
  } = useStoreComparison({
    metrics: ["sales", "inventory", "efficiency", "risk"],
    includeRanking: true,
    includeTrends: true,
  });

  const [showVisualization, setShowVisualization] = useState(false);

  const data = comparisonData?.data;

  const { analyzeData, isLoading: isAiLoading } = useAiAnalysis();

  const dispatch = useDispatch();

  const handleAnalyzeWithAi = async () => {
    if (!data) return;

    // Prepare data for AI analysis
    const analysisData = {
      stores: data.stores,
      benchmarks: data.benchmarks,
      insights: data.insights,
      summary: data.summary,
      metrics: ["sales", "inventory", "efficiency", "risk"],
      timestamp: data.timestamp,
    };

    const context = {
      title: "Store Performance Comparison Analysis",
      analyzing:
        "Analyzing store performance patterns and optimization opportunities...",
      type: "store_comparison",
      totalStores: data.summary?.totalStores || 0,
    };

    try {
      // Trigger AI analysis
      await analyzeData(analysisData, context);
    } catch (error) {
      console.error("AI analysis failed:", error);
    }
  };

  const handleQuickAiFeedback = () => {
    if (!data) return;

    // For quick feedback, we can show a pre-populated modal with insights
    const quickInsights = generateQuickAiInsights(data);

    dispatch(
      openAiResults({
        context: {
          title: "AI Store Performance Summary",
          type: "quick_feedback",
          timestamp: new Date().toISOString(),
        },
        viewMode: "summary",
      }),
    );

    // Note: In a real implementation, you would dispatch setAiResults here
    // For now, we'll rely on the mock data in the hook
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          Error loading comparison data
        </div>
      </div>
    );
  }

  if (!data?.stores?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          No store comparison data available
        </div>
      </div>
    );
  }

  const stores = data.stores;
  const benchmarks = data.benchmarks;
  const insights = data.insights;
  const summary = data.summary;

  // Sort stores by overall score
  const sortedStores = [...stores].sort(
    (a, b) => b.overallScore - a.overallScore,
  );

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing":
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "decreasing":
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80)
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (score >= 60)
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    if (score >= 40)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <Award className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-700" />;
    return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Stores Performance Comparison
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {summary?.totalStores} stores compared •{" "}
              {data?.timestamp
                ? new Date(data.timestamp).toLocaleDateString()
                : "Recent data"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Benchmark:{" "}
              <span className="font-medium">
                {benchmarks?.type || "average"}
              </span>
            </div>
            <button
              onClick={() => setShowVisualization(!showVisualization)}
              className="hidden px-4 py-2.5 rounded-sm bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 md:flex items-center space-x-2 transition-all duration-200"
            >
              <span className="font-semibold text-sm">
                {showVisualization ? "Table View" : "Visualization"}
              </span>
            </button>
            <button
              onClick={handleQuickAiFeedback}
              disabled={isAiLoading}
              className="hidden px-4 py-2.5 rounded-sm bg-linear-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 md:flex items-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-sm">
                {isAiLoading ? "Analyzing..." : "AI Feedback"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {showVisualization ? (
        <StoreComparisonVisualization
          data={data}
          onRefresh={handleAnalyzeWithAi}
          isLoading={isAiLoading}
        />
      ) : (
        <div>
          {/* Summary Stats */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-xs font-medium text-green-600">
                    Best
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {summary?.bestPerforming?.store || "N/A"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Score: {summary?.bestPerforming?.score || 0}/100
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-xs font-medium text-red-600">
                    Needs Help
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {summary?.worstPerforming?.store || "N/A"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Score: {summary?.worstPerforming?.score || 0}/100
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-xs font-medium text-blue-600">
                    Revenue Range
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary?.metricRanges?.sales?.min || 0)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  to {formatCurrency(summary?.metricRanges?.sales?.max || 0)}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-medium text-purple-600">
                    Inventory Range
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary?.metricRanges?.inventory?.min || 0)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  to{" "}
                  {formatCurrency(summary?.metricRanges?.inventory?.max || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Stores List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedStores.map((store, index) => (
              <div
                key={store.storeInfo.id}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getRankBadge(store.rankings?.overall?.rank)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {store.storeInfo.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {store.storeInfo.code} • {store.storeInfo.address?.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div
                      className={`px-3 py-1 rounded-sm text-sm font-medium ${getScoreColor(store.overallScore)}`}
                    >
                      {store.overallScore}/100
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Rank: {store.rankings?.overall?.rank}/
                      {store.rankings?.overall?.total}
                    </div>
                  </div>
                </div>

                {/* Store Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {/* Sales Metric */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sales
                        </span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {store.rankings?.sales?.percentile || "0"}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Revenue:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(store.metrics.sales.revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Profit:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatPercent(store.metrics.sales.profitMargin)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Metric */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Inventory
                        </span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {store.rankings?.inventory?.percentile || "0"}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Value:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(
                            store.metrics.inventory.inventoryValue,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Turnover:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {store.metrics.inventory.inventoryTurnover?.toFixed(
                            2,
                          ) || "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Efficiency Metric */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Efficiency
                        </span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {store.rankings?.efficiency?.percentile || "0"}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Rev/Hour:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(
                            store.metrics.efficiency.revenuePerHour,
                          ) || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Hours:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {store.metrics.efficiency.operationalHours}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Metric */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Risk
                        </span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        {store.rankings?.risk?.percentile || "0"}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Profit Risk:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {store.metrics.risk.profitabilityRisk}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Market Risk:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {store.metrics.risk.marketRisk}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trends and Benchmarks */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        Trend:
                      </span>
                      {getTrendIcon(store.trends?.direction)}
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {store.trends?.direction || "stable"}
                      </span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      vs Benchmark:
                      {store.vsBenchmark?.sales?.revenue?.status && (
                        <span
                          className={`ml-1 font-medium ${store.vsBenchmark.sales.revenue.status === "exceeding" ? "text-green-600" : "text-red-600"}`}
                        >
                          {store.vsBenchmark.sales.revenue.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {store.scores?.sales !== null && (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        Sales: {store.scores.sales}/100
                      </span>
                    )}
                    {store.scores?.inventory !== null && (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        Inventory: {store.scores.inventory}/100
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Insights Section */}
          {insights && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Key Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Performers */}
                <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center mb-3">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Top Performers
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {insights.topPerformers
                      ?.slice(0, 3)
                      .map((performer, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            {performer.store}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-green-600 dark:text-green-400">
                              Score: {performer.score}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Improvement Areas */}
                <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Needs Improvement
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {insights.improvementAreas?.slice(0, 3).map((area, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {area.store}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-amber-600 dark:text-amber-400">
                            Score: {area.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoresPerformanceComparison;
