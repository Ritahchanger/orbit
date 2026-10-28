import { capitalise } from "../utils/format";

const TONES = {
  green: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
};

const Badge = ({ tone = "gray", children }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium whitespace-nowrap ${TONES[tone]}`}
  >
    {children}
  </span>
);

const BUSINESS_TONES = { active: "green", pending: "yellow", suspended: "red", cancelled: "gray" };
const SUBSCRIPTION_TONES = {
  active: "green",
  trialing: "blue",
  past_due: "yellow",
  cancelled: "gray",
  expired: "red",
};
const PLAN_TONES = { starter: "gray", professional: "blue", enterprise: "purple" };

export const BusinessStatusBadge = ({ status }) => (
  <Badge tone={BUSINESS_TONES[status]}>{capitalise(status)}</Badge>
);

export const SubscriptionStatusBadge = ({ status }) =>
  status ? <Badge tone={SUBSCRIPTION_TONES[status]}>{capitalise(status)}</Badge> : null;

export const PlanBadge = ({ plan }) =>
  plan ? <Badge tone={PLAN_TONES[plan]}>{capitalise(plan)}</Badge> : <Badge>No plan</Badge>;

export const VerifiedBadge = ({ verified }) =>
  verified ? <Badge tone="green">Verified</Badge> : <Badge tone="yellow">Unverified</Badge>;
