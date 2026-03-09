// pages/AdminCategoriesPage.jsx
import { useDispatch } from "react-redux";
import { Edit2, Trash2, Eye, Plus } from "lucide-react";

import {
  openCreateModal,
  openUpdateModal,
  openDeleteModal,
  openViewModal,
} from "../../../store/features/categoryModalSlice";

import { useCategories } from "../../hooks/category.mutations";

import {
  CreateCategoryModal,
  UpdateCategoryModal,
  DeleteCategoryModal,
  ViewCategoryModal,
} from "../../modals/CategoryModal";

const AdminCategoriesPage = () => {
  const dispatch = useDispatch();
  const { data, isLoading } = useCategories();
  const categories = data?.data || [];

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => dispatch(openCreateModal())}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <div
            key={category._id}
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.slug}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch(openViewModal(category))}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => dispatch(openUpdateModal(category))}
                className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => dispatch(openDeleteModal(category))}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <CreateCategoryModal />
      <UpdateCategoryModal />
      <DeleteCategoryModal />
      <ViewCategoryModal />
    </div>
  );
};


export default AdminCategoriesPage