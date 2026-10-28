import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { usePlatformBusinesses, usePlatformOverview } from "../hooks/use-platform-data";
import PageHeader from "../components/ui/PageHeader";
import Avatar from "../components/ui/Avatar";
import Pagination from "../components/Pagination";
import BusinessActions from "../components/BusinessActions";
import ChangeStatusDialog from "../components/ChangeStatusDialog";
import { BusinessStatus } from "../components/ui/StatusDot";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { inputClass, selectClass } from "../components/ui/styles";
import { rowLinkClass, tableClass, tbodyClass, tdClass, thClass, theadRowClass } from "../components/ui/table";
import { capitalise, formatDate, formatMoney, formatNumber, formatRelative } from "../utils/format";

const PAGE_SIZE = 20;

const STATUS_TABS = [
  ["", "All"],
  ["active", "Active"],
  ["pending", "Pending"],
  ["suspended", "Suspended"],
  ["cancelled", "Cancelled"],
];

const SELECTS = {
  plan: [
    ["", "All plans"],
    ["starter", "Starter"],
    ["professional", "Professional"],
    ["enterprise", "Enterprise"],
  ],
  verified: [
    ["", "Any verification"],
    ["true", "Verified"],
    ["false", "Unverified"],
  ],
  sort: [
    ["newest", "Newest first"],
    ["oldest", "Oldest first"],
    ["name", "Name A–Z"],
  ],
};

const COLUMNS = [
  ["Business"],
  ["Status"],
  ["Plan"],
  ["Owner"],
  ["Stores", "text-right"],
  ["Users", "text-right"],
  ["Sales · 30d", "text-right"],
  ["Last sale"],
  ["Joined", "text-right"],
  ["", "w-12"],
];

const SkeletonRows = () =>
  Array.from({ length: 8 }, (_, i) => (
    <tr key={i}>
      {COLUMNS.map(([label]) => (
        <td key={label || "actions"} className={tdClass}>
          <Skeleton className={label === "Business" ? "h-8 w-48" : "h-4 w-16"} />
        </td>
      ))}
    </tr>
  ));

