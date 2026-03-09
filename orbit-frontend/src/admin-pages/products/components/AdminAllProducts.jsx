import {
  Edit,
  Trash2,
  Package,
  Plus,
  Eye,
  X,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { openSellModal } from "../redux/sell-modal-slice";
import { useDispatch } from "react-redux";
import AdminEditProductModal from "./UpdateProductModal";
import { toast } from "react-hot-toast";
import AdminUpdateProductStockModal from "./AdminUpdateProductModal";
import AdminCopySKU from "./AdminCopySKU";
import { useNavigate, useParams } from "react-router-dom";

// Import permission hooks from RolePermissionContext
import {
  useSimpleRolePermissionCheck,
  usePermissionCheck,
} from "../../../context/RolePermissionContext";
import { useAuth } from "../../../context/authentication/AuthenticationContext";
import ProductDetailsModal from "./ProductDetailsModal";

import { useUpdateStock } from "../../hooks/product.hooks";

const AdminAllProducts = ({
  filteredProducts,
  onPageChange,
  pagination,
  getCategoryIcon,
  categories,
  setSelectedProduct,
  setShowDeleteModal,
  getStatusColor,
}) => {
  // Use both permission hooks for different needs
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissionCheck();
  const { userRole } = useSimpleRolePermissionCheck();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId } = useParams();
  const { user } = useAuth();

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // State for stock update modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(null);
  const [stockAmount, setStockAmount] = useState(0);
  const [operation, setOperation] = useState("increment");

  // State for product details modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  // NEW: State for image modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Hook for updating stock
  const updateStockMutation = useUpdateStock();

  // Effect to show modal when productId is in URL
  useEffect(() => {
    if (productId && filteredProducts.length > 0) {
      const product = filteredProducts.find(
        (p) => p._id === productId || p.id === productId,
      );

      if (product) {
        setSelectedProductDetails(product);
        setShowProductModal(true);
      }
    }
  }, [productId, filteredProducts]);

  const handleSellClick = (product) => {
    dispatch(openSellModal({ product }));
  };

  // NEW: Handle image click to show modal
  const handleImageClick = (imageUrl, productName) => {
    setSelectedImage({
      url: imageUrl,
      title: productName,
    });
    setShowImageModal(true);
  };

  // Handle edit click with permission check
  const handleEditClick = (product) => {
    if (!hasAnyPermission(["products.update", "products.manage"])) {
      toast.error("You don't have permission to edit products");
      return;
    }
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // Handle stock update click with permission check
  const handleStockUpdateClick = (product) => {
    if (!hasAnyPermission(["products.update", "products.manage"])) {
      toast.error("You don't have permission to update stock");
      return;
    }
    setUpdatingProduct(product);
    setStockAmount(0);
    setOperation("increment");
    setShowStockModal(true);
  };

  // Handle view details click
  const handleViewDetails = (product) => {
    // Navigate to the same page with productId in URL
    navigate(`/admin/products/${product._id || product.id}`);
  };

  // Handle close product modal
  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setSelectedProductDetails(null);
    // Navigate back to products list (remove productId from URL)
    navigate("/admin/products");
  };

  // NEW: Handle close image modal
  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
  };

  // Close stock modal
  const handleCloseStockModal = () => {
    setShowStockModal(false);
    setUpdatingProduct(null);
    setStockAmount(0);
  };

  // Handle stock update
  const handleUpdateStock = async () => {
    if (!updatingProduct) return;

    if (stockAmount <= 0 && operation !== "decrement") {
      toast.error("Stock amount must be greater than 0");
      return;
    }

    if (operation === "decrement" && stockAmount > updatingProduct.quantity) {
      toast.error("Cannot reduce stock below 0");
      return;
    }

    try {
      await updateStockMutation.mutateAsync({
        productId: updatingProduct._id || updatingProduct.id,
        stockData: {
          stock: Math.abs(stockAmount),
          operation: operation,
        },
      });

      handleCloseStockModal();
    } catch (error) {
      toast.error(error.message || "Failed to update stock");
    }
  };

  // Helper function to check if product is selected
  const isProductSelected = (product) => {
    return productId && (product._id === productId || product.id === productId);
  };

  // Get primary image URL from product
  const getPrimaryImageUrl = (product) => {
    // Try different image properties based on your data structure
    if (product.primaryImage) return product.primaryImage;
    if (product.images && product.images.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      if (primary) return primary.url || primary.displayUrl;
      return product.images[0].url || product.images[0].displayUrl;
    }
    if (product.productImages && product.productImages.length > 0) {
      const primary = product.productImages.find((img) => img.isPrimary);
      if (primary) return primary.url;
      return product.productImages[0].url;
    }
    // Return placeholder if no image
    return "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  };

  // Check specific permissions for UI rendering
  const canViewProducts =
    hasPermission("products.view") ||
    hasAnyPermission(["products.manage", "products.view_cost"]);
  const canManageProducts = hasAnyPermission([
    "products.update",
    "products.delete",
    "products.manage",
  ]);
  const canViewCost =
    hasPermission("products.view_cost") || userRole === "superadmin";
  const canViewQuantity = hasAnyPermission([
    "products.view",
    "products.manage",
  ]);

  // Render action buttons based on permissions
  const renderActionButtons = (product) => {
    return (
      <div className="flex space-x-2">
        {/* View Details - Always visible if can view products */}
        {canViewProducts && (
          <button
            className="p-1 text-blue-600 dark:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-sm transition-colors"
            title="View Details"
            onClick={() => handleViewDetails(product)}
          >
            <Eye className="h-4 w-4" />
          </button>
        )}

        {/* Update Stock - With permission check */}
        {hasAnyPermission(["products.update", "products.manage"]) && (
          <button
            onClick={() => handleStockUpdateClick(product)}
            className="p-1 text-blue-600 dark:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-sm transition-colors"
            title="Update Stock"
          >
            <Package className="h-4 w-4" />
          </button>
        )}

        {/* Edit Product - With permission check */}
        {hasAnyPermission(["products.update", "products.manage"]) && (
          <button
            onClick={() => handleEditClick(product)}
            className="p-1 text-green-600 dark:text-green-500 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-sm transition-colors"
            title="Edit Product"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}

        {/* Delete Product - With permission check */}
        {hasPermission("products.delete") && (
          <button
            onClick={() => {
              setSelectedProduct(product);
              setShowDeleteModal(true);
            }}
            className="p-1 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-sm transition-colors"
            title="Delete Product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  // Show a message if user has no permissions at all
  if (!canViewProducts && !canManageProducts && userRole !== "superadmin") {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Package className="h-16 w-16 text-gray-400 dark:text-gray-500" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
            No Access
          </h3>
          <p className="text-gray-600 dark:text-gray-500 max-w-md">
            You don't have permission to view or manage products. Please contact
            your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm overflow-hidden"
        id="all-products"
      >
        <div className="overflow-x-auto">
          <table className="w-full ">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900/50">
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-[60px]">
                  Image
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-[200px]">
                  Device
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-[100px]">
                  SKU
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-[120px]">
                  Category
                </th>

                {/* Buying Price Column - Conditionally rendered */}
                {canViewCost && (
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-[100px]">
                    Buying Price
                  </th>
                )}

                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-[100px]">
                  Selling Price
                </th>

                {/* Quantity - Only for users with permission */}
                {canViewQuantity && (
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-[100px]">
                    Quantity
                  </th>
                )}

                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-[80px]">
                  Status
                </th>

                {/* Actions column - Only for users with any product management permissions */}
                {canManageProducts && (
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400 w-[100px]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => {
                const CategoryIcon = getCategoryIcon(product.category);
                const isSelected = isProductSelected(product);
                const imageUrl = getPrimaryImageUrl(product);

                return (
                  <tr
                    key={product._id}
                    className={`border-t border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400"
                        : ""
                    } ${index === 0 && !isSelected ? "bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 dark:border-blue-400" : ""}`}
                  >
                    {/* Image Column */}
                    <td className="py-3 px-4 align-middle">
                      <div className="flex items-center justify-center">
                        {imageUrl ? (
                          <button
                            onClick={() =>
                              handleImageClick(imageUrl, product.name)
                            }
                            className="group relative w-12 h-12 overflow-hidden rounded-sm border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200"
                            title="Click to view image"
                          >
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                          </button>
                        ) : (
                          <div className="w-12 h-12 rounded-sm border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Device Name */}
                    <td className="py-3 px-4 align-middle">
                      {canViewProducts ? (
                        <button
                          onClick={() => handleViewDetails(product)}
                          className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full"
                        >
                          <p className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate">
                            {product.name}
                          </p>
                          {product.brand && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {product.brand}
                            </p>
                          )}
                        </button>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-600 dark:text-gray-400 truncate">
                            {product.name}
                          </p>
                          {product.brand && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {product.brand}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-4 align-middle">
                      <AdminCopySKU productSku={product.sku} />
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 align-middle">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {
                            categories.find((c) => c.id === product.category)
                              ?.name
                          }
                        </span>
                      </div>
                    </td>

                    {/* Buying Price Cell - Conditionally rendered */}
                    {canViewCost && (
                      <td className="py-3 px-4 align-middle">
                        <p className="text-gray-900 dark:text-white font-medium">
                          KSh {product.buyingPrice?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Cost
                        </p>
                      </td>
                    )}

                    {/* Selling Price */}
                    <td className="py-3 px-4 align-middle">
                      <p className="text-gray-900 dark:text-white font-medium">
                        KSh {product.sellingPrice?.toLocaleString()}
                      </p>
                      {canViewCost ? (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Profit: KSh{" "}
                          {(
                            product.sellingPrice - product.buyingPrice
                          )?.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Selling Price
                        </p>
                      )}
                    </td>

                    {/* Quantity Cell - Conditionally rendered */}
                    {canViewQuantity && (
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {product.quantity} units
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Min: {product.minStock}
                            </p>
                          </div>
                          {hasAnyPermission([
                            "products.update",
                            "products.manage",
                          ]) &&
                            product.quantity <= product.minStock && (
                              <button
                                onClick={() => handleStockUpdateClick(product)}
                                className="flex-shrink-0 px-2 py-1 text-xs bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm flex items-center space-x-1"
                                title="Restock"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Restock</span>
                              </button>
                            )}
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    <td className="py-3 px-4 align-middle">
                      <span
                        className={`px-2 py-1 rounded-sm text-xs font-medium inline-block text-center min-w-[70px] ${getStatusColor(product.status)}`}
                      >
                        {product.status}
                      </span>
                    </td>

                    {/* Actions Cell - Conditionally rendered */}
                    {canManageProducts && (
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center space-x-2">
                          {renderActionButtons(product)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* Pagination Controls */}
            {pagination && (
              <tfoot>
                <tr>
                  <td
                    colSpan={canManageProducts ? 10 : 9}
                    className="py-4 px-4 bg-gray-50 dark:bg-gray-900/30"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing{" "}
                        <span className="font-semibold">
                          {filteredProducts.length}
                        </span>{" "}
                        products
                        {pagination.total > 0 && (
                          <>
                            {" "}
                            of{" "}
                            <span className="font-semibold">
                              {pagination.total}
                            </span>{" "}
                            total
                          </>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Previous Page Button */}
                        <button
                          onClick={() =>
                            onPageChange(pagination.page - 1, pagination.limit)
                          }
                          disabled={pagination.page <= 1}
                          className={`px-3 py-1 text-sm border rounded-sm transition-colors ${
                            pagination.page <= 1
                              ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                              : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                          {Array.from(
                            { length: Math.min(5, pagination.pages) },
                            (_, i) => {
                              let pageNum;
                              if (pagination.pages <= 5) {
                                pageNum = i + 1;
                              } else if (pagination.page <= 3) {
                                pageNum = i + 1;
                              } else if (
                                pagination.page >=
                                pagination.pages - 2
                              ) {
                                pageNum = pagination.pages - 4 + i;
                              } else {
                                pageNum = pagination.page - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() =>
                                    onPageChange(pageNum, pagination.limit)
                                  }
                                  className={`w-8 h-8 text-sm rounded-sm transition-colors ${
                                    pagination.page === pageNum
                                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                                      : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            },
                          )}
                        </div>

                        {/* Next Page Button */}
                        <button
                          onClick={() =>
                            onPageChange(pagination.page + 1, pagination.limit)
                          }
                          disabled={!pagination.hasNext}
                          className={`px-3 py-1 text-sm border rounded-sm transition-colors ${
                            !pagination.hasNext
                              ? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                              : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          Next
                        </button>
                      </div>

                      {/* Page Size Selector */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Show:
                        </span>
                        <select
                          value={pagination.limit}
                          onChange={(e) => {
                            const newLimit = parseInt(e.target.value);
                            onPageChange(1, newLimit); // Reset to page 1 when changing limit
                          }}
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded-sm px-2 py-1 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          per page
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Product Details Modal */}
      {showProductModal && selectedProductDetails && (
        <ProductDetailsModal
          showProductModal={showProductModal}
          selectedProductDetails={selectedProductDetails}
          handleCloseProductModal={handleCloseProductModal}
          categories={categories}
          getStatusColor={getStatusColor}
          handleEditClick={handleEditClick}
          handleStockUpdateClick={handleStockUpdateClick}
          setSelectedProduct={setSelectedProduct}
          setShowDeleteModal={setShowDeleteModal}
          userRole={userRole}
          // Pass permission checks to modal
          hasPermission={hasPermission}
          hasAnyPermission={hasAnyPermission}
        />
      )}

      {/* Image Preview Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            onClick={handleCloseImageModal}
          ></div>

          {/* Modal Content */}
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-sm shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {selectedImage.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Product Image Preview
                  </p>
                </div>
                <button
                  onClick={handleCloseImageModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                  aria-label="Close image preview"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Image Content */}
              <div className="p-6 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="relative max-h-[70vh] overflow-hidden rounded-sm">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="max-w-full max-h-[70vh] object-contain"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Click outside image or press{" "}
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 ml-1">
                    Esc
                  </kbd>{" "}
                  to close
                </div>
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open in new tab</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Protected by permission */}
      {hasAnyPermission(["products.update", "products.manage"]) &&
        showEditModal &&
        editingProduct && (
          <AdminEditProductModal
            product={editingProduct}
            categories={categories}
            onClose={handleCloseEditModal}
          />
        )}

      {/* Stock Update Modal - Protected by permission */}
      {hasAnyPermission(["products.update", "products.manage"]) &&
        showStockModal &&
        updatingProduct && (
          <AdminUpdateProductStockModal
            handleCloseStockModal={handleCloseStockModal}
            updatingProduct={updatingProduct}
            categories={categories}
            setOperation={setOperation}
            operation={operation}
            stockAmount={stockAmount}
            setStockAmount={setStockAmount}
            handleUpdateStock={handleUpdateStock}
            updateStockMutation={updateStockMutation}
            getStatusColor={getStatusColor}
          />
        )}
    </>
  );
};

export default AdminAllProducts;
