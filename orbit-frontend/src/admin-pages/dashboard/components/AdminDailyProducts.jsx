import { useAuth } from "../../../context/authentication/AuthenticationContext";
import {
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Package,
  Printer,
  ChevronDown,
  ChevronUp,
  Store,
  Calendar,
  Copy,
  Eye,
  RefreshCw,
} from "lucide-react";
import PrintDailySales from "./PrintableDailyReport";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminCopySKU from "../../products/components/AdminCopySKU";
import PrintContent from "../../admin-reports/components/PrintContent";

const AdminDailyProducts = ({
  itemsSold,
  formatCurrency,
  summary,
  dailyItemsRef,
  storeId,
}) => {
  const { userRole } = useAuth();
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate additional metrics
  const totalProfit = itemsSold.reduce(
    (sum, item) => sum + (item.totalProfit || 0),
    0,
  );
  const totalRevenue = itemsSold.reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0,
  );
  const totalCost = itemsSold.reduce(
    (sum, item) =>
      sum + (item.buyingPrice || 0) * (item.totalQuantitySold || 0),
    0,
  );
  const avgProfitMargin =
    totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;
  const totalQuantity = itemsSold.reduce(
    (sum, item) => sum + (item.totalQuantitySold || 0),
    0,
  );

  const [highlightFirstItem, setHighlightFirstItem] = useState(true);
  const highlightTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Toggle item expansion
  const toggleItem = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Get store info from items (if available)
  const getStoreDetails = () => {
    if (itemsSold.length > 0 && itemsSold[0].storeName) {
      return {
        name: itemsSold[0].storeName,
        code: itemsSold[0].storeCode || "",
      };
    }
    return null;
  };

  // Check if user can see profit details
  const canSeeProfit = userRole === "superadmin";

  // Get current date for printing
  const getCurrentDate = () => {
    return summary?.date ? new Date(summary.date) : new Date();
  };

  useEffect(() => {
    if (itemsSold.length > 0 && highlightFirstItem) {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightFirstItem(false);
      }, 3000);
      return () => {
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
      };
    }
  }, [itemsSold, highlightFirstItem]);

  // If not mobile, show the original table
  if (!isMobile) {
    return (
      <>
        <div className="overflow-x-auto" id="daily-items" ref={dailyItemsRef}>
          {/* Print Action Bar */}
          {itemsSold.length > 0 && (
            <div className="no-print mb-4 p-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-sm mx-2 mt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Printer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Need a printable report?
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowPrintOptions(!showPrintOptions)}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-sm transition-colors text-sm flex items-center gap-2"
                  >
                    <Printer className="h-3 w-3" />
                    {showPrintOptions ? "Hide Print Options" : "Print Report"}
                  </button>

                  {userRole === "superadmin" && (
                    <button
                      onClick={() => {
                        const printWindow = window.open("", "_blank");
                        printWindow.document.write(`
                                                    <html>
                                                        <head>
                                                            <title>Daily Sales Report</title>
                                                            <style>
                                                                body { font-family: Arial, sans-serif; padding: 20px; }
                                                                table { width: 100%; border-collapse: collapse; }
                                                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                                                th { background-color: #f2f2f2; }
                                                                .total { font-weight: bold; background-color: #f8f8f8; }
                                                                @media print {
                                                                    @page { margin: 15mm; }
                                                                    body { -webkit-print-color-adjust: exact; }
                                                                }
                                                            </style>
                                                        </head>
                                                        <body>
                                                            <h2>Daily Sales Report</h2>
                                                            <p>Date: ${getCurrentDate().toLocaleDateString()}</p>
                                                            <p>Total Items: ${totalQuantity}</p>
                                                            <p>Total Revenue: ${formatCurrency(totalRevenue)}</p>
                                                            <br>
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Product</th>
                                                                        <th>Qty</th>
                                                                        <th>Price</th>
                                                                        <th>Revenue</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    ${itemsSold
                                                                      .map(
                                                                        (
                                                                          item,
                                                                        ) => `
                                                                        <tr>
                                                                            <td>${item.productName}</td>
                                                                            <td>${item.totalQuantitySold || 0}</td>
                                                                            <td>${formatCurrency(item.sellingPrice)}</td>
                                                                            <td>${formatCurrency(item.totalRevenue)}</td>
                                                                        </tr>
                                                                    `,
                                                                      )
                                                                      .join("")}
                                                                </tbody>
                                                            </table>
                                                        </body>
                                                    </html>
                                                `);
                        printWindow.document.close();
                        printWindow.print();
                      }}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/30 rounded-sm transition-colors text-sm flex items-center gap-2"
                    >
                      Quick Print
                    </button>
                  )}
                </div>
              </div>

              {/* Print Options Panel */}
              {showPrintOptions && (
                <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                  <PrintDailySales
                    itemsSold={itemsSold}
                    summary={summary}
                    storeLabel={
                      getStoreDetails()?.name ||
                      (storeId === "global" ? "All Stores" : "Store")
                    }
                    selectedDate={getCurrentDate()}
                    formatCurrency={formatCurrency}
                    storeDetails={getStoreDetails()}
                  />
                </div>
              )}
            </div>
          )}

          {/* Summary Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-100 dark:bg-gray-800/30 border-b border-gray-300 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-sm">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Items Sold
                </p>
                <p className="text-gray-900 dark:text-white font-bold">
                  {totalQuantity}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-sm">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-gray-900 dark:text-white font-bold">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
            {canSeeProfit && (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total Profit
                    </p>
                    <p className="text-green-600 dark:text-green-400 font-bold">
                      {formatCurrency(totalProfit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-sm">
                    <ShoppingBag className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Avg Margin
                    </p>
                    <p
                      className={`font-bold ${avgProfitMargin > 50 ? "text-green-600 dark:text-green-500" : avgProfitMargin > 20 ? "text-yellow-600 dark:text-yellow-500" : "text-red-600 dark:text-red-500"}`}
                    >
                      {avgProfitMargin}%
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Original Table for Desktop */}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800/50">
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                  #
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                  Product
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                  SKU
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                  Category
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                  Quantity
                </th>
                {canSeeProfit && (
                  <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Cost
                  </th>
                )}
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                  Selling Price
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                  Revenue
                </th>
                {canSeeProfit && (
                  <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Profit
                  </th>
                )}
                {canSeeProfit && (
                  <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Margin
                  </th>
                )}
                {canSeeProfit && (
                  <th className="p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {itemsSold.map((item, index) => (
                <tr
                  key={`${item.productId}-${item.storeId || ""}-${index}`}
                  className={`border-t border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors 
                                        ${highlightFirstItem && index === 0 ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                >
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </td>
                  <td className="p-4 max-w-[200px]">
                    <div className="flex flex-col">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {item.productName}
                      </p>
                      {item.category && (
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-sm inline-block w-fit">
                          {item.category
                            .replace("gaming-", "")
                            .replace(/-/g, " ")}
                        </span>
                      )}
                      {item.storeName && storeId === "global" && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 mt-1 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-sm inline-block w-fit">
                          {item.storeName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="w-[170px]">
                      <AdminCopySKU productSku={item.sku} />
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {item.category
                        ?.replace("gaming-", "")
                        .replace(/-/g, " ") || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {item.totalQuantitySold || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.transactionCount || 0} transaction
                        {item.transactionCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </td>
                  {canSeeProfit && (
                    <td className="p-4">
                      <div className="flex flex-col">
                        <p className="text-red-600 dark:text-red-400">
                          {formatCurrency(item.buyingPrice)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Total:{" "}
                          {formatCurrency(
                            item.buyingPrice * item.totalQuantitySold,
                          )}
                        </p>
                      </div>
                    </td>
                  )}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <p className="text-gray-900 dark:text-white">
                        {formatCurrency(item.sellingPrice)}
                      </p>
                      {canSeeProfit && item.buyingPrice > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-500">
                          +
                          {formatCurrency(item.sellingPrice - item.buyingPrice)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <p className="text-gray-900 dark:text-white font-bold">
                        {formatCurrency(item.totalRevenue)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.sellingPrice > 0
                          ? `${Math.round(item.totalRevenue / item.sellingPrice)} units`
                          : "N/A"}
                      </p>
                    </div>
                  </td>
                  {canSeeProfit && (
                    <>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <p
                            className={`font-bold ${item.totalProfit > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {formatCurrency(item.totalProfit)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {item.totalProfitPerUnit
                              ? formatCurrency(item.profitPerUnit) + " per unit"
                              : item.totalQuantitySold > 0
                                ? formatCurrency(
                                    item.totalProfit / item.totalQuantitySold,
                                  ) + " per unit"
                                : "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <p
                            className={`font-bold ${
                              parseFloat(item.profitMargin || 0) > 50
                                ? "text-green-600 dark:text-green-500"
                                : parseFloat(item.profitMargin || 0) > 20
                                  ? "text-yellow-600 dark:text-yellow-500"
                                  : "text-red-600 dark:text-red-500"
                            }`}
                          >
                            {parseFloat(item.profitMargin || 0).toFixed(1)}%
                          </p>
                          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                            <div
                              className={`h-1.5 rounded-full ${
                                parseFloat(item.profitMargin || 0) > 50
                                  ? "bg-green-500"
                                  : parseFloat(item.profitMargin || 0) > 20
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min(parseFloat(item.profitMargin || 0), 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-sm transition-colors"
                            onClick={() =>
                              navigate(`/products/${item.productId}`)
                            }
                          >
                            View
                          </button>
                          <button
                            className="text-xs px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30 rounded-sm transition-colors"
                            onClick={() =>
                              console.log("Restock product:", item.productId)
                            }
                          >
                            Restock
                          </button>
                          {/* <PrintContent
                            item={item}
                            getCurrentDate={getCurrentDate}
                            formatCurrency={formatCurrency}
                            canSeeProfit={canSeeProfit}
                          /> */}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            {canSeeProfit && (
              <tfoot className="bg-gray-100 dark:bg-gray-800/50">
                <tr>
                  <td
                    colSpan="4"
                    className="p-4 text-right text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    GRAND TOTALS:
                  </td>
                  <td className="p-4 text-gray-900 dark:text-white font-bold text-sm">
                    {totalQuantity}
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(totalCost)}
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white text-sm">
                    {formatCurrency(totalRevenue)}
                  </td>
                  <td className="p-4 font-bold text-green-600 dark:text-green-400 text-sm">
                    {formatCurrency(totalProfit)}
                  </td>
                  <td className="p-4 font-bold text-sm">
                    <span
                      className={`${avgProfitMargin > 50 ? "text-green-600 dark:text-green-500" : avgProfitMargin > 20 ? "text-yellow-600 dark:text-yellow-500" : "text-red-600 dark:text-red-500"}`}
                    >
                      {avgProfitMargin}%
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-xs">Daily Summary</span>
                  </td>
                </tr>
                {/* Additional summary row */}
                <tr className="border-t border-gray-300 dark:border-gray-700">
                  <td
                    colSpan="10"
                    className="p-3 text-xs text-gray-600 dark:text-gray-500"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Avg Transaction:
                        </span>{" "}
                        <span className="text-gray-900 dark:text-white">
                          {summary?.averageTransaction
                            ? formatCurrency(summary.averageTransaction)
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Items/Transaction:
                        </span>{" "}
                        <span className="text-gray-900 dark:text-white">
                          {summary?.metrics?.itemsPerTransaction || "0.0"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Payment Methods:
                        </span>{" "}
                        <span className="text-gray-900 dark:text-white">
                          {summary?.paymentMethods
                            ?.map((p) => p.paymentMethod)
                            .join(", ") || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Date:
                        </span>{" "}
                        <span className="text-gray-900 dark:text-white">
                          {summary?.date
                            ? new Date(summary.date).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* Legend for non-superadmin users */}
          {!canSeeProfit && (
            <div className="p-4 border-t border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/30">
              <p className="text-xs text-gray-600 dark:text-gray-500 text-center">
                <span className="text-blue-600 dark:text-blue-400">Note:</span>{" "}
                Profit and margin details are only visible to super
                administrators
              </p>
            </div>
          )}

          {/* Empty State */}
          {itemsSold.length === 0 && (
            <div className="p-8 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-400 dark:text-gray-700 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-1">
                No products sold
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                No sales data available for the selected date and store
              </p>
            </div>
          )}
        </div>
      </>
    );
  }

  // MOBILE VIEW - Beautiful card-based layout
  return (
    <div className="px-2 pb-4" id="daily-items" ref={dailyItemsRef}>
      {/* Print Action Bar - Mobile Optimized */}
      {itemsSold.length > 0 && (
        <div className="no-print mb-4 p-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-sm mx-1 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Print Report
              </span>
            </div>
            <button
              onClick={() => setShowPrintOptions(!showPrintOptions)}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-sm text-sm flex items-center gap-1"
            >
              <Printer className="h-3 w-3" />
              {showPrintOptions ? "Hide" : "Options"}
            </button>
          </div>
          {showPrintOptions && (
            <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700">
              <PrintDailySales
                itemsSold={itemsSold}
                summary={summary}
                storeLabel={
                  getStoreDetails()?.name ||
                  (storeId === "global" ? "All Stores" : "Store")
                }
                selectedDate={getCurrentDate()}
                formatCurrency={formatCurrency}
                storeDetails={getStoreDetails()}
              />
            </div>
          )}
        </div>
      )}

      {/* Summary Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-sm border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 rounded-sm">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Items Sold
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {totalQuantity}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-sm border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-500/20 rounded-sm">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Revenue
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
        {canSeeProfit && (
          <>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-sm border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/20 rounded-sm">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Profit
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalProfit)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-3 rounded-sm border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 rounded-sm">
                  <ShoppingBag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Margin
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      avgProfitMargin > 50
                        ? "text-green-600"
                        : avgProfitMargin > 20
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {avgProfitMargin}%
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Date and Store Info */}
      {summary?.date && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(summary.date).toLocaleDateString("en-KE", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {storeId !== "global" && getStoreDetails() && (
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <Store className="h-3 w-3" />
              <span>{getStoreDetails().name}</span>
            </div>
          )}
        </div>
      )}

      {/* Product Cards - Mobile Optimized */}
      <div className="space-y-3">
        {itemsSold.map((item, index) => (
          <div
            key={`${item.productId}-${item.storeId || ""}-${index}`}
            className={`bg-white dark:bg-gray-800/50 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden
                            ${highlightFirstItem && index === 0 ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
          >
            {/* Card Header - Always Visible */}
            <div className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      #{index + 1}
                    </span>
                    {item.category && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {item.category
                          .replace("gaming-", "")
                          .replace(/-/g, " ")}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-base mt-2">
                    {item.productName}
                  </h3>
                </div>
                <button
                  onClick={() => toggleItem(item.productId)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  {expandedItems[item.productId] ? (
                    <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Qty
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {item.totalQuantitySold || 0}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Price
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.sellingPrice)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-sm">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Revenue
                  </p>
                  <p className="text-base font-semibold text-green-600 dark:text-green-500">
                    {formatCurrency(item.totalRevenue)}
                  </p>
                </div>
              </div>

              {/* SKU Row */}
              <div className="mt-2">
                <AdminCopySKU productSku={item.sku} />
              </div>

              {/* Store Indicator for Global View */}
              {storeId === "global" && item.storeName && (
                <div className="mt-2 flex items-center gap-1">
                  <Store className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {item.storeName}
                  </span>
                </div>
              )}
            </div>

            {/* Expanded Details - Shown when card is expanded */}
            {expandedItems[item.productId] && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/30">
                <div className="space-y-3">
                  {canSeeProfit && (
                    <>
                      {/* Profit Section */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Buying Price
                          </p>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            {formatCurrency(item.buyingPrice)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Total:{" "}
                            {formatCurrency(
                              item.buyingPrice * item.totalQuantitySold,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Total Profit
                          </p>
                          <p
                            className={`text-sm font-bold ${item.totalProfit > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatCurrency(item.totalProfit)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.totalQuantitySold > 0
                              ? `${formatCurrency(item.totalProfit / item.totalQuantitySold)} per unit`
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Margin Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Profit Margin
                          </p>
                          <p
                            className={`text-sm font-bold ${
                              parseFloat(item.profitMargin || 0) > 50
                                ? "text-green-600"
                                : parseFloat(item.profitMargin || 0) > 20
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {parseFloat(item.profitMargin || 0).toFixed(1)}%
                          </p>
                        </div>
                        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              parseFloat(item.profitMargin || 0) > 50
                                ? "bg-green-500"
                                : parseFloat(item.profitMargin || 0) > 20
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(parseFloat(item.profitMargin || 0), 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Transactions Info */}
                      <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                        <span>Transactions: {item.transactionCount || 0}</span>
                        <span>
                          ROI:{" "}
                          {item.buyingPrice > 0
                            ? `${(((item.sellingPrice - item.buyingPrice) / item.buyingPrice) * 100).toFixed(1)}%`
                            : "N/A"}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => navigate(`/products/${item.productId}`)}
                      className="flex-1 min-w-[80px] px-3 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-sm text-sm hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <button
                      onClick={() =>
                        console.log("Restock product:", item.productId)
                      }
                      className="flex-1 min-w-[80px] px-3 py-2 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-sm text-sm hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Restock
                    </button>
                    {/* <div className="flex-1 min-w-[80px]">
                      <PrintContent
                        item={item}
                        getCurrentDate={getCurrentDate}
                        formatCurrency={formatCurrency}
                      />
                    </div> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State - Mobile */}
      {itemsSold.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-gray-800/50 rounded-sm border border-gray-200 dark:border-gray-700">
          <ShoppingBag className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-1">
            No products sold
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            No sales data available for the selected date and store
          </p>
        </div>
      )}

      {/* Legend for non-superadmin users - Mobile */}
      {!canSeeProfit && itemsSold.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-400 text-center">
            <span className="font-medium">Note:</span> Profit and margin details
            are only visible to super administrators
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDailyProducts;
