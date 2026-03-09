// components/StockTransferModal.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ArrowRightLeft,
  Store,
  Package,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useTransferStock,
  useBulkTransfer,
} from "../../hooks/stockTransfer.mutations";

import { toast } from "react-hot-toast";
import SearchableSelect from "./SearchableSelect";
import { usePaginatedStores } from "../hooks/usePaginatedStores";

const StockTransferModal = ({
  isOpen,
  onClose,
  mode = "single",
  sourceStoreId: initialSourceStoreId = "",
  destinationStoreId: initialDestinationStoreId = "",
  productId: initialProductId = "",
  onSuccess,
  filteredItems = [], // inventory items from InventoryTable — used as product list
}) => {
  const transferMutation = useTransferStock();
  const bulkTransferMutation = useBulkTransfer();

  const [formData, setFormData] = useState({
    sourceStoreId: initialSourceStoreId,
    destinationStoreId: initialDestinationStoreId,
    productId: initialProductId,
    quantity: 1,
    reason: "store_transfer",
    notes: "",
  });

  const {
    stores,
    loading: storesLoading,
    hasMore: storesHasMore,
    loadMore: loadMoreStores,
  } = usePaginatedStores();

  // Derive product options directly from filteredItems — no API call needed
  const availableProducts = filteredItems
    .filter((item) => item.stock > 0) // only items with stock
    .map((item) => ({
      _id: item.product?._id,
      name: item.product?.name,
      sku: item.product?.sku,
      stock: item.stock,
    }))
    .filter((p) => p._id); // ensure valid products only

  const [bulkItems, setBulkItems] = useState([{ productId: "", quantity: 1 }]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [step, setStep] = useState(1);
  const [transferResult, setTransferResult] = useState(null);

  const currentStore = stores.find((s) => s._id === initialSourceStoreId);
  const isProductPreSelected = !!initialProductId;

  // Pre-selected product name for display
  const preSelectedProductName = availableProducts.find(
    (p) => String(p._id) === String(initialProductId),
  )?.name;

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      sourceStoreId: initialSourceStoreId,
      destinationStoreId: initialDestinationStoreId,
      productId: initialProductId,
      quantity: 1,
      reason: "store_transfer",
      notes: "",
    });
    setBulkItems([{ productId: "", quantity: 1 }]);
    setErrors({});
    setTouched({});
    setStep(1);
    setTransferResult(null);
  };

  const availableDestinationStores = stores.filter(
    (s) => s._id !== formData.sourceStoreId,
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sourceStoreId)
      newErrors.sourceStoreId = "Source store is required";

    if (!formData.destinationStoreId)
      newErrors.destinationStoreId = "Destination store is required";

    if (formData.sourceStoreId === formData.destinationStoreId)
      newErrors.destinationStoreId =
        "Source and destination stores cannot be the same";

    if (mode === "single") {
      if (!formData.productId) newErrors.productId = "Product is required";
      if (!formData.quantity || formData.quantity < 1)
        newErrors.quantity = "Quantity must be at least 1";
      if (formData.quantity > 1000)
        newErrors.quantity = "Maximum quantity is 1000";

      // Validate against available stock
      const selectedProduct = availableProducts.find(
        (p) => String(p._id) === String(formData.productId),
      );
      if (selectedProduct && formData.quantity > selectedProduct.stock) {
        newErrors.quantity = `Only ${selectedProduct.stock} units available`;
      }
    } else {
      const itemErrors = [];
      let hasEmptyItems = false;
      bulkItems.forEach((item, index) => {
        const itemError = {};
        if (!item.productId) {
          itemError.productId = "Product required";
          hasEmptyItems = true;
        }
        if (!item.quantity || item.quantity < 1) {
          itemError.quantity = "Valid quantity required";
          hasEmptyItems = true;
        }
        if (item.quantity > 1000) {
          itemError.quantity = "Max 1000";
          hasEmptyItems = true;
        }
        itemErrors[index] = itemError;
      });
      if (hasEmptyItems) newErrors.items = itemErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "quantity") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseInt(value) || 1,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBulkItemChange = (index, field, value) => {
    const newItems = [...bulkItems];
    newItems[index][field] =
      field === "quantity" ? parseInt(value) || 0 : value;
    setBulkItems(newItems);
  };

  const addBulkItem = () =>
    setBulkItems([...bulkItems, { productId: "", quantity: 1 }]);

  const removeBulkItem = (index) => {
    if (bulkItems.length > 1)
      setBulkItems(bulkItems.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (validateForm()) setStep(2);
  };

  const handleSubmit = async () => {
    try {
      setStep(3);
      let result;
      if (mode === "single") {
        result = await transferMutation.mutateAsync(formData);
      } else {
        result = await bulkTransferMutation.mutateAsync({
          sourceStoreId: formData.sourceStoreId,
          destinationStoreId: formData.destinationStoreId,
          items: bulkItems,
          reason: formData.reason,
          notes: formData.notes,
        });
      }
      setTransferResult(result);
      if (onSuccess) {
        toast.success("Stock transferred successfully");
        onSuccess(result);
      }
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      toast.error(error.response?.data?.error || "Transfer failed");
      setStep(2);
    }
  };

  const getProductName = (productId) =>
    availableProducts.find((p) => String(p._id) === String(productId))?.name ||
    "Unknown Product";

  const getStoreName = (storeId) =>
    stores.find((s) => s._id === storeId)?.name || "Unknown Store";

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-40 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-sm shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="sticky top-0 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ArrowRightLeft className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-bold">
                    {mode === "single" ? "Transfer Stock" : "Bulk Transfer"}
                  </h2>
                  <p className="text-sm text-blue-100">
                    Step {step} of 3:{" "}
                    {step === 1
                      ? "Enter Details"
                      : step === 2
                        ? "Review & Confirm"
                        : "Processing"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-sm transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Step 1: Form */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source Store - read only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Source Store *
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <div className="w-full pl-10 pr-4 py-3 border rounded-sm bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white cursor-not-allowed opacity-75">
                        {currentStore ? (
                          <div className="flex items-center justify-between">
                            <span>{currentStore.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {currentStore.code}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            Loading store...
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Transferring from current store
                    </p>
                  </div>

                  {/* Destination Store */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Destination Store *
                    </label>
                    <SearchableSelect
                      options={availableDestinationStores}
                      value={formData.destinationStoreId}
                      onChange={(value) => {
                        const storeId =
                          typeof value === "object" ? value?._id : value;
                        handleChange({
                          target: {
                            name: "destinationStoreId",
                            value: storeId,
                          },
                        });
                      }}
                      placeholder="Select destination store"
                      labelKey="name"
                      valueKey="_id"
                      searchPlaceholder="Search stores..."
                      loading={storesLoading}
                      hasMore={storesHasMore}
                      onLoadMore={loadMoreStores}
                      icon={Store}
                      error={
                        touched.destinationStoreId && errors.destinationStoreId
                      }
                      helperText={
                        touched.destinationStoreId && errors.destinationStoreId
                      }
                    />
                  </div>
                </div>

                {mode === "single" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product - disabled if pre-selected */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product *
                      </label>
                      <SearchableSelect
                        options={availableProducts}
                        value={formData.productId}
                        onChange={(value) =>
                          handleChange({ target: { name: "productId", value } })
                        }
                        placeholder="Select product"
                        labelKey="name"
                        valueKey="_id"
                        searchPlaceholder="Search products..."
                        icon={Package}
                        error={touched.productId && errors.productId}
                        helperText={touched.productId && errors.productId}
                        disabled={isProductPreSelected}
                        selectedLabel={preSelectedProductName}
                        renderOption={(product) => (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-gray-500">
                                SKU: {product.sku} • Stock: {product.stock}
                              </p>
                            </div>
                          </div>
                        )}
                      />
                      {isProductPreSelected && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Product pre-selected from inventory
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        onBlur={() =>
                          setTouched({ ...touched, quantity: true })
                        }
                        min="1"
                        max="1000"
                        className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          touched.quantity && errors.quantity
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                      />
                      {touched.quantity && errors.quantity && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Bulk transfer items
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Products to Transfer *
                      </label>
                      <button
                        type="button"
                        onClick={addBulkItem}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-sm transition-colors"
                      >
                        <Plus size={16} />
                        <span>Add Item</span>
                      </button>
                    </div>
                    {bulkItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-sm"
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <SearchableSelect
                            options={availableProducts}
                            value={item.productId}
                            onChange={(value) =>
                              handleBulkItemChange(index, "productId", value)
                            }
                            placeholder="Select product"
                            labelKey="name"
                            valueKey="_id"
                            searchPlaceholder="Search products..."
                            error={errors.items?.[index]?.productId}
                            helperText={errors.items?.[index]?.productId}
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleBulkItemChange(
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                              min="1"
                              max="1000"
                              placeholder="Qty"
                              className="w-24 px-3 py-2 border rounded-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            {bulkItems.length > 1 && (
                              <button
                                onClick={() => removeBulkItem(index)}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-sm transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {errors.items && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Please fill in all items
                      </p>
                    )}
                  </div>
                )}

                {/* Reason and Notes */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason
                    </label>
                    <select
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="store_transfer">Store Transfer</option>
                      <option value="restock">Restock</option>
                      <option value="inventory_balancing">
                        Inventory Balancing
                      </option>
                      <option value="customer_order">Customer Order</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Add any additional notes about this transfer..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">
                        Review Transfer Details
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Please verify all information before proceeding
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-sm">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        From
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getStoreName(formData.sourceStoreId)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        To
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {getStoreName(formData.destinationStoreId)}
                      </p>
                    </div>
                  </div>

                  {mode === "single" ? (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-sm">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Product
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getProductName(formData.productId)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Quantity
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formData.quantity} units
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Items ({bulkItems.length})
                      </p>
                      {bulkItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-sm"
                        >
                          <span className="text-sm text-gray-900 dark:text-white">
                            {getProductName(item.productId)}
                          </span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {item.quantity} units
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.notes && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-sm">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Notes
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">
                        {formData.notes}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-sm">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      ⚠️ This action will transfer stock and cannot be undone.
                      Please confirm.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Processing/Complete */}
            {step === 3 && (
              <div className="py-12 text-center">
                {!transferResult ? (
                  <div className="space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Processing Transfer
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Please wait while we complete your transfer...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Transfer Complete!
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {transferResult.message ||
                          "Stock transferred successfully"}
                      </p>
                      {transferResult.transfer && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Transfer #{transferResult.transfer.transferNumber}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-sm text-left">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Source Store: {getStoreName(formData.sourceStoreId)} →{" "}
                        {transferResult.sourceInventory?.newStock ||
                          formData.quantity}{" "}
                        units remaining
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Destination Store:{" "}
                        {getStoreName(formData.destinationStoreId)} →{" "}
                        {transferResult.destinationInventory?.newStock ||
                          formData.quantity}{" "}
                        units now
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              {step === 1 && (
                <>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-sm transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      transferMutation.isPending ||
                      bulkTransferMutation.isPending
                    }
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {transferMutation.isPending ||
                    bulkTransferMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Confirm Transfer</span>
                      </>
                    )}
                  </button>
                </>
              )}
              {step === 3 && transferResult && (
                <button
                  onClick={onClose}
                  className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default StockTransferModal;
