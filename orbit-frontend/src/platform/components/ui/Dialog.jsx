import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

/**
 * Confirmation-style dialog with a form body. Rendered into <body> so no
 * ancestor can clip its overlay; Escape and the backdrop close it unless a
 * save is in progress.
 */
const Dialog = ({
  title,
  description,
  children,
  onClose,
  onSubmit,
  submitLabel,
  submitVariant = "primary",
  isPending = false,
  submitDisabled = false,
  size = "max-w-md",
}) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !isPending && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPending, onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={() => !isPending && onClose()}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="platform-dialog-title"
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 ${size}`}
      >
        <div className="p-6">
          <h2 id="platform-dialog-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          {description && <div className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</div>}
          <div className="mt-5 space-y-4">{children}</div>
        </div>
        <div className="flex justify-end gap-2 rounded-b-lg border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant={submitVariant} disabled={isPending || submitDisabled}>
            {isPending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </div>,
    document.body,
  );
};

export default Dialog;
