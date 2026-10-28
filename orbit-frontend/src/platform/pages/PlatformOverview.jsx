import { Link, useNavigate } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, RefreshCw } from "lucide-react";
import { usePlatformOverview } from "../hooks/use-platform-data";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import ChartTooltip from "../components/ui/ChartTooltip";
import { Delta, Metric, MetricGroup } from "../components/ui/Metric";
import { BusinessStatus } from "../components/ui/StatusDot";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { rowLinkClass, tableClass, tbodyClass, tdClass, thClass, theadRowClass } from "../components/ui/table";
import DistributionCard from "../components/DistributionCard";
import {
  capitalise,
  formatDate,
  formatMoney,
  formatMonth,
  formatNumber,
  formatRelative,
  percentChange,
} from "../utils/format";

// "KSh 12,000 · USD 300", or "—" when there's nothing
const moneyList = (rows) =>
  rows?.length ? rows.map((r) => formatMoney(r.amount, r.currency)).join(" · ") : "—";

const OverviewSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-28 w-full rounded-lg" />
    <div className="grid gap-6 xl:grid-cols-3">
      <Skeleton className="h-80 rounded-lg xl:col-span-2" />
      <Skeleton className="h-80 rounded-lg" />
    </div>
  </div>
);

const PlatformOverview = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = usePlatformOverview();

  if (isLoading) return <OverviewSkeleton />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { businesses, signups, subscriptions, activity, recentBusinesses } = data;
  const signupsThisYear = signups.reduce((sum, m) => sum + m.count, 0);
  const paymentsCount = subscriptions.payments30d.reduce((n, r) => n + r.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Health of the Orbit platform across every registered business."
        actions={
          <>
            <span className="hidden text-xs text-zinc-500 sm:inline dark:text-zinc-400">
              Updated {new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <Button size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} aria-hidden />
              Refresh
            </Button>
          </>
        }
      />

      <MetricGroup>
        <Metric
          label="Businesses"
          value={formatNumber(businesses.total)}
          footer={`${formatNumber(businesses.byStatus.active)} active · ${formatNumber(businesses.verified)} verified`}
        />
        <Metric
          label="New this month"
          value={formatNumber(businesses.newThisMonth)}
          footer={
            <Delta
              value={percentChange(businesses.newThisMonth, businesses.newLastMonth)}
              suffix="%"
              label={`vs ${businesses.newLastMonth} last month`}
            />
          }
        />
        <Metric
          label="Monthly recurring revenue"
          value={moneyList(subscriptions.monthlyRecurringRevenue)}
          footer={`${formatNumber(subscriptions.byStatus.active)} paying · ${formatNumber(subscriptions.byStatus.trialing)} trialing`}
        />
        <Metric
          label="Subscription payments · 30d"
          value={moneyList(subscriptions.payments30d)}
          footer={`${formatNumber(paymentsCount)} successful payments`}
        />
      </MetricGroup>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Business sign-ups"
          description={`${formatNumber(signupsThisYear)} new businesses in the last 12 months`}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signups} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="signupsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="0" className="stroke-zinc-100 dark:stroke-zinc-800" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                />
                <Tooltip
                  cursor={{ stroke: "#a1a1aa", strokeDasharray: "3 3" }}
                  content={
                    <ChartTooltip
                      labelFormatter={(m) => formatMonth(m) + " " + m.slice(0, 4)}
                      valueFormatter={(v) => `${v} new ${v === 1 ? "business" : "businesses"}`}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#signupsFill)"
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <DistributionCard
          title="Business status"
          description={`${formatNumber(businesses.total)} businesses`}
          segments={[
            { key: "active", label: "Active", tone: "green", count: businesses.byStatus.active },
            { key: "pending", label: "Pending review", tone: "amber", count: businesses.byStatus.pending },
            { key: "suspended", label: "Suspended", tone: "red", count: businesses.byStatus.suspended },
            { key: "cancelled", label: "Cancelled", tone: "gray", count: businesses.byStatus.cancelled },
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DistributionCard
          title="Subscriptions"
          description="By billing status"
          segments={[
            { key: "active", label: "Active", tone: "green", count: subscriptions.byStatus.active },
            { key: "trialing", label: "Trialing", tone: "blue", count: subscriptions.byStatus.trialing },
            { key: "past_due", label: "Past due", tone: "amber", count: subscriptions.byStatus.past_due },
            { key: "expired", label: "Expired", tone: "red", count: subscriptions.byStatus.expired },
            { key: "cancelled", label: "Cancelled", tone: "gray", count: subscriptions.byStatus.cancelled },
          ]}
          footer={
            subscriptions.byPlan.length > 0 && (
              <dl className="grid grid-cols-3 gap-3">
                {subscriptions.byPlan.map((p) => (
                  <div key={p.plan}>
                    <dt className="text-xs text-zinc-500 dark:text-zinc-400">{capitalise(p.plan)}</dt>
                    <dd className="mt-0.5 text-sm font-semibold tabular-nums">{formatNumber(p.count)}</dd>
                  </div>
                ))}
              </dl>
            )
          }
        />

        <Card title="Platform activity" description="Across all businesses" bodyClassName="p-0">
          <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {[
              ["Users", formatNumber(activity.users)],
              ["Stores", formatNumber(activity.stores)],
              ["Sales recorded · 30d", formatNumber(activity.sales30d.count)],
              ["Sales value · 30d", formatMoney(activity.sales30d.total)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-5 py-3.5">
                <dt className="text-[13px] text-zinc-600 dark:text-zinc-400">{label}</dt>
                <dd className="text-sm font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card
          title="Trials ending soon"
          description="Next 7 days"
          bodyClassName="p-0"
        >
          {subscriptions.trialsEndingSoon.length === 0 ? (
            <EmptyState>No trials end in the next 7 days.</EmptyState>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {subscriptions.trialsEndingSoon.map((t) => (
                <li key={t.businessId}>
                  <Link
                    to={`/platform/businesses/${t.businessId}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <Avatar name={t.businessName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.businessName}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {capitalise(t.plan)} trial
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-amber-600 dark:text-amber-400">
                      {formatRelative(t.trialEndDate)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="Recently joined"
        description="The newest businesses on the platform"
        bodyClassName="p-0"
        action={
          <Button size="sm" variant="ghost" onClick={() => navigate("/platform/businesses")}>
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Button>
        }
      >
        {recentBusinesses.length === 0 ? (
          <EmptyState title="No businesses yet">Businesses appear here as soon as they register.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr className={theadRowClass}>
                  <th className={thClass}>Business</th>
                  <th className={thClass}>Location</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Joined</th>
                </tr>
              </thead>
              <tbody className={tbodyClass}>
                {recentBusinesses.map((b) => (
                  <tr
                    key={b._id}
                    className={rowLinkClass}
                    tabIndex={0}
                    onClick={() => navigate(`/platform/businesses/${b._id}`)}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/platform/businesses/${b._id}`)}
                  >
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <Avatar name={b.businessName} />
                        <div className="min-w-0">
                          <p className="font-medium">{b.businessName}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{b.businessEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${tdClass} text-zinc-600 dark:text-zinc-400`}>
                      {[b.city, b.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className={tdClass}>
                      <BusinessStatus status={b.status} />
                    </td>
                    <td className={`${tdClass} text-right text-zinc-600 tabular-nums dark:text-zinc-400`}>
                      {formatDate(b.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PlatformOverview;
