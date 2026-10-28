import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CalendarPlus, ChevronDown, ExternalLink, MoreHorizontal, Receipt, Repeat } from "lucide-react";
import Button from "../ui/Button";
import ExtendTrialDialog from "./ExtendTrialDialog";
import ChangePlanDialog from "./ChangePlanDialog";
import RecordPaymentDialog from "./RecordPaymentDialog";

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none select-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-40";

/**
 * Billing actions for one business's subscription. `subscription` needs
 * businessId, businessName, planSlug, billingCycle, status, pricePaid,
 * currency, trialEndDate and currentPeriodEnd.
 */
const SubscriptionActions = ({ subscription, onView, compact = false }) => {
  const [open, setOpen] = useState(null); // "trial" | "plan" | "payment"
  const close = () => setOpen(null);
  const cancelled = subscription.status === "cancelled";

  return (
    <>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          {compact ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Billing actions"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm">
              Manage
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
            </Button>
          )}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="z-50 min-w-52 rounded-md border border-zinc-200 bg-white p-1 text-zinc-700 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {onView && (
              <>
                <DropdownMenu.Item className={itemClass} onSelect={onView}>
                  <ExternalLink className="h-4 w-4" />
                  View business
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              </>
            )}
            <DropdownMenu.Item
              className={itemClass}
              disabled={cancelled}
              onSelect={() => setOpen("payment")}
            >
              <Receipt className="h-4 w-4" />
              Record payment
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={itemClass}
              disabled={subscription.status !== "trialing"}
              onSelect={() => setOpen("trial")}
            >
              <CalendarPlus className="h-4 w-4" />
              Extend trial
            </DropdownMenu.Item>
            <DropdownMenu.Item className={itemClass} disabled={cancelled} onSelect={() => setOpen("plan")}>
              <Repeat className="h-4 w-4" />
              Change plan
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Dialogs are portalled, but React events still bubble to the table row */}
      <span className="contents" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        {open === "trial" && <ExtendTrialDialog subscription={subscription} onClose={close} />}
        {open === "plan" && <ChangePlanDialog subscription={subscription} onClose={close} />}
        {open === "payment" && <RecordPaymentDialog subscription={subscription} onClose={close} />}
      </span>
    </>
  );
};

export default SubscriptionActions;
