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
