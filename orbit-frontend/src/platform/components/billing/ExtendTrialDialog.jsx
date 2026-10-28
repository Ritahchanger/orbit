import { useState } from "react";
import toast from "react-hot-toast";
import { useExtendTrial } from "../../hooks/use-platform-billing";
import Dialog from "../ui/Dialog";
import { inputClass, labelClass } from "../ui/styles";
import { formatDate } from "../../utils/format";

const PRESETS = [7, 14, 30];
const DAY_MS = 24 * 60 * 60 * 1000;

const ExtendTrialDialog = ({ subscription, onClose }) => {
  const [days, setDays] = useState(14);
  const [reason, setReason] = useState("");
  // "Today" for the preview, fixed when the dialog opens
  const [openedAt] = useState(() => Date.now());
  const { mutate, isPending } = useExtendTrial(subscription.businessId);

  const validDays = Number.isInteger(days) && days >= 1 && days <= 90;
  // Mirrors the server: an ended trial is extended from today
  const base = Math.max(new Date(subscription.trialEndDate).getTime() || 0, openedAt);
  const newEnd = validDays ? new Date(base + days * DAY_MS) : null;

  const submit = () =>
    mutate(
      { days, reason: reason.trim() },
      {
        onSuccess: (response) => {
          toast.success(response.message);
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );

  return (
    <Dialog
      title="Extend trial"
      description={
        <>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{subscription.businessName}</span>'s trial
          currently ends {formatDate(subscription.trialEndDate)}.
        </>
      }
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Extend trial"
      isPending={isPending}
      submitDisabled={!validDays}
    >
      <div className="space-y-1.5">
        <span className={labelClass}>Extend by</span>
        <div className="flex gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setDays(preset)}
              className={`h-9 flex-1 rounded-md border text-sm transition-colors ${
                days === preset
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {preset} days
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={90}
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
            aria-label="Custom number of days"
            className={`${inputClass} w-20`}
          />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {newEnd ? `New end date: ${formatDate(newEnd)}` : "Choose between 1 and 90 days."}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="trial-reason" className={labelClass}>
          Reason <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          id="trial-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Waiting on onboarding call"
          className={inputClass}
        />
      </div>
    </Dialog>
  );
};

export default ExtendTrialDialog;
