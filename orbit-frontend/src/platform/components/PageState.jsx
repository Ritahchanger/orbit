import { AlertTriangle, Loader2 } from "lucide-react";

export const LoadingState = ({ label = "Loading…" }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500 dark:text-gray-400">
    <Loader2 className="h-4 w-4 animate-spin" />
    {label}
  </div>
);

export const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <AlertTriangle className="h-6 w-6 text-red-500" />
    <p className="text-sm text-gray-700 dark:text-gray-300">
      {error?.message || "Something went wrong"}
    </p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
      >
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ children }) => (
  <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">{children}</p>
);
