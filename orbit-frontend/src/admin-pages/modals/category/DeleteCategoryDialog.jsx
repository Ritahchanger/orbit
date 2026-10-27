import { AlertCircle, Trash2 } from "lucide-react";
import CategoryDialog, { Spinner } from "./CategoryDialog";
import { dialogButton } from "./dialogStyles";
import { CategoryError } from "./CategoryFormDialog";

const DeleteCategoryDialog = ({ category, onClose, onConfirm, isDeleting, error }) => (
  <CategoryDialog
    layer="top"
    title="Delete category"
    onClose={onClose}
    footer={
      <>
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className={dialogButton.secondary}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className={dialogButton.danger}
        >
          {isDeleting ? <Spinner /> : <Trash2 size={16} />}
          {isDeleting ? "Deleting…" : "Delete category"}
        </button>
      </>
    }
  >
    <div className="space-y-4 p-5">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Delete{" "}
        <span className="font-semibold text-gray-900 capitalize dark:text-white">
          {category.name}
        </span>
        ? This can't be undone.
      </p>
      <p className="flex items-start gap-2 rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        A category that still has products can't be deleted. Move its products
        to another category first.
      </p>
      {error && <CategoryError message={error} />}
    </div>
  </CategoryDialog>
);

export default DeleteCategoryDialog;
