import {
  Download,
  Package,
  Plus,
  ShoppingCart,
  Eye,
  Trash2,
  AlertCircle,
  ArrowRightLeft,
} from "lucide-react";
import { openSellModal } from "../../products/redux/sell-modal-slice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import ShowConfirmDialog from "./ShowConfirmDialog";
import AdminCopySKU from "../../products/components/AdminCopySKU";
import { useRole } from "../../../context/authentication/RoleContext";
import StockTransferModal from "./StoreTransferModal";

const InventoryTable = ({
  hasStore,
  isLoading,
  isError,
  filteredItems,
  currentStore,
  handleRecordSale,
  handleRestock,
  getStatusColor,
  handleDelete,
  pagination,
  onPageChange,
  onExport,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { canEditStore, canSellInStore, canManageStore } = useRole();

  // State for confirmation dialogs
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState("");

  // State for transfer modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferMode, setTransferMode] = useState("single");
  const [selectedTransferItem, setSelectedTransferItem] = useState(null);

  // Helper function to get product price
  const getProductPrice = (item) => {
    return item.product?.price || item.product?.sellingPrice || 0;
  };

  // Helper function to calculate total value
  const calculateTotalValue = (item) => {
    const price = getProductPrice(item);
    const stock = item.stock || 0;
    return price * stock;
  };

  // Format price in KES
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSellClick = (inventoryItem) => {
    dispatch(
      openSellModal({
        product: {
          ...inventoryItem.product,
          sellingPrice: getProductPrice(inventoryItem),
          stock: inventoryItem.stock,
          inventoryId: inventoryItem._id,
          storeId: inventoryItem.store,
          store: currentStore,
        },
      }),
    );
  };

  // Handle transfer click
  const handleTransferClick = (item) => {
    // Check if user has permission to transfer
    const storeId = currentStore?._id;
    if (!storeId) {
      alert("No store selected");
      return;
    }

    if (!canEditStore(storeId)) {
      alert("You don't have permission to transfer items from this store");
      return;
    }

    setSelectedTransferItem(item);
    setTransferMode("single");
    setShowTransferModal(true);
  };

  // Handle transfer success
  const handleTransferSuccess = (result) => {
    console.log("Transfer successful:", result);
  };

  const validateQuantity = (item, qty, action) => {
    setQuantityError("");

    if (qty <= 0) {
      setQuantityError("Quantity must be greater than 0");
      return false;
    }

    if (action === "sell" && qty > (item.stock || 0)) {
      setQuantityError(`Only ${item.stock} units available`);
      return false;
    }

    if (action === "restock" && qty > 1000) {
      setQuantityError("Maximum restock quantity is 1000");
      return false;
    }

    return true;
  };

  // Open confirmation dialog
  const openConfirmDialog = (action, item, qty = 1) => {
    // Check permissions
    const storeId = currentStore?._id;
    if (!storeId) return;

    if (action === "sell" && !canSellInStore(storeId)) {
      alert("You don't have permission to sell in this store");
      return;
    }

    if (action === "delete" && !canManageStore(storeId)) {
      alert("You don't have permission to delete items");
      return;
    }

    if (action === "restock" && !canEditStore(storeId)) {
      alert("You don't have permission to restock items");
      return;
    }

    // Validate quantity
    if (!validateQuantity(item, qty, action)) {
      return;
    }

    setConfirmAction(action);
    setSelectedItem(item);
    setQuantity(qty);
    setShowConfirmDialog(true);
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
    setSelectedItem(null);
    setQuantity(1);
    setQuantityError("");
  };

  // Handle confirmed action
  const handleConfirmedAction = () => {
    if (!selectedItem || !confirmAction) return;

    // Final validation
    if (!validateQuantity(selectedItem, quantity, confirmAction)) {
      return;
    }

    console.log("🔍 InventoryTable - handleConfirmedAction:", {
      action: confirmAction,
      inventoryId: selectedItem._id,
      productId: selectedItem.product?._id,
      quantity: quantity,
      storeId: currentStore?._id,
    });

    switch (confirmAction) {
      case "restock":
        handleRestock(selectedItem._id, quantity);
        break;
      case "sell":
        handleRecordSale(selectedItem._id, quantity);
        break;
      case "delete":
        handleDelete(selectedItem._id);
        break;
    }

    closeConfirmDialog();
  };

  const navigateToProduct = (item) => {
    if (item.product?._id) {
      navigate(`/products/${item.product._id}`);
    } else {
      console.error("Product ID not found for item:", item);
      alert("Product details not available");
    }
  };

  // Get confirmation message
  const getConfirmationMessage = () => {
    if (!selectedItem) return "";

    const price = getProductPrice(selectedItem);
    const totalAmount = price * quantity;

    switch (confirmAction) {
      case "restock":
        return `Restock ${quantity} unit${quantity > 1 ? "s" : ""} of "${selectedItem.product?.name}"?`;
      case "sell":
        return `Sell ${quantity} unit${quantity > 1 ? "s" : ""} of "${selectedItem.product?.name}" for ${formatPrice(totalAmount)}?`;
      case "delete":
        return `Remove "${selectedItem.product?.name}" from ${currentStore?.name} inventory? This action cannot be undone.`;
      default:
        return "";
    }
  };

  // Calculate totals for the current page
  const pageTotals = useMemo(() => {
    let totalValue = 0;
    let totalItems = 0;
    let lowStockCount = 0;

    filteredItems.forEach((item) => {
      totalValue += calculateTotalValue(item);
      totalItems += item.stock || 0;
      if (item.stock <= item.minStock) {
        lowStockCount++;
      }
    });

    return {
      totalValue,
      totalItems,
      lowStockCount,
      averageValue:
        filteredItems.length > 0 ? totalValue / filteredItems.length : 0,
    };
  }, [filteredItems]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Failed to Load Inventory
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please try refreshing the page or check your connection.
        </p>
      </div>
    );
  }

  return (
    <>
      {hasStore && filteredItems.length > 0 && (
        <div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden"
          id="inventory-table"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Inventory Items
                </h3>
                <div className="flex flex-wrap gap-4 mt-2">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {filteredItems.length} items • {pageTotals.totalItems} units
                  </p>
                  {pageTotals.lowStockCount > 0 && (
                    <p className="text-amber-600 dark:text-amber-400 text-sm">
                      ⚠️ {pageTotals.lowStockCount} low stock
                    </p>
                  )}
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                    Total Value: {formatPrice(pageTotals.totalValue)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Bulk Transfer Button */}
                {/* {canEditStore(currentStore?._id) && (
                  <button
                    onClick={() => {
                      setTransferMode("bulk");
                      setSelectedTransferItem(null);
                      setShowTransferModal(true);
                    }}
                    className="flex items-center space-x-2 px-3 py-2  bg-purple-600 hover:bg-purple-700 text-white rounded-sm text-sm transition-colors"
                    title="Bulk Transfer"
                  >
                    <ArrowRightLeft size={16} />
                    <span>Bulk Transfer</span>
                  </button>
                )} */}
                <button
                  onClick={onExport}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm text-gray-700 dark:text-gray-300 text-sm transition-colors"
                >
                  <Download size={16} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Product
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    SKU
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Category
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Stock
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Unit Price
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Value
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => {
                  const price = getProductPrice(item);
                  const totalValue = calculateTotalValue(item);
                  const isLowStock = item.stock <= item.minStock;
                  const isOutOfStock = item.stock === 0;
                  const canTransfer =
                    canEditStore(currentStore?._id) && item.stock > 0;

                  return (
                    <tr
                      key={item._id}
                      className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors
                                                ${isLowStock ? "bg-amber-50 dark:bg-amber-900/10" : ""}
                                                ${isOutOfStock ? "bg-rose-50 dark:bg-rose-900/10" : ""}
                                            `}
                    >
                      <td className="py-4 px-4">
                        <div className="min-w-[200px]">
                          <p
                            className="font-medium text-gray-900 dark:text-white truncate"
                            title={item.product?.name}
                          >
                            {item.product?.name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.product?.brand || ""}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <AdminCopySKU productSku={item?.product?.sku} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Package className="font-medium text-gray-900 dark:text-white truncate" />
                          <span className="text-gray-700 dark:text-gray-300 capitalize text-sm font-medium">
                            {item.product?.category?.replace(/-/g, " ") ||
                              "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p
                              className={`font-medium ${isLowStock ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}
                            >
                              {item.stock} units
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Min: {item.minStock}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() =>
                                openConfirmDialog("restock", item, 1)
                              }
                              className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 rounded transition-colors"
                              title="Add 1 unit"
                              disabled={!canEditStore(currentStore?._id)}
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              onClick={() => openConfirmDialog("sell", item, 1)}
                              className={`p-1 rounded transition-colors ${
                                isOutOfStock
                                  ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                  : "text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                              }`}
                              title={
                                isOutOfStock ? "Out of stock" : "Sell 1 unit"
                              }
                              disabled={
                                isOutOfStock ||
                                !canSellInStore(currentStore?._id)
                              }
                            >
                              <ShoppingCart size={14} />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formatPrice(price)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formatPrice(totalValue)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigateToProduct(item)}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* TRANSFER BUTTON - New */}
                          <button
                            onClick={() => handleTransferClick(item)}
                            className={`p-1 rounded transition-colors ${
                              canTransfer
                                ? "text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                                : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                            }`}
                            title={
                              canTransfer
                                ? "Transfer to another store"
                                : !canEditStore(currentStore?._id)
                                  ? "No transfer permission"
                                  : "Out of stock"
                            }
                            disabled={!canTransfer}
                          >
                            <ArrowRightLeft size={16} />
                          </button>

                          <button
                            onClick={() => openConfirmDialog("delete", item)}
                            className={`p-1 rounded transition-colors ${
                              canManageStore(currentStore?._id)
                                ? "text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20"
                                : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                            }`}
                            title={
                              canManageStore(currentStore?._id)
                                ? "Remove"
                                : "No delete permission"
                            }
                            disabled={!canManageStore(currentStore?._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredItems.length} items • Page {pagination.page}{" "}
                  of {pagination.pages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from(
                      { length: Math.min(5, pagination.pages) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              pagination.page === pageNum
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    )}
                  </div>
                  <button
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ShowConfirmDialog
          confirmAction={confirmAction}
          quantity={quantity}
          setQuantity={setQuantity}
          handleConfirmedAction={handleConfirmedAction}
          getConfirmationMessage={getConfirmationMessage}
          closeConfirmDialog={closeConfirmDialog}
          quantityError={quantityError}
          setQuantityError={setQuantityError}
          validateQuantity={() =>
            selectedItem &&
            validateQuantity(selectedItem, quantity, confirmAction)
          }
        />
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <StockTransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          mode={transferMode}
          sourceStoreId={currentStore?._id}
          productId={selectedTransferItem?.product?._id}
          filteredItems={filteredItems}
          onSuccess={handleTransferSuccess}
        />
      )}
    </>
  );
};

export default InventoryTable;
