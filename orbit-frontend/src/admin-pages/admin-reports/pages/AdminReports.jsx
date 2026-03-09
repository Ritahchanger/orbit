import AdminLayout from "../../dashboard/layout/Layout";
import { useState, useEffect } from "react";
import { useReports } from "../../hooks/reports.hooks";
import {
  Download,
  TrendingUp,
  AlertTriangle,
  Store,
  Package,
  Calendar,
  Lock,
} from "lucide-react";
import { format } from "date-fns";
import colorClasses from "../components/ColorClass";
import { useStoreContext } from "../../../context/store/StoreContext";
import MainReportContent from "../components/MainReportContent";
import { reportTypes } from "../components/ReportsTypes";
import { useRoleContext } from "../../../context/RolePermissionContext";
import { usePermissionCheck } from "../../../context/RolePermissionContext";
import { Navigate } from "react-router-dom";

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Permission mapping for reports
const REPORT_PERMISSIONS = {
  dashboard: "dashboard.view",
  sales: ["reports.view", "sales.view"],
  inventory: ["reports.view", "inventory.view"],
  stores: ["reports.view", "stores.view"],
  products: ["reports.view", "products.view"],
  workers: ["reports.view", "workers.view"],
  analytics: ["reports.view", "analytics.view"],
  financial: ["reports.view", "payments.manage"],
  export: "reports.export", // Assuming you have this permission
};

