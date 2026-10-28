import { useState } from "react";
import toast from "react-hot-toast";
import { useRecordPayment } from "../../hooks/use-platform-billing";
import Dialog from "../ui/Dialog";
import { inputClass, labelClass, selectClass } from "../ui/styles";
import { capitalise, formatDate, formatMoney } from "../../utils/format";

const METHODS = [
  ["mpesa", "M-Pesa", "M-Pesa receipt number"],
  ["bank_transfer", "Bank transfer", "Bank reference"],
  ["manual", "Cash / other", "Receipt or reference (optional)"],
];
const CYCLE_DAYS = { monthly: 30, annual: 365 };
const DAY_MS = 24 * 60 * 60 * 1000;

const RecordPaymentDialog = ({ subscription, onClose }) => {
  const [form, setForm] = useState({
    amount: String(subscription.pricePaid ?? ""),
    method: "mpesa",
    reference: "",
    note: "",
  });
  const { mutate, isPending } = useRecordPayment(subscription.businessId);
  // "Today" for the preview, fixed when the dialog opens
  const [openedAt] = useState(() => Date.now());
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const method = METHODS.find(([value]) => value === form.method);
  const amount = Number(form.amount);
  const referenceRequired = form.method !== "manual";
  const valid = amount > 0 && (!referenceRequired || form.reference.trim());

  // Mirrors the server: the new period follows a still-running paid period,
  // otherwise starts today
  const currentEnd = new Date(subscription.currentPeriodEnd).getTime();
  const start = subscription.status === "active" && currentEnd > openedAt ? currentEnd : openedAt;
  const end = new Date(start + CYCLE_DAYS[subscription.billingCycle] * DAY_MS);

  const submit = () =>
    mutate(
      {
        amount,
        method: form.method,
        // M-Pesa receipt codes are upper case; bank references are kept as typed
        reference: form.method === "mpesa" ? form.reference.trim().toUpperCase() : form.reference.trim(),
        note: form.note.trim(),
      },
      {
        onSuccess: () => {
          toast.success(`Payment recorded for ${subscription.businessName}`);
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );

  return (
    <Dialog
      title="Record payment"
      description={
        <>
          For a payment <span className="font-medium text-zinc-700 dark:text-zinc-300">{subscription.businessName}</span>{" "}
          made outside the app. Their {capitalise(subscription.planSlug)} plan ({subscription.billingCycle}) becomes
          active until <span className="font-medium text-zinc-700 dark:text-zinc-300">{formatDate(end)}</span>.
        </>
      }
      onClose={onClose}
      onSubmit={submit}
      submitLabel={amount > 0 ? `Record ${formatMoney(amount, subscription.currency)}` : "Record payment"}
      isPending={isPending}
      submitDisabled={!valid}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="payment-amount" className={labelClass}>
            Amount ({subscription.currency})
          </label>
          <input
            id="payment-amount"
            type="number"
            min="1"
            step="any"
            required
            value={form.amount}
            onChange={update("amount")}
            className={`${inputClass} tabular-nums`}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="payment-method" className={labelClass}>
            Method
          </label>
          <select id="payment-method" value={form.method} onChange={update("method")} className={selectClass}>
            {METHODS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="payment-reference" className={labelClass}>
          {method[2]}
        </label>
        <input
          id="payment-reference"
          value={form.reference}
          onChange={update("reference")}
          required={referenceRequired}
          placeholder={form.method === "mpesa" ? "e.g. SJK4H7XQ2P" : ""}
          className={`${inputClass} font-mono ${form.method === "mpesa" ? "uppercase placeholder:normal-case" : ""}`}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          A reference can only be recorded once, so the same payment can't be entered twice.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="payment-note" className={labelClass}>
          Note <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <input id="payment-note" value={form.note} onChange={update("note")} className={inputClass} />
      </div>
    </Dialog>
  );
};

export default RecordPaymentDialog;
