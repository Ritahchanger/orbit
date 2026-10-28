import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, CreditCard, Receipt, Store, Users } from "lucide-react";
import { usePlatformOverview } from "../hooks/use-platform-data";
import StatCard from "../components/StatCard";
import Panel from "../components/Panel";
import { BusinessStatusBadge, PlanBadge } from "../components/Badges";
import { EmptyState, ErrorState, LoadingState } from "../components/PageState";
import {
  capitalise,
  formatDate,
  formatMoney,
  formatMonth,
  formatNumber,
  formatRelative,
} from "../utils/format";

// "KSh 12,000 · USD 300", or "—" when there's nothing
const moneyList = (rows) =>
  rows?.length ? rows.map((r) => formatMoney(r.amount, r.currency)).join(" · ") : "—";

const CountRows = ({ counts, render }) => (
  <dl className="space-y-2">
    {Object.entries(counts).map(([key, count]) => (
      <div key={key} className="flex items-center justify-between text-sm">
        <dt>{render(key)}</dt>
        <dd className="font-medium text-gray-900 dark:text-white tabular-nums">{formatNumber(count)}</dd>
      </div>
    ))}
  </dl>
);

const PlatformOverview = () => {
  const { data, isLoading, error, refetch } = usePlatformOverview();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { businesses, signups, subscriptions, activity, recentBusinesses } = data;
  const growth = businesses.newThisMonth - businesses.newLastMonth;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Every business on Orbit at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          title="Businesses"
          value={formatNumber(businesses.total)}
          icon={<Building2 className="h-5 w-5" />}
          hint={`${formatNumber(businesses.byStatus.active)} active · ${formatNumber(businesses.verified)} verified`}
        />
        <StatCard
          title="New this month"
          value={formatNumber(businesses.newThisMonth)}
          icon={<Building2 className="h-5 w-5" />}
          tone="green"
          hint={`${growth >= 0 ? "+" : ""}${growth} vs last month (${businesses.newLastMonth})`}
        />
        <StatCard
          title="Monthly recurring revenue"
          value={moneyList(subscriptions.monthlyRecurringRevenue)}
          icon={<CreditCard className="h-5 w-5" />}
          tone="purple"
          hint={`${formatNumber(subscriptions.byStatus.active)} paying · ${formatNumber(subscriptions.byStatus.trialing)} on trial`}
        />
        <StatCard
          title="Subscription payments (30 days)"
          value={moneyList(subscriptions.payments30d)}
          icon={<Receipt className="h-5 w-5" />}
          tone="orange"
          hint={`${formatNumber(subscriptions.payments30d.reduce((n, r) => n + r.count, 0))} successful payments`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard title="Users across businesses" value={formatNumber(activity.users)} icon={<Users className="h-5 w-5" />} tone="indigo" />
        <StatCard title="Stores" value={formatNumber(activity.stores)} icon={<Store className="h-5 w-5" />} tone="indigo" />
        <StatCard
          title="Sales recorded (30 days)"
          value={formatMoney(activity.sales30d.total)}
          icon={<Receipt className="h-5 w-5" />}
          tone="indigo"
          hint={`${formatNumber(activity.sales30d.count)} sales across all businesses`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel title="Sign-ups, last 12 months" className="xl:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signups} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12 }} stroke="currentColor" className="text-gray-500" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="currentColor" className="text-gray-500" />
                <Tooltip
                  labelFormatter={formatMonth}
                  formatter={(value) => [value, "New businesses"]}
                  cursor={{ fillOpacity: 0.1 }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[2, 2, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Businesses by status">
            <CountRows counts={businesses.byStatus} render={(s) => <BusinessStatusBadge status={s} />} />
          </Panel>
          <Panel title="Subscriptions">
            <CountRows
              counts={subscriptions.byStatus}
              render={(s) => <span className="text-gray-700 dark:text-gray-300">{capitalise(s)}</span>}
            />
            {subscriptions.byPlan.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                {subscriptions.byPlan.map((p) => (
                  <span key={p.plan} className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                    <PlanBadge plan={p.plan} /> {p.count}
                  </span>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Trials ending in the next 7 days">
          {subscriptions.trialsEndingSoon.length === 0 ? (
            <EmptyState>No trials end this week.</EmptyState>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {subscriptions.trialsEndingSoon.map((t) => (
                <li key={t.businessId} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <Link to={`/platform/businesses/${t.businessId}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block">
                      {t.businessName}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.businessEmail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PlanBadge plan={t.plan} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{formatRelative(t.trialEndDate)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Newest businesses"
          action={
            <Link to="/platform/businesses" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all
            </Link>
          }
        >
          {recentBusinesses.length === 0 ? (
            <EmptyState>No businesses yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentBusinesses.map((b) => (
                <li key={b._id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <Link to={`/platform/businesses/${b._id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block">
                      {b.businessName}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {[b.city, b.country].filter(Boolean).join(", ") || b.businessEmail} · joined {formatDate(b.createdAt)}
                    </p>
                  </div>
                  <BusinessStatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default PlatformOverview;
