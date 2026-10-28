// Formatting shared by the platform pages

const CURRENCY_LABELS = { KES: "KSh" };

// Sales totals are recorded without a currency; Orbit businesses sell in KES.
export const formatMoney = (amount, currency = "KES") => {
  const label = CURRENCY_LABELS[currency] || currency;
  return `${label} ${Math.round(amount || 0).toLocaleString()}`;
};

export const formatNumber = (value) => (value || 0).toLocaleString();

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// "3 days ago", "in 2 days", "Never"
export const formatRelative = (value, never = "Never") => {
  if (!value) return never;
  const days = Math.round((new Date(value).getTime() - Date.now()) / 86400000);
  if (days === 0) return "Today";
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(Math.round(days / 365), "year");
};

// "2026-03" -> "Mar"
export const formatMonth = (key) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: "short",
    timeZone: "UTC",
  });
};

export const capitalise = (text = "") =>
  text.charAt(0).toUpperCase() + text.slice(1).replace(/_/g, " ");

// "Acme Hardware Ltd" -> "AH"
export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("") || "?";

// Percentage change from `previous` to `current`, rounded; null when there's
// no baseline to compare against
export const percentChange = (current, previous) =>
  previous ? Math.round(((current - previous) / previous) * 100) : null;

export const formatPercent = (part, whole) =>
  whole ? `${Math.round((part / whole) * 100)}%` : "0%";

// 1234567 -> "1.2M", for chart axes
export const formatCompact = (value) =>
  new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
