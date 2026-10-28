import Card from "./ui/Card";
import { dotClass } from "./ui/tones";
import { formatNumber, formatPercent } from "../utils/format";

// A labelled breakdown: one proportional bar across the top, then a row per
// segment with its count and share. segments: [{ key, label, tone, count }]
const DistributionCard = ({ title, description, segments, footer }) => {
  const total = segments.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card title={title} description={description}>
      <div className="flex h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        {total > 0 &&
          segments
            .filter((s) => s.count > 0)
            .map((s) => (
              <div
                key={s.key}
                className={`${dotClass(s.tone)} border-r-2 border-white last:border-r-0 dark:border-zinc-900`}
                style={{ width: `${(s.count / total) * 100}%` }}
                title={`${s.label}: ${s.count}`}
              />
            ))}
      </div>
      <dl className="mt-4 space-y-2.5">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-3 text-[13px]">
            <dt className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <span className={`h-2 w-2 rounded-full ${dotClass(s.tone)}`} aria-hidden />
              {s.label}
            </dt>
            <dd className="flex items-baseline gap-3 tabular-nums">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatNumber(s.count)}</span>
              <span className="w-9 text-right text-xs text-zinc-400 dark:text-zinc-500">
                {formatPercent(s.count, total)}
              </span>
            </dd>
          </div>
        ))}
      </dl>
      {footer && (
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">{footer}</div>
      )}
    </Card>
  );
};

export default DistributionCard;
