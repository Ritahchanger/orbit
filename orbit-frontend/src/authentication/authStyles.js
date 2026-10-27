// Shared class names for the login, signup and reset-password screens so
// every field, label and button on those pages looks the same.

export const authLabelText =
  "text-base font-medium text-gray-700 dark:text-gray-300";

export const authLabel = `mb-1.5 block ${authLabelText}`;

export const authInput = (hasError = false, extra = "") =>
  `h-11 w-full rounded-lg border bg-white px-3.5 text-lg text-gray-900 shadow-xs transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 ${
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
      : "border-gray-300 focus:border-blue-600 focus:ring-blue-600/15 dark:border-gray-700 dark:focus:border-blue-500"
  } ${extra}`;

export const authInputIcon =
  "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500";

export const authError =
  "mt-1.5 mb-0 flex items-center gap-1.5 text-base text-red-600 dark:text-red-400";

export const authPrimaryButton =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-50";

export const authSecondaryButton =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-lg font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-400/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800";

export const authLink =
  "font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300";
