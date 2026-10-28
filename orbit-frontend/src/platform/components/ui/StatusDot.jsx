import { capitalise } from "../../utils/format";
import { dotClass } from "./tones";

// Status as a small coloured dot plus a neutral label

const BUSINESS = { active: "green", pending: "amber", suspended: "red", cancelled: "gray" };
const SUBSCRIPTION = {
  active: "green",
  trialing: "blue",
  past_due: "amber",
  cancelled: "gray",
  expired: "red",
};

export const StatusDot = ({ tone = "gray", children, className = "" }) => (
  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-zinc-700 dark:text-zinc-300 ${className}`}>
    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass(tone)}`} aria-hidden />
    {children}
  </span>
);

export const BusinessStatus = ({ status }) => (
  <StatusDot tone={BUSINESS[status]}>{capitalise(status)}</StatusDot>
);

export const SubscriptionStatus = ({ status }) =>
  status ? <StatusDot tone={SUBSCRIPTION[status]}>{capitalise(status)}</StatusDot> : null;
