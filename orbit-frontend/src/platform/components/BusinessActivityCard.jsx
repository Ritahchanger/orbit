import { Link } from "react-router-dom";
import { usePlatformActivity } from "../hooks/use-platform-data";
import Card from "./ui/Card";
import { EmptyState, Skeleton } from "./ui/States";
import { dotClass } from "./ui/tones";
import ActivityDescription from "./ActivityDescription";
import { activityTone, actorLabel } from "../utils/activity";
import { formatRelative } from "../utils/format";

// Status history of one business: who changed it, when and why
const BusinessActivityCard = ({ businessId }) => {
  const { data, isLoading } = usePlatformActivity({ businessId, limit: 5 });
  const entries = data?.data || [];

  return (
    <Card
      title="Console history"
      description="Status and billing changes made from the console"
      bodyClassName="p-0"
      action={
        data?.pagination.total > entries.length && (
          <Link
            to={`/platform/activity?businessId=${businessId}`}
            className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            View all
          </Link>
        )
      }
    >
      {isLoading ? (
        <div className="space-y-3 p-5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState>No changes made from the console yet.</EmptyState>
      ) : (
        <ol className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {entries.map((entry) => (
            <li key={entry._id} className="flex gap-3 px-5 py-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass(activityTone(entry))}`} aria-hidden />
              <div className="min-w-0 flex-1 text-[13px]">
                <p className="text-zinc-700 dark:text-zinc-300"><ActivityDescription entry={entry} withTarget={false} /></p>
                {entry.details?.reason && (
                  <p className="mt-0.5 text-zinc-500 dark:text-zinc-400">“{entry.details.reason}”</p>
                )}
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                  {actorLabel(entry)} · {formatRelative(entry.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
};

export default BusinessActivityCard;