const AdminReports = () => {
  const [selectedReport, setSelectedReport] = useState(() => {
    // Try to get from sessionStorage on initial load
    const savedReport = sessionStorage.getItem("selectedReport");
    // Validate it's a valid report type
    const validReports = reportTypes.map((r) => r.id);
    return savedReport && validReports.includes(savedReport)
      ? savedReport
      : "dashboard";
  });

  const [selectedStore, setSelectedStore] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: format(
      new Date(new Date().setMonth(new Date().getMonth() - 1)),
      "yyyy-MM-dd",
    ),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  // Permission hooks
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissionCheck();

  const {
    canAccessAnyRole,
    userRoleName,
    loading: rolesLoading,
  } = useRoleContext();

  const {
    stores: contextStores,
    loading: storesLoading,
    currentStore,
  } = useStoreContext();

  // Check if user has access to reports at all
  const canViewReports =
    hasPermission("reports.view") || userRoleName === "superadmin";

  // Check specific report permissions
  const canViewSalesReport = hasAnyPermission(["reports.view", "sales.view"]);
  const canViewInventoryReport = hasAnyPermission([
    "reports.view",
    "inventory.view",
  ]);
  const canViewStoresReport = hasAnyPermission(["reports.view", "stores.view"]);
  const canViewAnalytics = hasAnyPermission(["reports.view", "analytics.view"]);
  const canExportReports =
    hasPermission("reports.export") || hasPermission("reports.generate");
  const canGenerateReports = hasPermission("reports.generate");

  // Report hooks - conditionally enable based on permissions and selected report
  const shouldFetchDashboard =
    canViewReports &&
    (selectedReport === "dashboard" || selectedReport === "sales");
  const shouldFetchSales = canViewSalesReport && selectedReport === "sales";
  const shouldFetchInventory =
    canViewInventoryReport && selectedReport === "inventory";

  const {
    data: dashboardApiResponse,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useReports.useDashboardStats(
    selectedStore === "all" ? null : selectedStore,
    { enabled: shouldFetchDashboard },
  );

  const {
    data: salesApiResponse,
    isLoading: salesLoading,
    refetch: refetchSales,
  } = useReports.useSalesReport(
    {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      storeId: selectedStore === "all" ? undefined : selectedStore,
    },
    { enabled: shouldFetchSales },
  );

  const {
    data: inventoryApiResponse,
    isLoading: inventoryLoading,
    refetch: refetchInventory,
  } = useReports.useInventoryReport(
    {
      storeId: selectedStore === "all" ? undefined : selectedStore,
    },
    { enabled: shouldFetchInventory },
  );

  const { mutate: exportReport } = useReports.useExportExcel();

  const salesData = salesApiResponse?.data || [];
  const inventoryData = inventoryApiResponse?.data || {};

  // Set default store selection based on context
  useEffect(() => {
    if (currentStore && currentStore !== "global") {
      setSelectedStore(currentStore._id);
    }
  }, [currentStore]);

  // Filter report types based on permissions
  const filteredReportTypes = reportTypes.filter((report) => {
    const permissions = REPORT_PERMISSIONS[report.id];

    if (!permissions) return true;

    if (Array.isArray(permissions)) {
      return hasAnyPermission(permissions) || userRoleName === "superadmin";
    }

    return hasPermission(permissions) || userRoleName === "superadmin";
  });

  const handleReportChange = (reportId) => {
    setSelectedReport(reportId);
    sessionStorage.setItem("selectedReport", reportId);
  };

  // Check if user has permission for the selected report
  const hasSelectedReportPermission = () => {
    const permissions = REPORT_PERMISSIONS[selectedReport];

    if (!permissions) return true;

    if (Array.isArray(permissions)) {
      return hasAnyPermission(permissions) || userRoleName === "superadmin";
    }

    return hasPermission(permissions) || userRoleName === "superadmin";
  };

  // Handle export with permission check
  const handleExport = (type) => {
    if (!canExportReports) {
      alert("You do not have permission to export reports");
      return;
    }

    exportReport(type, {
      ...filters,
      storeId: selectedStore === "all" ? undefined : selectedStore,
      ...dateRange,
    });
  };

  // Handle refresh all reports
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const promises = [];

      if (shouldFetchDashboard) promises.push(refetchDashboard());
      if (shouldFetchSales) promises.push(refetchSales());
      if (shouldFetchInventory) promises.push(refetchInventory());

      await Promise.all(promises);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary metrics (only if user has permission)
  const calculateMetrics = () => {
    if (!canViewReports)
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        uniqueProducts: 0,
        inventoryValue: 0,
        inventoryCost: 0,
        potentialProfit: 0,
      };

    const sales = Array.isArray(salesData) ? salesData : [];
    const inventorySummary = inventoryData.summary || {};

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + (sale.totalSales || sale.totalAmount || 0),
      0,
    );
    const totalTransactions = sales.reduce(
      (sum, sale) => sum + (sale.transactionCount || 1),
      0,
    );
    const lowStockItems = inventorySummary.lowStockCount || 0;
    const outOfStockItems = inventorySummary.outOfStockCount || 0;
    const uniqueProducts = inventorySummary.uniqueProductCount || 0;

    return {
      totalRevenue,
      totalTransactions,
      lowStockItems,
      outOfStockItems,
      uniqueProducts,
      inventoryValue: inventorySummary.totalValue || 0,
      inventoryCost: inventorySummary.totalCostValue || 0,
      potentialProfit: inventorySummary.potentialProfit || 0,
    };
  };

  const metrics = calculateMetrics();

  // Get current store name for display
  const currentStoreName =
    selectedStore === "all"
      ? "All Stores"
      : contextStores?.find((s) => s._id === selectedStore)?.name ||
        "Selected Store";

  // COMPACT Summary cards - conditionally show based on permissions
  const summaryCards = [
    canViewSalesReport && {
      title: "Revenue",
      value: formatCurrency(metrics.totalRevenue),
      change: "+12.5%",
      icon: TrendingUp,
      color: "green",
      description: `${metrics.totalTransactions} transactions`,
    },
    canViewInventoryReport && {
      title: "Inventory Value",
      value: formatCurrency(metrics.inventoryValue),
      change: formatCurrency(metrics.potentialProfit),
      icon: Package,
      color: "blue",
      description: `${metrics.uniqueProducts} products`,
    },
    canViewInventoryReport && {
      title: "Stock Alerts",
      value: metrics.lowStockItems + metrics.outOfStockItems,
      change: metrics.lowStockItems > 0 ? "Needs Attention" : "Good",
      icon: AlertTriangle,
      color:
        metrics.lowStockItems + metrics.outOfStockItems > 0 ? "red" : "green",
      description: `${metrics.outOfStockItems} out of stock`,
    },
    canViewStoresReport && {
      title: "Store Performance",
      value: contextStores?.length || 0,
      change: "Active Stores",
      icon: Store,
      color: "purple",
      description: currentStoreName,
    },
  ].filter(Boolean); // Remove falsy values

  // COMPACT Quick actions - conditionally show based on permissions
  const quickActions = [
    canViewSalesReport && {
      title: "Sales Report",
      description: "View sales analytics",
      action: () => setSelectedReport("sales"),
      icon: TrendingUp,
      color: "green",
    },
    canViewInventoryReport && {
      title: "Inventory Report",
      description: "Stock levels & alerts",
      action: () => setSelectedReport("inventory"),
      icon: Package,
      color: "purple",
    },
    canViewStoresReport && {
      title: "Stores Report",
      description: "Store performance",
      action: () => setSelectedReport("stores"),
      icon: Store,
      color: "orange",
    },
    canExportReports && {
      title: "Export Report",
      description: "Download current view",
      action: () => handleExport(selectedReport),
      icon: Download,
      color: "blue",
    },
  ].filter(Boolean); // Remove falsy values

  // Recent sales from actual data
  const recentSales = Array.isArray(salesData) ? salesData.slice(0, 3) : [];
  const storePerformanceData =
    contextStores?.map((store) => ({
      id: store._id,
      name: store.name,
      revenue: 0,
      transactions: 0,
      status: store.status || "active",
    })) || [];

  // Redirect if no permission to view reports at all
  if (!canViewReports && !rolesLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state while checking permissions
  if (rolesLoading || storesLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading reports...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Check if user has permission for selected report
  if (!hasSelectedReportPermission()) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-sm shadow-lg max-w-md">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have permission to view this report. Please contact your
              administrator.
            </p>
            <button
              onClick={() => setSelectedReport("dashboard")}
              className="px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Main Content */}
        <div className="px-4 sm:px-6 py-4">
          {/* Report Type Navigation */}
          <div className="mb-2">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto">
                {filteredReportTypes.map((report) => {
                  const Icon = report.icon;
                  const isActive = selectedReport === report.id;
                  const colors =
                    colorClasses[report.color] || colorClasses.blue;

                  return (
                    <button
                      key={report.id}
                      onClick={() => handleReportChange(report.id)}
                      className={`
                                                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-lg flex items-center
                                                ${
                                                  isActive
                                                    ? `${colors.text} border-${report.color}-500`
                                                    : "text-black dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 border-transparent"
                                                }
                                            `}
                    >
                      <Icon
                        className={`h-4 w-4 mr-1.5 ${isActive ? colors.text : ""}`}
                      />
                      {report.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* COMPACT Quick Actions - only show if there are actions */}
          {quickActions.length > 0 && (
            <div className="mb-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colors =
                    colorClasses[action.color] || colorClasses.blue;

                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`p-2 sm:p-3 rounded-sm border border-gray-200 dark:border-gray-700 
                                              bg-white dark:bg-gray-800 text-left hover:shadow-sm transition-shadow
                                              hover:border-${action.color}-300 dark:hover:border-${action.color}-600`}
                    >
                      <div className="flex items-center mb-1">
                        <div className={`p-1.5 rounded-sm ${colors.bg}`}>
                          <Icon className={`h-4 w-4 ${colors.text}`} />
                        </div>
                      </div>
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-0.5">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {action.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* COMPACT Summary Cards - only show if there are cards */}
          {summaryCards.length > 0 && (
            <div className="mb-2">
              <div
                className={`grid gap-2 ${
                  summaryCards.length === 1
                    ? "grid-cols-1"
                    : summaryCards.length === 2
                      ? "grid-cols-2"
                      : summaryCards.length === 3
                        ? "grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {summaryCards.map((card, index) => {
                  const Icon = card.icon;
                  const colors = colorClasses[card.color] || colorClasses.blue;
                  const isRed = card.color === "red";

                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`h-5 w-5 ${colors.text}`} />
                        <span
                          className={`text-xs font-medium ${isRed ? "text-red-600" : "text-green-600"}`}
                        >
                          {card.change}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
                        {card.value}
                      </h3>
                      <div className="flex justify-between items-end">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {card.title}
                        </p>
                        {card.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {card.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Report Content */}
          <MainReportContent
            dashboardLoading={dashboardLoading}
            selectedReport={selectedReport}
            metrics={metrics}
            recentSales={recentSales}
            storePerformanceData={storePerformanceData}
            formatCurrency={formatCurrency}
            inventoryLoading={inventoryLoading}
            inventoryData={inventoryData}
            contextStores={contextStores}
            storesLoading={storesLoading}
            selectedStore={selectedStore}
            currentStoreName={currentStoreName}
            userRole={userRoleName}
            hasExportPermission={canExportReports}
            hasGeneratePermission={canGenerateReports}
          />

          {/* Bottom Actions */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last updated:{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {currentStoreName !== "All Stores" && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-sm">
                    {currentStoreName}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-sm text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {loading ? "Refreshing..." : "Refresh Data"}
                </button>
                {canGenerateReports && (
                  <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent rounded-sm text-xs font-medium text-white bg-primary-600 hover:bg-primary-700">
                    Generate Custom Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
