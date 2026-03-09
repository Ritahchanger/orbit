import { AlertTriangle, Package, Search, Eye, Filter } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminAlerts = ({
  metrics,
  lowStockProducts = [],
  outOfStockProducts = [],
}) => {
  const navigate = useNavigate();
  const [showAllLowStock, setShowAllLowStock] = useState(false);
  const [showAllOutOfStock, setShowAllOutOfStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Default empty arrays if not provided
  const lowStock = lowStockProducts || [];
  const outOfStock = outOfStockProducts || [];

  // Filter products based on search
  const filterProducts = (products) => {
    if (!searchTerm) return products;
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const filteredLowStock = filterProducts(lowStock);
  const filteredOutOfStock = filterProducts(outOfStock);

  const displayedLowStock = showAllLowStock
    ? filteredLowStock
    : filteredLowStock.slice(0, 5);
  const displayedOutOfStock = showAllOutOfStock
    ? filteredOutOfStock
    : filteredOutOfStock.slice(0, 5);

  const handleViewProduct = (productId) => {
    navigate(`/admin/inventory/${productId}`);
  };

  const handleViewAllLowStock = () => {
    navigate("/admin/inventory?filter=low-stock");
  };

  const handleViewAllOutOfStock = () => {
    navigate("/admin/inventory?filter=out-of-stock");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          System Alerts
        </h2>

        {/* Search input */}
        {(lowStock.length > 0 || outOfStock.length > 0) && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 w-64"
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.lowStockItems > 0 && (
            <div className="p-4 border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-sm">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
                    Low Stock Alert
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                    {metrics.lowStockItems} items below minimum stock level
                  </p>
                  <button
                    onClick={handleViewAllLowStock}
                    className="text-xs font-medium text-yellow-700 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 underline"
                  >
                    View all low stock items →
                  </button>
                </div>
              </div>
            </div>
          )}

          {metrics.outOfStockItems > 0 && (
            <div className="p-4 border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-sm">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-800 dark:text-red-300">
                    Out of Stock Alert
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                    {metrics.outOfStockItems} items are out of stock
                  </p>
                  <button
                    onClick={handleViewAllOutOfStock}
                    className="text-xs font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                  >
                    View all out of stock items →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Low Stock Products Table */}
        {filteredLowStock.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Low Stock Products ({filteredLowStock.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowAllLowStock(!showAllLowStock)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  {showAllLowStock ? "Show less" : "View all"}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Min Stock
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayedLowStock.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-8 w-8 rounded-sm object-cover mr-3"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-sm bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {product.category || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          {product.stockQuantity || product.quantity || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {product.minStock || 10}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Low Stock
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewProduct(product._id)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="View Product"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredLowStock.length > 5 && !showAllLowStock && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={() => setShowAllLowStock(true)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  + {filteredLowStock.length - 5} more low stock items
                </button>
              </div>
            )}
          </div>
        )}

        {/* Out of Stock Products Table */}
        {filteredOutOfStock.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Out of Stock Products ({filteredOutOfStock.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowAllOutOfStock(!showAllOutOfStock)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  {showAllOutOfStock ? "Show less" : "View all"}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Restocked
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayedOutOfStock.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-8 w-8 rounded-sm object-cover mr-3"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-sm bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {product.category || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {product.lastRestocked
                          ? new Date(product.lastRestocked).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Out of Stock
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewProduct(product._id)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="View Product"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOutOfStock.length > 5 && !showAllOutOfStock && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={() => setShowAllOutOfStock(true)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  + {filteredOutOfStock.length - 5} more out of stock items
                </button>
              </div>
            )}
          </div>
        )}

        {/* No Alerts State */}
        {metrics.lowStockItems === 0 && metrics.outOfStockItems === 0 && (
          <div className="py-10 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <AlertTriangle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Active Alerts
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              All products are adequately stocked. No low stock or out of stock
              items to display.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAlerts;
