import { Edit2, Eye, Trash2 } from "lucide-react";
import CategoryStatusBadge from "./CategoryStatusBadge";

const actionClass =
  "rounded-sm p-2 text-gray-500 transition-colors dark:text-gray-400";

const CategoryCard = ({ category, onView, onEdit, onDelete }) => (
  <div className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="truncate font-medium text-gray-900 capitalize dark:text-white">
          {category.name}
        </h3>
        <CategoryStatusBadge status={category.status} />
      </div>
      {category.description && (
        <p className="mt-1 mb-0 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
          {category.description}
        </p>
      )}
    </div>
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        onClick={() => onView(category)}
        className={`${actionClass} hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400`}
        title="View"
        aria-label={`View ${category.name}`}
      >
        <Eye size={16} />
      </button>
      <button
        type="button"
        onClick={() => onEdit(category)}
        className={`${actionClass} hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400`}
        title="Edit"
        aria-label={`Edit ${category.name}`}
      >
        <Edit2 size={16} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(category)}
        className={`${actionClass} hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400`}
        title="Delete"
        aria-label={`Delete ${category.name}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

export default CategoryCard;