const PlatformBusinesses = () => {
  const navigate = useNavigate();
  // Filters live in the URL so a filtered list can be bookmarked or shared
  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams);
  const [search, setSearch] = useState(params.search || "");
  // Follow the URL when the search changes from outside this page (the
  // navbar search), without fighting this page's own debounced updates
  const urlSearch = params.search || "";
  const [syncedSearch, setSyncedSearch] = useState(urlSearch);
  if (urlSearch !== syncedSearch) {
    setSyncedSearch(urlSearch);
    setSearch(urlSearch);
  }
  // { business, status } while the status-change dialog is open
  const [pendingAction, setPendingAction] = useState(null);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next, { replace: true });
  };

  // Apply the search box 300ms after typing stops
  useEffect(() => {
    if (search === (params.search || "")) return undefined;
    const timer = setTimeout(() => setParam("search", search.trim()), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const { data, isLoading, isFetching, error, refetch } = usePlatformBusinesses({
    ...params,
    limit: PAGE_SIZE,
  });
  // Tab counts come from the (cached) overview
  const { data: overview } = usePlatformOverview();
  const tabCount = (status) =>
    overview && (status ? overview.businesses.byStatus[status] : overview.businesses.total);

  const open = (id) => navigate(`/platform/businesses/${id}`);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Businesses"
        description="Every business registered on Orbit, with its plan, owner and recent activity."
      />

      <div className="rounded-lg border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Status tabs */}
        <div className="flex gap-6 overflow-x-auto border-b border-zinc-200 px-5 dark:border-zinc-800" role="tablist">
          {STATUS_TABS.map(([value, label]) => {
            const active = (params.status || "") === value;
            const count = tabCount(value);
            return (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setParam("status", value)}
                className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 py-3 text-sm transition-colors ${
                  active
                    ? "border-zinc-900 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {label}
                {count != null && (
                  <span className="rounded-full bg-zinc-100 px-1.5 py-px text-[11px] font-medium text-zinc-600 tabular-nums dark:bg-zinc-800 dark:text-zinc-400">
                    {formatNumber(count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-2 border-b border-zinc-200 p-3 sm:flex-row sm:items-center dark:border-zinc-800">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search businesses</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, registration no. or city"
              className={`${inputClass} pl-9`}
            />
          </label>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            {Object.entries(SELECTS).map(([key, options]) => (
              <select
                key={key}
                aria-label={key}
                value={params[key] || options[0][0]}
                onChange={(e) => setParam(key, e.target.value)}
                className={`${selectClass} sm:w-40`}
              >
                {options.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {error ? (
          <div className="p-5">
            <ErrorState error={error} onRetry={refetch} />
          </div>
        ) : !isLoading && data.data.length === 0 ? (
          <EmptyState title="No businesses found">Try a different search or clear the filters.</EmptyState>
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}>
              <table className={tableClass}>
                <thead>
                  <tr className={theadRowClass}>
                    {COLUMNS.map(([label, align = ""]) => (
                      <th key={label || "actions"} className={`${thClass} ${align}`}>
                        {label || <span className="sr-only">Actions</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={tbodyClass}>
                  {isLoading ? (
                    <SkeletonRows />
                  ) : (
                    data.data.map((b) => (
                      <tr
                        key={b._id}
                        className={rowLinkClass}
                        tabIndex={0}
                        onClick={() => open(b._id)}
                        onKeyDown={(e) => e.key === "Enter" && open(b._id)}
                      >
                        <td className={tdClass}>
                          <div className="flex items-center gap-3">
                            <Avatar name={b.businessName} />
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-900 dark:text-zinc-100">{b.businessName}</p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {[b.businessType, b.city].filter(Boolean).join(" · ") || b.businessEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className={tdClass}>
                          <BusinessStatus status={b.status} />
                          {!b.isVerified && (
                            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Unverified</p>
                          )}
                        </td>
                        <td className={tdClass}>
                          <p className="text-zinc-900 dark:text-zinc-100">
                            {b.subscription ? capitalise(b.subscription.planSlug) : "—"}
                          </p>
                          {b.subscription && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {capitalise(b.subscription.status)}
                              {b.subscription.status === "trialing" &&
                                ` · ends ${formatRelative(b.subscription.trialEndDate).toLowerCase()}`}
                            </p>
                          )}
                        </td>
                        <td className={tdClass}>
                          <p className="text-zinc-900 dark:text-zinc-100">
                            {b.owner ? `${b.owner.firstName} ${b.owner.lastName}` : "—"}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Last login {formatRelative(b.owner?.lastLoginAt).toLowerCase()}
                          </p>
                        </td>
                        <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(b.stats.stores)}</td>
                        <td className={`${tdClass} text-right tabular-nums`}>{formatNumber(b.stats.users)}</td>
                        <td className={`${tdClass} text-right tabular-nums`}>
                          <p className="text-zinc-900 dark:text-zinc-100">{formatMoney(b.stats.sales30d.total)}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {formatNumber(b.stats.sales30d.count)} sales
                          </p>
                        </td>
                        <td className={`${tdClass} whitespace-nowrap text-zinc-600 dark:text-zinc-400`}>
                          {formatRelative(b.stats.lastSaleAt)}
                        </td>
                        <td className={`${tdClass} whitespace-nowrap text-right text-zinc-600 tabular-nums dark:text-zinc-400`}>
                          {formatDate(b.createdAt)}
                        </td>
                        <td className={`${tdClass} text-right`}>
                          <BusinessActions
                            compact
                            status={b.status}
                            onView={() => open(b._id)}
                            onSelect={(status) => setPendingAction({ business: b, status })}
                          />
                        </td>
                      </tr>
                    ))
                  )}
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

      {pendingAction && (
        <ChangeStatusDialog
          business={pendingAction.business}
          targetStatus={pendingAction.status}
          onClose={() => setPendingAction(null)}
        />
      )}
    </div>
  );
};

export default PlatformBusinesses;
