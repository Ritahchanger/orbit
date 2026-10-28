// Shown when Orbit has suspended or cancelled the signed-in user's business.
// The API client sends users here when a request is refused with
// BUSINESS_BLOCKED (see api/axios-conf.jsx).
import { Ban, LogOut, Mail, XCircle } from "lucide-react";
import { useAuth } from "../../context/authentication/AuthenticationContext";
import { BUSINESS_BLOCKED_KEY } from "../../api/axios-conf";

const readBlocked = () => {
  try {
    return JSON.parse(sessionStorage.getItem(BUSINESS_BLOCKED_KEY)) || {};
  } catch {
    return {};
  }
};

const COPY = {
  suspended: {
    title: "Your business account is suspended",
    body: "Orbit has paused access to this business. You and your team can't sign in until it's reactivated. Your data is kept safe in the meantime.",
  },
  cancelled: {
    title: "Your business account has been cancelled",
    body: "This business no longer has access to Orbit. Contact support if you think this is a mistake.",
  },
  default: {
    title: "This business account is unavailable",
    body: "Access to this business has been turned off.",
  },
};

const BusinessBlocked = () => {
  const { logout } = useAuth();
  const blocked = readBlocked();
  const copy = COPY[blocked.status] || COPY.default;
  const Icon = blocked.status === "cancelled" ? XCircle : Ban;

  const signOut = () => {
    try {
      sessionStorage.removeItem(BUSINESS_BLOCKED_KEY);
    } catch {
      // Nothing to clear
    }
    logout();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
          <Icon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{copy.body}</p>

        {blocked.supportEmail && (
          <a
            href={`mailto:${blocked.supportEmail}?subject=${encodeURIComponent("Business account access")}`}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Contact {blocked.supportEmail}
          </a>
        )}

        <button
          type="button"
          onClick={signOut}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 ${
            blocked.supportEmail ? "mt-3" : "mt-6"
          }`}
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default BusinessBlocked;
