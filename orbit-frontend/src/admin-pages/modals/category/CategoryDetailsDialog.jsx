import { Eye } from "lucide-react";
import CategoryDialog from "./CategoryDialog";
import { dialogButton } from "./dialogStyles";
import CategoryStatusBadge from "./CategoryStatusBadge";

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "—");

const Detail = ({ label, children }) => (
  <div>
    <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
      {label}
    </dt>
    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{children}</dd>
  </div>
);

const CategoryDetailsDialog = ({ category, onClose }) => (
  <CategoryDialog
    layer="top"
    title="Category details"
    icon={<Eye size={18} className="text-blue-500" />}
    onClose={onClose}
    footer={
      <button type="button" onClick={onClose} className={dialogButton.secondary}>
        Close
      </button>
    }
  >
    <dl className="space-y-4 p-5">
      <Detail label="Name">
        <span className="font-medium capitalize">{category.name}</span>
      </Detail>
      <Detail label="Slug">
        <span className="font-mono">{category.slug || "—"}</span>
      </Detail>
      {category.description && (
        <Detail label="Description">{category.description}</Detail>
      )}
      <Detail label="Status">
        <CategoryStatusBadge status={category.status} />
      </Detail>
      <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-2 dark:border-gray-700">
        <Detail label="Created">{formatDate(category.createdAt)}</Detail>
        <Detail label="Updated">{formatDate(category.updatedAt)}</Detail>
      </div>
    </dl>
  </CategoryDialog>
);

export default CategoryDetailsDialog;
