import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Ban, BadgeCheck, ChevronDown, ExternalLink, MoreHorizontal, PlayCircle, XCircle } from "lucide-react";
import Button from "./ui/Button";
import { STATUS_ACTIONS, actionLabel } from "../utils/business-status";

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm outline-none select-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800";

const actionIcon = (from, to) => {
  if (to === "active") return from === "pending" ? <BadgeCheck className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />;
  if (to === "suspended") return <Ban className="h-4 w-4" />;
  return <XCircle className="h-4 w-4" />;
};

/**
 * Status actions for a business, allowed from its current status, with
 * cancel set apart as the destructive one. `compact` renders a "⋯" trigger
 * for table rows; `onView` adds a "View details" item.
 */
const BusinessActions = ({ status, onSelect, onView, compact = false }) => {
  const actions = STATUS_ACTIONS[status] || [];
  if (actions.length === 0 && !onView) return null;

  const safe = actions.filter((a) => a !== "cancelled");
  const canCancel = actions.includes("cancelled");

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        {compact ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Business actions"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            Actions
            <ChevronDown className="h-4 w-4 text-zinc-500" aria-hidden />
          </Button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          // Menu events bubble through the portal to the table row; keep them here
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="z-50 min-w-48 rounded-md border border-zinc-200 bg-white p-1 text-zinc-700 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          {onView && (
            <>
              <DropdownMenu.Item className={itemClass} onSelect={onView}>
                <ExternalLink className="h-4 w-4" />
                View details
              </DropdownMenu.Item>
              {actions.length > 0 && <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />}
            </>
          )}
          {safe.map((to) => (
            <DropdownMenu.Item key={to} className={itemClass} onSelect={() => onSelect(to)}>
              {actionIcon(status, to)}
              {actionLabel(status, to)}
            </DropdownMenu.Item>
          ))}
          {canCancel && (
            <>
              {safe.length > 0 && <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />}
              <DropdownMenu.Item
                className={`${itemClass} text-red-600 data-[highlighted]:bg-red-50 dark:text-red-400 dark:data-[highlighted]:bg-red-950/40`}
                onSelect={() => onSelect("cancelled")}
              >
                {actionIcon(status, "cancelled")}
                {actionLabel(status, "cancelled")}
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default BusinessActions;
