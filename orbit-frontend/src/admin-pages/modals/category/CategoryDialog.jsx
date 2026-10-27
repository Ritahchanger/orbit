import { useEffect } from "react";
import { X } from "lucide-react";

const SIZES = {
  md: "max-w-md",
  xl: "max-w-5xl",
};

// Frame shared by every dialog in the category manager: backdrop, panel,
// header with a close button, optional footer, and Escape to close.
// `closeOnEscape` lets the manager ignore Escape while a dialog sits on top.
const CategoryDialog = ({
  title,
  icon,
  onClose,
  children,
  footer,
  size = "md",
  layer = "base",
  closeOnEscape = true,
}) => {
  useEffect(() => {
    if (!closeOnEscape) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeOnEscape, onClose]);

  return (
    <div
      className={`fixed inset-0 overflow-y-auto ${layer === "top" ? "z-[60]" : "z-50"}`}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 ${SIZES[size]}`}
        >
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              {icon}
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-sm p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">{children}</div>

          {footer && (
            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-700 dark:bg-gray-900">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Spinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
);

export default CategoryDialog;
