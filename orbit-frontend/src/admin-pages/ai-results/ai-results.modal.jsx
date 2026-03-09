import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  X,
  Sparkles,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Clock,
  Zap,
  Brain,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Target,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Package,
  Store,
  Download,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { closeAiResults, changeViewMode } from "./ai-slice";

// You'll need to install these packages:
// npm install react-markdown remark-gfm rehype-raw

const AIResultsModal = () => {
  const dispatch = useDispatch();
  const { isOpen, isLoading, results, error, context, viewMode } = useSelector(
    (state) => state.aiResults,
  );

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        dispatch(closeAiResults());
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num || 0);
  };

  // Parse markdown content from AI response
  const parseMarkdownContent = () => {
    if (!results) return null;

    // If results is a string, it's markdown
    if (typeof results === "string") {
      return {
        markdown: results,
        summary: "",
        insights: [],
        metrics: null,
        recommendations: [],
      };
    }

    // If results is an object with markdown property
    if (results.markdown) {
      return results;
    }

    // If results has a content property with markdown
    if (results.content) {
      return {
        ...results,
        markdown: results.content,
      };
    }

    // Default fallback
    return results;
  };

  const parsedResults = parseMarkdownContent();

  // Render markdown content
  const renderMarkdown = (content) => {
    if (!content) return null;

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Custom component for headings
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl font-bold text-gray-900 dark:text-white mt-5 mb-3"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-base font-bold text-gray-900 dark:text-white mt-3 mb-2"
              {...props}
            />
          ),
          // Custom component for paragraphs
          p: ({ node, ...props }) => (
            <p
              className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
              {...props}
            />
          ),
          // Custom component for lists
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          // Custom component for code blocks
          code: ({ node, inline, ...props }) => {
            if (inline) {
              return (
                <code
                  className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                  {...props}
                />
              );
            }
            return (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                <code className="text-sm font-mono" {...props} />
              </pre>
            );
          },
          // Custom component for blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-4"
              {...props}
            />
          ),
          // Custom component for tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table
                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700"
              {...props}
            />
          ),
          // Custom component for links
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          // Custom component for horizontal rules
          hr: ({ node, ...props }) => (
            <hr
              className="my-6 border-t border-gray-200 dark:border-gray-700"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // Extract metrics from markdown if needed
  const extractMetricsFromMarkdown = (markdown) => {
    // You can implement regex patterns to extract metrics from markdown
    // For now, return null to use parsedResults.metrics if available
    return parsedResults.metrics || null;
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative">
            <Brain className="h-12 w-12 text-blue-500 animate-pulse" />
            <div className="absolute -inset-2 border-4 border-blue-200 rounded-full animate-ping opacity-20"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            AI is analyzing...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {context?.analyzing || "Processing your data"}
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Analysis Failed
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            {typeof error === "string"
              ? error
              : error?.message || "Unable to process the request"}
          </p>
          <button
            onClick={() => {
              dispatch(closeAiResults());
            }}
            className="px-4 py-2 rounded-sm bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-shadow"
          >
            Close & Try Again
          </button>
        </div>
      );
    }

    if (!results) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Sparkles className="h-16 w-16 text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            AI Insights Ready
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Select data to analyze or trigger an AI analysis from any module
          </p>
        </div>
      );
    }

    // If we have markdown content, render it directly
    if (parsedResults.markdown) {
      return (
        <div className="prose prose-blue dark:prose-invert max-w-none">
          {renderMarkdown(parsedResults.markdown)}
        </div>
      );
    }

    // Fallback to the structured view if no markdown
    switch (viewMode) {
      case "summary":
        return renderSummaryView();
      case "detailed":
        return renderDetailedView();
      case "recommendations":
        return renderRecommendationsView();
      default:
        return renderSummaryView();
    }
  };

  const renderSummaryView = () => {
    const { summary, insights, metrics, confidence } = parsedResults;

    return (
      <div className="space-y-6">
        {/* Header with confidence */}
        <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Analysis Summary
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {context?.title || "Performance Analysis"}
            </p>
          </div>
          {confidence && (
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(confidence)} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}
            >
              {getConfidenceBadge(confidence)}
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Sales
                </span>
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(metrics.totalSales)}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Profit
                </span>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(metrics.totalProfit)}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transactions
                </span>
                <ShoppingCart className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(metrics.totalTransactions)}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Profit Margin
                </span>
                <BarChart3 className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.averageProfitMargin?.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Summary Text */}
        {summary && (
          <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
            {typeof summary === "string" ? (
              <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                {summary}
              </p>
            ) : (
              renderMarkdown(summary)
            )}
          </div>
        )}

        {/* Main Insights */}
        {insights && insights.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Key Insights
            </h4>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  {typeof insight === "string" ? (
                    <p className="text-gray-800 dark:text-gray-200">
                      {insight}
                    </p>
                  ) : (
                    renderMarkdown(insight)
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDetailedView = () => {
    const { insights, metrics } = parsedResults;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Detailed Performance Analysis
        </h3>

        {/* Store Metrics */}
        {metrics && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-500" />
              Store Overview
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(metrics.totalCustomers)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Inventory Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(metrics.totalInventoryValue)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* All Insights */}
        {insights && insights.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Complete Analysis
            </h4>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  {typeof insight === "string" ? (
                    <p className="text-gray-700 dark:text-gray-300">
                      {insight}
                    </p>
                  ) : (
                    renderMarkdown(insight)
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRecommendationsView = () => {
    const { recommendations } = parsedResults;

    return (
      <div className="space-y-6">
        <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI Recommendations
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Actionable insights to improve store performance
          </p>
        </div>

        {recommendations && recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => {
              // Determine priority based on content or index
              let priority = "medium";
              let priorityColor =
                "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
              let icon = <Clock className="h-5 w-5 text-yellow-500" />;

              if (index === 0) {
                priority = "high";
                priorityColor =
                  "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
                icon = <AlertTriangle className="h-5 w-5 text-red-500" />;
              } else if (index === 2) {
                priority = "low";
                priorityColor =
                  "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
                icon = <CheckCircle className="h-5 w-5 text-blue-500" />;
              }

              return (
                <div
                  key={index}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${priorityColor.replace("text", "bg").replace("dark:text", "dark:bg")}`}
                    >
                      {icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Recommendation {index + 1}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${priorityColor}`}
                        >
                          {priority} priority
                        </span>
                      </div>
                      {typeof recommendation === "string" ? (
                        <p className="text-gray-600 dark:text-gray-400">
                          {recommendation}
                        </p>
                      ) : (
                        renderMarkdown(recommendation)
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No specific recommendations at this time.
            </p>
          </div>
        )}
      </div>
    );
  };

  const getConfidenceColor = (confidence) => {
    if (confidence === "high") return "text-green-500";
    if (confidence === "medium") return "text-yellow-500";
    if (confidence === "low") return "text-red-500";
    return "text-gray-500";
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence === "high") return "High Confidence";
    if (confidence === "medium") return "Medium Confidence";
    if (confidence === "low") return "Low Confidence";
    return "Confidence: " + confidence;
  };

  const handleExport = () => {
    const exportData = {
      content: parsedResults.markdown || results,
      summary: parsedResults?.summary,
      insights: parsedResults?.insights,
      metrics: parsedResults?.metrics,
      recommendations: parsedResults?.recommendations,
      timestamp: new Date().toISOString(),
      context: context,
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-insights-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    // Implement share functionality (e.g., copy to clipboard)
    const shareText =
      parsedResults.markdown || JSON.stringify(results, null, 2);
    navigator.clipboard.writeText(shareText);
    // You could show a toast notification here
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[200]"
            onClick={() => dispatch(closeAiResults())}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl z-[201] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    AI Insights
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {context?.title || "Powered by advanced analytics"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // This would trigger re-analysis
                    console.log("Refresh analysis");
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Refresh analysis"
                >
                  <RefreshCw className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => dispatch(closeAiResults())}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              {["summary", "detailed", "recommendations"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => dispatch(changeViewMode(mode))}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">{renderView()}</div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Brain className="h-4 w-4" />
                  <span>
                    ORBIT AI •{" "}
                    {parsedResults?.confidence
                      ? `${parsedResults.confidence} confidence`
                      : "Analysis complete"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 text-sm bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Insights
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIResultsModal;
