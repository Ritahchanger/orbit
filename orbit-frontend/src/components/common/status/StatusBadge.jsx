import { statusClass, statusLabel } from "./statusStyles";

// The one status pill used across admin pages.
const StatusBadge = ({ status, label, icon: Icon, className = "" }) => (
  <span
    className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium whitespace-nowrap ${statusClass(status)} ${className}`}
  >
    {Icon && <Icon className="h-3 w-3" />}
    {label ?? statusLabel(status)}
  </span>
);

export default StatusBadge;
