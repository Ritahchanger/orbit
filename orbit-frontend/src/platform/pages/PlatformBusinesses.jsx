import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { usePlatformBusinesses } from "../hooks/use-platform-data";
import Panel from "../components/Panel";
import Pagination from "../components/Pagination";
import {
  BusinessStatusBadge,
  PlanBadge,
  SubscriptionStatusBadge,
  VerifiedBadge,
} from "../components/Badges";
import { EmptyState, ErrorState, LoadingState } from "../components/PageState";
import { formatDate, formatMoney, formatNumber, formatRelative } from "../utils/format";

const FILTERS = {
  status: [
    ["", "All statuses"],
    ["pending", "Pending"],
    ["active", "Active"],
    ["suspended", "Suspended"],
    ["cancelled", "Cancelled"],
  ],
  plan: [
    ["", "All plans"],
    ["starter", "Starter"],
    ["professional", "Professional"],
    ["enterprise", "Enterprise"],
  ],
  verified: [
    ["", "Verified or not"],
    ["true", "Verified"],
    ["false", "Unverified"],
  ],
  sort: [
    ["newest", "Newest first"],
    ["oldest", "Oldest first"],
    ["name", "Name A–Z"],
  ],
};

const control =
  "px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const PlatformBusinesses = () => {
  // Filters live in the URL so a filtered list can be bookmarked or shared
  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams);
  const [search, setSearch] = useState(params.search || "");

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
    limit: 20,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Businesses</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Every business registered on Orbit, with its plan and recent activity.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search businesses</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, registration number or city"
            className={`${control} w-full pl-9`}
          />
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(FILTERS).map(([key, options]) => (
            <select
              key={key}
              aria-label={key}
              value={params[key] || options[0][0]}
              onChange={(e) => setParam(key, e.target.value)}
              className={control}
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

      <Panel>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : data.data.length === 0 ? (
          <EmptyState>No businesses match these filters.</EmptyState>
        ) : (
          <div className={`space-y-4 ${isFetching ? "opacity-60" : ""}`}>
            <div className="overflow-x-auto -mx-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-2 font-medium">Business</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Plan</th>
                    <th className="px-4 py-2 font-medium">Owner</th>
                    <th className="px-4 py-2 font-medium text-right">Stores / users</th>
                    <th className="px-4 py-2 font-medium text-right">Sales (30d)</th>
                    <th className="px-4 py-2 font-medium">Last sale</th>
                    <th className="px-4 py-2 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.data.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                      <td className="px-4 py-3">
                        <Link
                          to={`/platform/businesses/${b._id}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {b.businessName}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {[b.businessType, b.city, b.country].filter(Boolean).join(" · ")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <BusinessStatusBadge status={b.status} />
                          <VerifiedBadge verified={b.isVerified} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <PlanBadge plan={b.subscription?.planSlug} />
                          <SubscriptionStatusBadge status={b.subscription?.status} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900 dark:text-white">
                          {b.owner ? `${b.owner.firstName} ${b.owner.lastName}` : "—"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {b.owner?.email} · last login {formatRelative(b.owner?.lastLoginAt).toLowerCase()}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-900 dark:text-white">
                        {b.stats.stores} / {b.stats.users}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <p className="text-gray-900 dark:text-white">{formatMoney(b.stats.sales30d.total)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatNumber(b.stats.sales30d.count)} sales
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {formatRelative(b.stats.lastSaleAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {formatDate(b.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              onPageChange={(page) => setParam("page", String(page))}
            />
          </div>
        )}
      </Panel>
    </div>
  );
};

export default PlatformBusinesses;
