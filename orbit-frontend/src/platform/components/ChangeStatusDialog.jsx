import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useChangeBusinessStatus } from "../hooks/use-platform-data";
import { actionLabel } from "../utils/business-status";
import Button from "./ui/Button";
import { inputClass, labelClass } from "./ui/styles";

const DESCRIPTIONS = {
  active: "The business will be marked active and verified, and its users can sign in and work as normal.",
  suspended:
    "Its users will be signed out and blocked from signing in, and its online store taken offline, until you reactivate it. The reason is saved on its record.",
  cancelled:
    "Its users will be permanently blocked and its online store taken offline. This can't be reversed from the console.",
};

const ChangeStatusDialog = ({ business, targetStatus, onClose }) => {
  const [reason, setReason] = useState("");
  const { mutate, isPending } = useChangeBusinessStatus(business._id);
  const reasonRequired = targetStatus === "suspended";
  const destructive = targetStatus !== "active";
  const label = actionLabel(business.status, targetStatus);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !isPending && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPending, onClose]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={() => !isPending && onClose()}
      />
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-status-title"
        className="relative w-full max-w-md rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="p-6">
          <h2 id="change-status-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {label}?
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{business.businessName}</span>:{" "}
            {DESCRIPTIONS[targetStatus]}
          </p>

          <div className="mt-5 space-y-1.5">
            <label htmlFor="status-reason" className={labelClass}>
              Reason{" "}
              {!reasonRequired && <span className="font-normal text-zinc-400">(optional)</span>}
            </label>
            <textarea
              id="status-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              autoFocus
              required={reasonRequired}
              placeholder={reasonRequired ? "Why is this business being suspended?" : ""}
              className={`${inputClass} h-auto py-2`}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 rounded-b-lg border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
          <Button onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={destructive ? "destructive" : "primary"}
            disabled={isPending || (reasonRequired && !reason.trim())}
          >
            {isPending ? "Saving…" : label}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangeStatusDialog;
