import { useState } from "react";
import { AlertCircle, Save } from "lucide-react";
import CategoryDialog, { Spinner } from "./CategoryDialog";
import { dialogButton } from "./dialogStyles";

const fieldClass =
  "w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500";

const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

const emptyForm = { name: "", description: "", status: "active" };

// Create and edit use the same form. Pass `category` to edit it.
const CategoryFormDialog = ({ category, onClose, onSubmit, isSaving, error }) => {
  const isEdit = Boolean(category);
  const [form, setForm] = useState(() =>
    category
      ? {
          name: category.name || "",
          description: category.description || "",
          status: category.status || "active",
        }
      : emptyForm,
  );
  const [validationError, setValidationError] = useState("");

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (validationError) setValidationError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setValidationError("Category name is required");
      return;
    }
    onSubmit({ ...form, name: form.name.trim() });
  };

  const shownError = validationError || error;
  const formId = isEdit ? "edit-category-form" : "create-category-form";

  return (
    <CategoryDialog
      layer="top"
      title={isEdit ? "Edit category" : "New category"}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={dialogButton.secondary}
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isSaving}
            className={dialogButton.primary}
          >
            {isSaving ? <Spinner /> : <Save size={16} />}
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create category"}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-4 p-5">
        <div>
          <label htmlFor={`${formId}-name`} className={labelClass}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            value={form.name}
            onChange={update("name")}
            className={fieldClass}
            placeholder="e.g. Gaming laptops"
            disabled={isSaving}
            autoFocus
          />
          {isEdit && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Renaming also updates the products in this category.
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-description`} className={labelClass}>
            Description
          </label>
          <textarea
            id={`${formId}-description`}
            value={form.description}
            onChange={update("description")}
            rows={3}
            className={fieldClass}
            placeholder="Optional"
            disabled={isSaving}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-status`} className={labelClass}>
            Status
          </label>
          <select
            id={`${formId}-status`}
            value={form.status}
            onChange={update("status")}
            className={fieldClass}
            disabled={isSaving}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {isEdit && category.slug && (
          <p className="rounded-sm bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            Current slug: <span className="font-mono">{category.slug}</span>
          </p>
        )}

        {shownError && <CategoryError message={shownError} />}
      </form>
    </CategoryDialog>
  );
};

export const CategoryError = ({ message }) => (
  <div className="flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
    <AlertCircle size={16} className="mt-0.5 shrink-0" />
    <span>{message}</span>
  </div>
);

export default CategoryFormDialog;
