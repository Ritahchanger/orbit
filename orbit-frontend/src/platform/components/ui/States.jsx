import { AlertCircle, Inbox } from "lucide-react";
import Button from "./Button";

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800 ${className}`} />
);

export const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
    <AlertCircle className="h-5 w-5 text-red-500" aria-hidden />
    <div>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Couldn't load this page</p>
      <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">{error?.message || "Something went wrong"}</p>
    </div>
    {onRetry && (
      <Button size="sm" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

export const EmptyState = ({ title, children }) => (
  <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
    <Inbox className="h-5 w-5 text-zinc-400" aria-hidden />
    {title && <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>}
    {children && <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{children}</p>}
  </div>
);
