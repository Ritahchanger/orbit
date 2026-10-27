import { Award, Crown, Target, User, Users } from "lucide-react";
import { getUserStatus } from "./userStatus";

const ROLE_STYLES = {
  superadmin: {
    icon: Crown,
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
  },
  admin: {
    icon: Award,
    className:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400",
  },
  manager: {
    icon: Target,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
  },
  cashier: {
    icon: User,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
  },
  staff: {
    icon: Users,
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400",
  },
};

const FALLBACK_ROLE_STYLE = {
  icon: User,
  className:
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-700/40 dark:text-gray-300",
};

const pill =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize";

export const UserRoleBadge = ({ role }) => {
  const { icon: Icon, className } = ROLE_STYLES[role] || FALLBACK_ROLE_STYLE;
  return (
    <span className={`${pill} ${className}`}>
      <Icon size={12} />
      {role || "No role"}
    </span>
  );
};

const STATUS_STYLES = {
  active:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400",
  inactive:
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-700/40 dark:text-gray-300",
  suspended:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
};

export const UserStatusBadge = ({ user }) => {
  const status = getUserStatus(user);
  return (
    <span className={`${pill} ${STATUS_STYLES[status]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "active"
            ? "bg-green-500"
            : status === "suspended"
              ? "bg-red-500"
              : "bg-gray-400"
        }`}
      />
      {status}
    </span>
  );
};
