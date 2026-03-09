import { Download, AlertTriangle, Eye, Sparkles } from "lucide-react";
import SalesReport from "./SalesReport";
import StorePerformance from "./StorePerformance";
import AdminProductReports from "./AdminProductReports";
import StoresPerformanceComparison from "./StoresComparison";
import AdminAlerts from "./AdminAlerts";
const MainReportContent = ({
  dashboardLoading,
  selectedReport,
  metrics,
  recentSales,
  formatCurrency,
  inventoryLoading,
  inventoryData,
  handleExport,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {dashboardLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-sm h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {selectedReport === "dashboard" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Dashboard Overview
                </h2>
                <button className="inline-flex items-center text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Full Report
                </button>
              </div>

              {/* Sales & Inventory Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-sm">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                    Sales Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Revenue
                      </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(metrics.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Transactions
                      </span>
                      <span className="font-medium">
                        {metrics.totalTransactions}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Avg. Transaction
                      </span>
                      <span className="font-medium">
                        {formatCurrency(
                          metrics.totalRevenue /
                            (metrics.totalTransactions || 1),
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-sm">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                    Inventory Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Value
                      </span>
                      <span className="font-medium">
                        {formatCurrency(metrics.inventoryValue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Low Stock
                      </span>
                      <span
                        className={`font-medium ${metrics.lowStockItems > 0 ? "text-yellow-600" : "text-green-600"}`}
                      >
                        {metrics.lowStockItems}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Out of Stock
                      </span>
                      <span
                        className={`font-medium ${metrics.outOfStockItems > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        {metrics.outOfStockItems}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Sales */}
              {recentSales.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden mb-4">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      Recent Sales
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentSales.map((sale, index) => (
                      <div
                        key={index}
                        className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {sale.store?.name || "Unknown Store"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {sale.date
                              ? new Date(sale.date).toLocaleDateString()
                              : "No date"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600 text-sm">
                            {formatCurrency(
                              sale.totalSales || sale.totalAmount || 0,
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {sale.transactionCount || 1} trans
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <StorePerformance />
            </div>
          )}

          {selectedReport === "sales" && <SalesReport />}

          {selectedReport === "inventory" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Inventory Reports
                </h2>
                <button
                  onClick={() => handleExport("inventory")}
                  className="inline-flex items-center text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export
                </button>
                <button className="hidden px-4 py-2.5 rounded-sm bg-linear-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 md:flex items-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold text-sm">{"AI Feedback"}</span>
                </button>
              </div>
              {inventoryLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-sm h-6 w-6 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <div>
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-sm">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">
                      Inventory Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Total Items
                        </p>
                        <p className="text-base font-medium">
                          {inventoryData.summary?.totalItems || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Total Value
                        </p>
                        <p className="text-base font-medium text-green-600">
                          {formatCurrency(
                            inventoryData.summary?.totalValue || 0,
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Low Stock
                        </p>
                        <p className="text-base font-medium text-yellow-600">
                          {inventoryData.summary?.lowStockCount || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Out of Stockfe
                        </p>
                        <p className="text-base font-medium text-red-600">
                          {inventoryData.summary?.outOfStockCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedReport === "stores" && <StoresPerformanceComparison />}

          {selectedReport === "products" && (
            <AdminProductReports handleExport={handleExport} />
          )}

          {selectedReport === "alerts" && <AdminAlerts metrics={metrics} />}
        </>
      )}
    </div>
  );
};

export default MainReportContent;
