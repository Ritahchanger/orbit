import { useState } from "react";
import toast from "react-hot-toast";
import { useBillingPlans, useChangePlan } from "../../hooks/use-platform-billing";
import Dialog from "../ui/Dialog";
import { Skeleton } from "../ui/States";
import { inputClass, labelClass } from "../ui/styles";
import { capitalise, formatMoney } from "../../utils/format";

const ChangePlanDialog = ({ subscription, onClose }) => {
  const [planSlug, setPlanSlug] = useState(subscription.planSlug);
  const [billingCycle, setBillingCycle] = useState(subscription.billingCycle);
  const [reason, setReason] = useState("");
  const { data: plans, isLoading } = useBillingPlans();
  const { mutate, isPending } = useChangePlan(subscription.businessId);

  const unchanged = planSlug === subscription.planSlug && billingCycle === subscription.billingCycle;

  const submit = () =>
    mutate(
      { planSlug, billingCycle, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success(`${subscription.businessName} moved to ${capitalise(planSlug)}, ${billingCycle}`);
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );

  return (
    <Dialog
      title="Change plan"
      description={
        <>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{subscription.businessName}</span> is on{" "}
          {capitalise(subscription.planSlug)}, billed {subscription.billingCycle}. The new plan's limits apply straight
          away and its price from the next payment; the current period's dates don't change.
        </>
      }
      onClose={onClose}
      onSubmit={submit}
      submitLabel="Change plan"
      isPending={isPending}
      submitDisabled={unchanged || isLoading}
      size="max-w-lg"
    >
      <div className="space-y-1.5">
        <span className={labelClass}>Billing</span>
        <div className="inline-flex rounded-md border border-zinc-200 p-0.5 dark:border-zinc-700">
          {["monthly", "annual"].map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => setBillingCycle(cycle)}
              className={`rounded px-3 py-1 text-sm ${
                billingCycle === cycle
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {capitalise(cycle)}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className={`${labelClass} mb-1.5`}>Plan</legend>
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-md" />
        ) : (
          plans.map((plan) => {
            const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
            const selected = planSlug === plan.slug;
            return (
              <label
                key={plan.slug}
                className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                  selected
                    ? "border-zinc-900 bg-zinc-50 dark:border-zinc-300 dark:bg-zinc-800/60"
                    : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/40"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.slug}
                  checked={selected}
                  onChange={() => setPlanSlug(plan.slug)}
                  className="accent-zinc-900 dark:accent-white"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {plan.name}
                    {plan.slug === subscription.planSlug && (
                      <span className="ml-2 text-xs font-normal text-zinc-500">Current</span>
                    )}
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    {plan.maxStores} stores · {plan.maxUsers} users
                  </span>
                </span>
                <span className="text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatMoney(price, plan.currency)}
                  <span className="text-xs font-normal text-zinc-500">/{billingCycle === "annual" ? "yr" : "mo"}</span>
                </span>
              </label>
            );
          })
        )}
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="plan-reason" className={labelClass}>
          Reason <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          id="plan-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Upgrade requested by the owner"
          className={inputClass}
        />
      </div>
    </Dialog>
  );
};

export default ChangePlanDialog;
