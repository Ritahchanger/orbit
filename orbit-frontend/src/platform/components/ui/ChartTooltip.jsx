// Tooltip body for the console's recharts charts
const ChartTooltip = ({ active, payload, label, labelFormatter, valueFormatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {labelFormatter ? labelFormatter(label) : label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">
        {valueFormatter ? valueFormatter(payload[0].value, payload[0].payload) : payload[0].value}
      </p>
    </div>
  );
};

export default ChartTooltip;
