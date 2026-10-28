import { ArrowDownRight, ArrowUpRight } from "lucide-react";

// A row of headline numbers sharing one surface. The 1px gap over a
// border-coloured background draws the dividers for any column count.
export const MetricGroup = ({ children, columns = "sm:grid-cols-2 lg:grid-cols-4" }) => (
  <div
    className={`grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 shadow-xs dark:border-zinc-800 dark:bg-zinc-800 ${columns}`}
  >
    {children}
  </div>
);

// Signed change, green when up and red when down; null hides it
export const Delta = ({ value, suffix = "", label }) => {
  if (value == null || Number.isNaN(value)) return null;
  const up = value >= 0;
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span
        className={`inline-flex items-center font-medium tabular-nums ${
          up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
        }`}
      >
        {up ? (
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
        )}
        {up ? "+" : ""}
        {value}
        {suffix}
      </span>
      {label && <span className="text-zinc-500 dark:text-zinc-400">{label}</span>}
    </span>
  );
};

export const Metric = ({ label, value, footer, size = "lg" }) => (
  <div className="min-w-0 bg-white px-5 py-4 dark:bg-zinc-900">
    <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
    <p
      className={`mt-1.5 truncate font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-50 ${
        size === "lg" ? "text-2xl" : "text-xl"
      }`}
    >
      {value}
    </p>
    {footer && <div className="mt-1.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{footer}</div>}
  </div>
);
