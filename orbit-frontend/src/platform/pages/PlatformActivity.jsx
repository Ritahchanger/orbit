import { useSearchParams } from "react-router-dom";
import { usePlatformActivity } from "../hooks/use-platform-data";
import PageHeader from "../components/ui/PageHeader";
import Pagination from "../components/Pagination";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { selectClass } from "../components/ui/styles";
import { dotClass } from "../components/ui/tones";
import { tableClass, tbodyClass, tdClass, thClass, theadRowClass } from "../components/ui/table";
import ActivityDescription from "../components/ActivityDescription";
import { ACTION_FILTERS, activityTone, actorLabel } from "../utils/activity";

const PAGE_SIZE = 25;

const formatTimestamp = (value) =>
  new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const PlatformActivity = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams);
  const { data, isLoading, isFetching, error, refetch } = usePlatformActivity({ ...params, limit: PAGE_SIZE });

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Everything platform admins have done in the console: sign-ins, failed attempts and business status changes."
      />

      <div className="rounded-lg border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-3 dark:border-zinc-800">
          <select
            aria-label="Filter activity"
            value={params.action || ""}
            onChange={(e) => setParam("action", e.target.value)}
            className={`${selectClass} sm:w-64`}
          >
            {ACTION_FILTERS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="p-5">
            <ErrorState error={error} onRetry={refetch} />
          </div>
        ) : !isLoading && data.data.length === 0 ? (
          <EmptyState title="No activity yet">Actions taken in the console will appear here.</EmptyState>
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}>
              <table className={tableClass}>
                <thead>
                  <tr className={theadRowClass}>
                    <th className={thClass}>When</th>
                    <th className={thClass}>Admin</th>
                    <th className={thClass}>Activity</th>
                    <th className={thClass}>Reason</th>
                    <th className={thClass}>IP address</th>
                  </tr>
                </thead>
                <tbody className={tbodyClass}>
                  {isLoading
                    ? Array.from({ length: 8 }, (_, i) => (
                        <tr key={i}>
                          {["w-28", "w-32", "w-64", "w-40", "w-24"].map((width) => (
                            <td key={width} className={tdClass}>
                              <Skeleton className={`h-4 ${width}`} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : data.data.map((entry) => (
                        <tr key={entry._id}>
                          <td className={`${tdClass} whitespace-nowrap text-zinc-600 tabular-nums dark:text-zinc-400`}>
                            {formatTimestamp(entry.createdAt)}
                          </td>
                          <td className={tdClass}>
                            <p className="text-zinc-900 dark:text-zinc-100">{actorLabel(entry)}</p>
                            {entry.actor?.name && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">{entry.actor.email}</p>
                            )}
                          </td>
                          <td className={tdClass}>
                            <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass(activityTone(entry))}`} aria-hidden />
                              <span><ActivityDescription entry={entry} /></span>
                            </span>
                          </td>
                          <td className={`${tdClass} max-w-xs whitespace-normal text-zinc-600 dark:text-zinc-400`}>
                            {entry.details?.reason || "—"}
                          </td>
                          <td className={`${tdClass} font-mono text-xs text-zinc-500 dark:text-zinc-400`}>
                            {entry.ip || "—"}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
            {data && (
              <Pagination
                page={data.pagination.page}
                limit={data.pagination.limit}
                total={data.pagination.total}
                totalPages={data.pagination.totalPages}
                onPageChange={(page) => setParam("page", String(page))}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlatformActivity;
