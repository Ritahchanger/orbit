// One status palette for the whole app. Light mode uses a pale fill with
// 700-weight text (readable on white); dark mode uses a translucent fill.
// Class names are written out in full so Tailwind generates them.

export const TONE_CLASSES = {
  success:
    "bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30",
  warning:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  danger:
    "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
  info: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
  accent:
    "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30",
  neutral:
    "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-500/10 dark:text-gray-300 dark:border-gray-500/30",
};

const STATUS_TONES = {
  // stock
  "in stock": "success",
  "low stock": "warning",
  "out of stock": "danger",
  // records / stores / users
  active: "success",
  inactive: "neutral",
  maintenance: "warning",
  closed: "danger",
  // sales, payments, orders, invoices
  completed: "success",
  paid: "success",
  delivered: "success",
  sent: "success",
  success: "success",
  approved: "success",
  pending: "warning",
  partial: "warning",
  "partially refunded": "warning",
  trial: "warning",
  processing: "info",
  confirmed: "info",
  issued: "info",
  refunded: "info",
  shipped: "accent",
  failed: "danger",
  cancelled: "danger",
  canceled: "danger",
  rejected: "danger",
  overdue: "danger",
  expired: "danger",
  draft: "neutral",
  void: "neutral",
};

const normalize = (status) =>
  String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

export const statusTone = (status) => STATUS_TONES[normalize(status)] || "neutral";

/** Tailwind classes (fill, text, border) for a status value. */
export const statusClass = (status) => TONE_CLASSES[statusTone(status)];

/** Human label: "out_of_stock" → "Out of stock", keeps "In Stock" as-is. */
export const statusLabel = (status) => {
  const s = String(status ?? "").replace(/[_-]+/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Unknown";
};
