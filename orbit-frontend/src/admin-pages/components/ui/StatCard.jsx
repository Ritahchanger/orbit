// Standard KPI tile: label + value on the left, tinted icon on the right, optional hint below.
// Class names are written out in full so Tailwind can find them.
const TONES = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  green: "bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
  yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
  red: "bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400",
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
};

const StatCard = ({
  title,
  value,
  icon,
  color = "blue",
  hint,
  badge,
  badgeClassName = "text-green-600 dark:text-green-400",
  valueClassName = "text-gray-900 dark:text-white",
}) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{title}</p>
        <p className={`text-xl font-bold mt-1 truncate ${valueClassName}`}>{value}</p>
      </div>
      {icon && (
        <div className={`p-2 rounded-sm shrink-0 ${TONES[color] || TONES.blue}`}>{icon}</div>
      )}
    </div>
    {(hint || badge) && (
      <div className="flex items-center justify-between gap-2 mt-2 text-xs">
        <p className="text-gray-500 dark:text-gray-400 truncate">{hint}</p>
        {badge && <span className={`font-medium shrink-0 ${badgeClassName}`}>{badge}</span>}
      </div>
    )}
  </div>
);

export default StatCard;
