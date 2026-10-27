import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Package, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

import {
  openCreateModal,
  openUpdateModal,
  openDeleteModal,
  openViewModal,
  closeCreateModal,
  closeUpdateModal,
  closeDeleteModal,
  closeViewModal,
  closeCategoriesModal,
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

import CategoryDialog from "./category/CategoryDialog";
import { dialogButton } from "./category/dialogStyles";
import CategoryCard from "./category/CategoryCard";
import CategoryFormDialog from "./category/CategoryFormDialog";
import DeleteCategoryDialog from "./category/DeleteCategoryDialog";
import CategoryDetailsDialog from "./category/CategoryDetailsDialog";

// The manager is only mounted while open, so its hooks always run in the
// same order (they used to sit after an early return).
const CategoryModal = () => {
  const isOpen = useSelector((state) => state.categoryModal.categoriesModal);
  return isOpen ? <CategoryManager /> : null;
};

const CategoryManager = () => {
  const dispatch = useDispatch();

  const isCreateOpen = useSelector(selectIsCreateModalOpen);
  const isUpdateOpen = useSelector(selectIsUpdateModalOpen);
  const isDeleteOpen = useSelector(selectIsDeleteModalOpen);
  const isViewOpen = useSelector(selectIsViewModalOpen);
  const selectedCategory = useSelector(selectSelectedCategory);

  const { data: categoriesData, isLoading } = useCategories();
  const categories = categoriesData?.data || [];

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const isDialogOpen = isCreateOpen || isUpdateOpen || isDeleteOpen || isViewOpen;

  const closeManager = useCallback(
    () => dispatch(closeCategoriesModal()),
    [dispatch],
  );

  // Closing a dialog also clears any error left by its last attempt
  const closeCreate = () => {
    createCategory.reset();
    dispatch(closeCreateModal());
  };
  const closeUpdate = () => {
    updateCategory.reset();
    dispatch(closeUpdateModal());
  };
  const closeDelete = () => {
    deleteCategory.reset();
    dispatch(closeDeleteModal());
  };

  const handleCreate = (form) =>
    createCategory.mutate(form, {
      onSuccess: () => {
        toast.success("Category created");
        closeCreate();
      },
    });

  const handleUpdate = (form) =>
    updateCategory.mutate(
      { id: selectedCategory._id, ...form },
      {
        onSuccess: () => {
          toast.success("Category updated");
          closeUpdate();
        },
      },
    );

  const handleDelete = () =>
    deleteCategory.mutate(selectedCategory._id, {
      onSuccess: () => {
        toast.success("Category deleted");
        closeDelete();
      },
    });

  return (
    <>
      <CategoryDialog
        title="Manage categories"
        size="xl"
        onClose={closeManager}
        closeOnEscape={!isDialogOpen}
      >
        <div className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="mb-0 text-sm text-gray-500 dark:text-gray-400">
              {isLoading
                ? "Loading categories…"
                : `${categories.length} ${categories.length === 1 ? "category" : "categories"}`}
            </p>
            <button
              type="button"
              onClick={() => dispatch(openCreateModal())}
              className={dialogButton.primary}
            >
              <Plus size={16} />
              Add category
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
              <Package className="mx-auto mb-3 h-10 w-10 text-gray-400 dark:text-gray-500" />
              <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
                No categories yet
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Create a category to start grouping your products.
              </p>
              <button
                type="button"
                onClick={() => dispatch(openCreateModal())}
                className={dialogButton.primary}
              >
                <Plus size={16} />
                Add category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onView={(c) => dispatch(openViewModal(c))}
                  onEdit={(c) => dispatch(openUpdateModal(c))}
                  onDelete={(c) => dispatch(openDeleteModal(c))}
                />
              ))}
            </div>
          )}
        </div>
      </CategoryDialog>

      {isCreateOpen && (
        <CategoryFormDialog
          onClose={closeCreate}
          onSubmit={handleCreate}
          isSaving={createCategory.isPending}
          error={createCategory.error?.message}
        />
      )}

      {isUpdateOpen && selectedCategory && (
        <CategoryFormDialog
          key={selectedCategory._id}
          category={selectedCategory}
          onClose={closeUpdate}
          onSubmit={handleUpdate}
          isSaving={updateCategory.isPending}
          error={updateCategory.error?.message}
        />
      )}

      {isDeleteOpen && selectedCategory && (
        <DeleteCategoryDialog
          category={selectedCategory}
          onClose={closeDelete}
          onConfirm={handleDelete}
          isDeleting={deleteCategory.isPending}
          error={deleteCategory.error?.message}
        />
      )}

      {isViewOpen && selectedCategory && (
        <CategoryDetailsDialog
          category={selectedCategory}
          onClose={() => dispatch(closeViewModal())}
        />
      )}
    </>
  );
};

export default CategoryModal;
