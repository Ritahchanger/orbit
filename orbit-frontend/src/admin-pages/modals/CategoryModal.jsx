import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import {
  openCreateModal,
  openUpdateModal,
  openDeleteModal,
  openViewModal,
  closeCreateModal,
  closeUpdateModal,
  closeDeleteModal,
  closeViewModal,
  closeCategoriesModal, // Add this to your slice
  selectIsCreateModalOpen,
  selectIsUpdateModalOpen,
  selectIsDeleteModalOpen,
  selectIsViewModalOpen,
  selectSelectedCategory,
} from "../../store/features/categoryModalSlice";

import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks/category.mutations";

import {
  X,
  Save,
  Trash2,
  Eye,
  Edit2,
  Plus,
  AlertCircle,
  Package,
} from "lucide-react";
import { toast } from "react-hot-toast";

const CategoryModal = () => {
  const dispatch = useDispatch();

  // Get main modal state
  const categoriesModal = useSelector(
    (state) => state.categoryModal.categoriesModal,
  );

  // Don't render if main modal is not open
  if (!categoriesModal) return null;

  // Redux state
  const isCreateModalOpen = useSelector(selectIsCreateModalOpen);
  const isUpdateModalOpen = useSelector(selectIsUpdateModalOpen);
  const isDeleteModalOpen = useSelector(selectIsDeleteModalOpen);
  const isViewModalOpen = useSelector(selectIsViewModalOpen);
  const selectedCategory = useSelector(selectSelectedCategory);

  // Local state for forms
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch,
  } = useCategories();
  const categories = categoriesData?.data || [];

  // Mutations
  const createCategory = useCreateCategory({
    onSuccess: () => {
      setIsLoading(false);
      setFormData({ name: "", description: "", status: "active" });
      dispatch(closeCreateModal());
      toast.success("Category created successfully!");
      refetch();
    },
    onError: (error) => {
      setIsLoading(false);
      setError(error.message);
      toast.error(error.message || "Failed to create category");
    },
  });

  const updateCategory = useUpdateCategory({
    onSuccess: () => {
      setIsLoading(false);
      setFormData({ name: "", description: "", status: "active" });
      dispatch(closeUpdateModal());
      toast.success("Category updated successfully!");
      refetch();
    },
    onError: (error) => {
      setIsLoading(false);
      setError(error.message);
      toast.error(error.message || "Failed to update category");
    },
  });

  const deleteCategory = useDeleteCategory({
    onSuccess: () => {
      setIsLoading(false);
      dispatch(closeDeleteModal());
      toast.success("Category deleted successfully!");
      refetch();
    },
    onError: (error) => {
      setIsLoading(false);
      setError(error.message);
      toast.error(error.message || "Failed to delete category");
    },
  });

  // Set form data when updating
  useEffect(() => {
    if (selectedCategory && isUpdateModalOpen) {
      setFormData({
        name: selectedCategory.name || "",
        description: selectedCategory.description || "",
        status: selectedCategory.status || "active",
      });
    }
  }, [selectedCategory, isUpdateModalOpen]);

  // Reset form when modals close
  useEffect(() => {
    if (!isCreateModalOpen && !isUpdateModalOpen) {
      setFormData({ name: "", description: "", status: "active" });
      setError("");
    }
  }, [isCreateModalOpen, isUpdateModalOpen]);

  // Handle create submit
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError("Category name is required");
      return;
    }
    setIsLoading(true);
    setError("");
    createCategory.mutate(formData);
  };

  // Handle update submit
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError("Category name is required");
      return;
    }
    setIsLoading(true);
    setError("");
    updateCategory.mutate({
      id: selectedCategory._id,
      ...formData,
    });
  };

  // Handle delete
  const handleDelete = () => {
    setIsLoading(true);
    setError("");
    deleteCategory.mutate(selectedCategory._id);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-75 transition-opacity"
          onClick={() => dispatch(closeCategoriesModal())}
        />

        {/* Modal Content */}
        <div className="relative bg-white dark:bg-gray-800 rounded-sm w-full max-w-7xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl uppercase font-bold text-gray-900 dark:text-white">
              Manage Categories
            </h2>
            <button
              onClick={() => dispatch(closeCategoriesModal())}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Categories
              </h1>
              <button
                onClick={() => dispatch(openCreateModal())}
                className="px-4 py-2 bg-blue-600 text-white rounded-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add Category
              </button>
            </div>

            {/* Categories List */}
            {categoriesLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-sm"
                  ></div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Categories Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by creating your first category
                </p>
                <button
                  onClick={() => dispatch(openCreateModal())}
                  className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors"
                >
                  Add Category
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            category.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {category.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {category.slug}
                      </p>
                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => dispatch(openViewModal(category))}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-sm transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => dispatch(openUpdateModal(category))}
                        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 dark:text-gray-400 dark:hover:text-yellow-400 dark:hover:bg-yellow-900/20 rounded-sm transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => dispatch(openDeleteModal(category))}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-sm transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ CREATE MODAL ============ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black/50 bg-opacity-75"
              onClick={() => dispatch(closeCreateModal())}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-sm w-full max-w-md">
              <form onSubmit={handleCreateSubmit}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Create Category
                  </h3>
                  <button
                    type="button"
                    onClick={() => dispatch(closeCreateModal())}
                  >
                    <X
                      size={20}
                      className="text-gray-500 hover:text-gray-700"
                    />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm"
                      placeholder="Enter category name"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm"
                      placeholder="Enter description (optional)"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm"
                      disabled={isLoading}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm">
                      <AlertCircle size={16} className="text-red-500" />
                      <span className="text-sm text-red-600">{error}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => dispatch(closeCreateModal())}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-sm"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Create
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* ============ UPDATE MODAL ============ */}
      {isUpdateModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black/50 bg-opacity-75"
              onClick={() => dispatch(closeUpdateModal())}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-sm w-full max-w-md">
              <form onSubmit={handleUpdateSubmit}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Update Category
                  </h3>
                  <button
                    type="button"
                    onClick={() => dispatch(closeUpdateModal())}
                  >
                    <X
                      size={20}
                      className="text-gray-500 hover:text-gray-700"
                    />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter category name"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter category description"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Status Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Current Slug Info */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded-sm">
                    <span className="font-medium">Current Slug:</span>{" "}
                    {selectedCategory.slug}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm">
                      <AlertCircle
                        size={16}
                        className="text-red-500 flex-shrink-0"
                      />
                      <span className="text-sm text-red-600">{error}</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => dispatch(closeUpdateModal())}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Update Category
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE MODAL ============ */}
      {isDeleteModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black/50 bg-opacity-75"
              onClick={() => dispatch(closeDeleteModal())}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-sm w-full max-w-md">
              <div className="p-6">
                {/* Warning Icon */}
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                  <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
                  Delete Category
                </h3>

                {/* Warning Message */}
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-2">
                  Are you sure you want to delete this category?
                </p>

                {/* Category Name */}
                <p className="text-lg font-medium text-center text-gray-900 dark:text-white mb-4">
                  "{selectedCategory.name}"
                </p>

                {/* Warning Description */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-sm p-3 mb-4">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>
                      This action cannot be undone. All data associated with
                      this category will be permanently removed.
                    </span>
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm mb-4">
                    <AlertCircle
                      size={16}
                      className="text-red-500 flex-shrink-0"
                    />
                    <span className="text-sm text-red-600">{error}</span>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => dispatch(closeDeleteModal())}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Category
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ VIEW MODAL ============ */}
      {isViewModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black/50 bg-opacity-75"
              onClick={() => dispatch(closeViewModal())}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-sm w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye size={20} className="text-blue-500" />
                  Category Details
                </h3>
                <button onClick={() => dispatch(closeViewModal())}>
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white font-medium">
                    {selectedCategory.name}
                  </p>
                </div>

                {/* Slug */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Slug
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {selectedCategory.slug}
                  </p>
                </div>

                {/* Description */}
                {selectedCategory.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {selectedCategory.description}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        selectedCategory.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {selectedCategory.status}
                    </span>
                  </div>
                </div>

                {/* Created & Updated Dates */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedCategory.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Updated
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedCategory.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => dispatch(closeViewModal())}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryModal;
