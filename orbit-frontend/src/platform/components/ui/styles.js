// Shared class names for the platform console. One neutral palette (zinc),
// one primary colour (near-black / white in dark mode); colour is reserved
// for status and data.

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:focus-visible:ring-white/20";

export const inputClass =
  "h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-white/10";

export const selectClass = `${inputClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2371717a' stroke-width='1.5'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.5rem_center] bg-no-repeat pr-8`;

export const labelClass = "text-[13px] font-medium text-zinc-700 dark:text-zinc-300";

export const mutedText = "text-zinc-500 dark:text-zinc-400";
