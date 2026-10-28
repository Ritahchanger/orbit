import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useChangeBusinessStatus } from "../hooks/use-platform-data";
import { actionLabel } from "../utils/business-status";

const DESCRIPTIONS = {
  active: "The business is marked active and verified.",
  suspended: "The business is marked suspended. The reason is saved on the business.",
  cancelled: "The business is marked cancelled. This can't be undone from the dashboard.",
};

const ChangeStatusDialog = ({ business, targetStatus, onClose }) => {
  const [reason, setReason] = useState("");
  const { mutate, isPending } = useChangeBusinessStatus(business._id);
  const reasonRequired = targetStatus === "suspended";
  const destructive = targetStatus !== "active";

  const submit = (event) => {
    event.preventDefault();
    mutate(
      { status: targetStatus, reason: reason.trim() },
      {
        onSuccess: (response) => {
          toast.success(response.message);
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-status-title"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm"
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 id="change-status-title" className="text-sm font-semibold text-gray-900 dark:text-white">
            {actionLabel(business.status, targetStatus)}: {business.businessName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">{DESCRIPTIONS[targetStatus]}</p>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason {reasonRequired ? "" : "(optional)"}
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required={reasonRequired}
              className="mt-1 w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        <footer className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Keep as is
          </button>
          <button
            type="submit"
            disabled={isPending || (reasonRequired && !reason.trim())}
            className={`px-3 py-1.5 text-sm font-medium rounded-sm text-white disabled:opacity-50 ${
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPending ? "Saving…" : actionLabel(business.status, targetStatus)}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default ChangeStatusDialog;
