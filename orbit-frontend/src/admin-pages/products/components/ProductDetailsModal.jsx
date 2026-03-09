import {
  ExternalLink,
  X,
  Package,
  Edit,
  Trash2,
  DollarSign,
  BarChart3,
  Image as ImageIcon,
  AlertCircle,
  Info,
} from "lucide-react";
import { useState } from "react";

const ProductDetailsModal = ({
  showProductModal,
  selectedProductDetails,
  handleCloseProductModal,
  categories,
  getStatusColor,
  handleEditClick,
  handleStockUpdateClick,
  setSelectedProduct,
  setShowDeleteModal,
  userRole,
  hasPermission,
  hasAnyPermission,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Helper functions for consistent styling
  const getCardClass = () =>
    "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-lg";
  const getMutedTextClass = () => "text-gray-600 dark:text-gray-400";

  const getBorderClass = () => "border-gray-300 dark:border-gray-700";

  // Permission checks
  const canViewCost = hasPermission
    ? hasPermission("products.view_cost") ||
      hasAnyPermission(["products.manage"])
    : userRole === "superadmin";

  const canManageProducts = hasPermission
    ? hasAnyPermission([
        "products.update",
        "products.delete",
        "products.manage",
      ])
    : userRole === "superadmin";

  // Get all images from the product
  const productImages =
    selectedProductDetails?.images ||
    selectedProductDetails?.productImages ||
    (selectedProductDetails?.primaryImage
      ? [{ url: selectedProductDetails.primaryImage, isPrimary: true }]
      : []);

  // Calculate profit margins
  const profitPerUnit =
    selectedProductDetails?.sellingPrice -
    (selectedProductDetails?.buyingPrice ||
      selectedProductDetails?.costPrice ||
      0);
  const profitPercentage = selectedProductDetails?.buyingPrice
    ? ((profitPerUnit / selectedProductDetails.buyingPrice) * 100).toFixed(1)
    : "N/A";

  // Get category name
  const categoryName =
    categories?.find((c) => c.id === selectedProductDetails?.category)?.name ||
    selectedProductDetails?.category ||
    "Uncategorized";

  // Stock status
  const getStockStatus = () => {
    const quantity = selectedProductDetails?.quantity || 0;
    const minStock = selectedProductDetails?.minStock || 0;

    if (quantity === 0)
      return {
        text: "Out of Stock",
        class:
          "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
      };
    if (quantity <= minStock)
      return {
        text: "Low Stock",
        class:
          "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
      };
    return {
      text: "In Stock",
      class:
        "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
    };
  };

  const stockStatus = getStockStatus();

  if (!selectedProductDetails) return null;

  return (
    <>
      {showProductModal && selectedProductDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={handleCloseProductModal}
          />

          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-8xl transform transition-all">
              <div className={`${getCardClass()} overflow-hidden`}>
                {/* Modal Header */}
                <div className={`border-b ${getBorderClass()} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        {selectedProductDetails.name}
                      </h2>
                      <p
                        className={`text-sm ${getMutedTextClass()} mt-1 flex items-center gap-2`}
                      >
                        <span className="font-mono">
                          {selectedProductDetails.sku}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>
                          {selectedProductDetails.brand || "No Brand"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          window.open(
                            `/products/${selectedProductDetails._id || selectedProductDetails.id}`,
                            "_blank",
                          )
                        }
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={handleCloseProductModal}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                  {/* Left Column - Image Gallery */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-6">
                      <div className="bg-gray-50 dark:bg-gray-900/30 rounded-sm ">
                        {/* Main Image */}
                        <div className="relative aspect-square mb-4 bg-white dark:bg-gray-900 rounded-sm overflow-hidden border border-gray-300 dark:border-gray-700">
                          {productImages.length > 0 ? (
                            <img
                              src={
                                productImages[selectedImageIndex]?.url ||
                                productImages[selectedImageIndex]?.imageUrl
                              }
                              alt={selectedProductDetails.name}
                              className="w-full h-full object-contain p-4"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                            </div>
                          )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {productImages.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {productImages.map((image, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`flex-shrink-0 w-16 h-16 rounded border ${
                                  selectedImageIndex === index
                                    ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20"
                                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                                }`}
                              >
                                <img
                                  src={image.url || image.imageUrl}
                                  alt={`${selectedProductDetails.name} - ${index + 1}`}
                                  className="w-full h-full object-cover rounded"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Stock Status Card */}
                        <div
                          className={`mt-4 p-4 rounded-sm border ${stockStatus.class}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Stock Status</h4>
                              <p className="text-sm opacity-80 mt-1">
                                {selectedProductDetails.quantity || 0} units
                                available
                              </p>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProductDetails.status)}`}
                            >
                              {selectedProductDetails.status}
                            </div>
                          </div>
                          {selectedProductDetails.quantity <=
                            selectedProductDetails.minStock && (
                            <div className="flex items-center gap-2 mt-3 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span>
                                Minimum stock: {selectedProductDetails.minStock}{" "}
                                units
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Product Details */}
                  <div className="lg:col-span-2">
                    {/* Product Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Info Card */}
                      <div className="bg-gray-50 dark:bg-gray-900/30 rounded-sm border border-gray-300 dark:border-gray-700 p-4">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Basic Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">
                              Category
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full text-sm">
                                {categoryName}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">
                              Model
                            </label>
                            <p className="text-gray-900 dark:text-white">
                              {selectedProductDetails.model || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">
                              Warranty
                            </label>
                            <p className="text-gray-900 dark:text-white">
                              {selectedProductDetails.warranty || "No warranty"}
                            </p>
                          </div>
                          {selectedProductDetails.tags &&
                            selectedProductDetails.tags.length > 0 && (
                              <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">
                                  Tags
                                </label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {selectedProductDetails.tags.map(
                                    (tag, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Pricing Card */}
                      <div className="bg-gray-50 dark:bg-gray-900/30 rounded-sm border border-gray-300 dark:border-gray-700 p-4">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Pricing
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">
                              Selling Price
                            </span>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              KSh{" "}
                              {selectedProductDetails.sellingPrice?.toLocaleString()}
                            </span>
                          </div>

                          {canViewCost && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Cost Price
                                </span>
                                <span className="text-lg font-medium text-gray-900 dark:text-white">
                                  KSh{" "}
                                  {(
                                    selectedProductDetails.buyingPrice ||
                                    selectedProductDetails.costPrice
                                  )?.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-gray-300 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Profit per Unit
                                </span>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                  KSh {profitPerUnit.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Profit Margin
                                </span>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {profitPercentage}%
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Sales & Inventory Card */}
                      <div className="bg-gray-50 dark:bg-gray-900/30 rounded-sm border border-gray-300 dark:border-gray-700 p-4 md:col-span-2">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Sales & Inventory
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {selectedProductDetails.quantity || 0}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Current Stock
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {selectedProductDetails.minStock || 0}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Minimum Stock
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {selectedProductDetails.totalSold || 0}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Total Sold
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              KSh{" "}
                              {(
                                selectedProductDetails.inventoryValue || 0
                              )?.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Inventory Value
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Specifications Card */}
                      {(selectedProductDetails.description ||
                        selectedProductDetails.features) && (
                        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-sm border border-gray-300 dark:border-gray-700 p-4 md:col-span-2">
                          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Description & Features
                          </h3>
                          {selectedProductDetails.description && (
                            <div className="mb-4">
                              <h4 className=" font-medium text-gray-600 dark:text-gray-400 mb-2 text-lg">
                                Description
                              </h4>
                              <p className="text-gray-900 dark:text-white text-lg">
                                {selectedProductDetails.description}
                              </p>
                            </div>
                          )}
                          {selectedProductDetails.features &&
                            selectedProductDetails.features.length > 0 && (
                              <div>
                                <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                                  Features
                                </h4>
                                <ul className="space-y-2">
                                  {selectedProductDetails.features.map(
                                    (feature, index) => (
                                      <li
                                        key={index}
                                        className="flex items-start gap-2 text-gray-900 dark:text-white"
                                      >
                                        <span className="text-blue-500 mt-1">
                                          •
                                        </span>
                                        <span>{feature}</span>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className={`mt-6 pt-6 border-t ${getBorderClass()}`}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                      </h3>
                      <div className="flex flex-wrap gap-3">
                       
                        {canManageProducts && (
                          <>
                            <button
                              onClick={() =>
                                handleEditClick(selectedProductDetails)
                              }
                              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-sm transition-colors flex items-center space-x-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit Product</span>
                            </button>
                            <button
                              onClick={() =>
                                handleStockUpdateClick(selectedProductDetails)
                              }
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm transition-colors flex items-center space-x-2"
                            >
                              <Package className="h-4 w-4" />
                              <span>Update Stock</span>
                            </button>
                          </>
                        )}

                        {hasPermission && hasPermission("products.delete") && (
                          <button
                            onClick={() => {
                              setSelectedProduct(selectedProductDetails);
                              setShowDeleteModal(true);
                              handleCloseProductModal();
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm transition-colors flex items-center space-x-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Product</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className={`border-t ${getBorderClass()} px-6 py-4 bg-gray-50 dark:bg-gray-900/30`}
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Created:{" "}
                      {new Date(
                        selectedProductDetails.createdAt,
                      ).toLocaleDateString()}
                      {selectedProductDetails.updatedAt && (
                        <span className="ml-4">
                          Updated:{" "}
                          {new Date(
                            selectedProductDetails.updatedAt,
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      ID:{" "}
                      <span className="font-mono">
                        {selectedProductDetails._id ||
                          selectedProductDetails.id}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailsModal;
