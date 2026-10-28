import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, BadgeCheck, ChevronRight } from "lucide-react";
import { usePlatformBusiness } from "../hooks/use-platform-data";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import ChartTooltip from "../components/ui/ChartTooltip";
import { Metric, MetricGroup } from "../components/ui/Metric";
import { BusinessStatus, StatusDot, SubscriptionStatus } from "../components/ui/StatusDot";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { tableClass, tbodyClass, tdClass, thClass, theadRowClass } from "../components/ui/table";
import BusinessActions from "../components/BusinessActions";
import ChangeStatusDialog from "../components/ChangeStatusDialog";
import BusinessActivityCard from "../components/BusinessActivityCard";
import {
  capitalise,
  formatCompact,
  formatDate,
  formatMoney,
  formatMonth,
  formatNumber,
  formatRelative,
} from "../utils/format";

// Label / value rows
const Details = ({ rows }) => (
  <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
    {rows.map(([label, value]) => (
      <div key={label} className="grid grid-cols-5 gap-4 px-5 py-3">
        <dt className="col-span-2 text-[13px] text-zinc-500 dark:text-zinc-400">{label}</dt>
        <dd className="col-span-3 break-words text-[13px] text-zinc-900 dark:text-zinc-100">
          {value || <span className="text-zinc-400">—</span>}
        </dd>
      </div>
    ))}
  </dl>
);

const DetailSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-4 w-40" />
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-md" />
      <Skeleton className="h-8 w-64" />
    </div>
    <Skeleton className="h-28 w-full rounded-lg" />
    <Skeleton className="h-72 w-full rounded-lg" />
  </div>
);

const PlatformBusinessDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = usePlatformBusiness(id);
  const [targetStatus, setTargetStatus] = useState(null);

  if (isLoading) return <DetailSkeleton />;
  if (error) return <ErrorState error={error} onRetry={error.status === 404 ? undefined : refetch} />;

  const { business, stats, sales, stores, payments } = data;
  const { owner, subscription } = business;
  const roles = Object.entries(stats.usersByRole)
    .map(([role, count]) => `${count} ${role}`)
    .join(" · ");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <nav className="mb-3 flex items-center gap-1 text-[13px] text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
            <Link to="/platform/businesses" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Businesses
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <span className="truncate text-zinc-900 dark:text-zinc-100">{business.businessName}</span>
          </nav>
        }
        title={
          <span className="flex items-center gap-4">
            <Avatar name={business.businessName} size="lg" />
            <span className="min-w-0">
              <span className="block truncate">{business.businessName}</span>
              <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-normal tracking-normal">
                <BusinessStatus status={business.status} />
                {business.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[13px] text-zinc-600 dark:text-zinc-400">
                    <BadgeCheck className="h-4 w-4 text-sky-500" aria-hidden />
                    Verified
                  </span>
                ) : (
                  <StatusDot tone="amber">Unverified</StatusDot>
                )}
                <span className="text-[13px] text-zinc-500 dark:text-zinc-400">
                  Joined {formatDate(business.createdAt)}
                </span>
              </span>
            </span>
          </span>
        }
        actions={<BusinessActions status={business.status} onSelect={setTargetStatus} />}
      />

      {business.status === "suspended" && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/30">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
          <div className="text-sm">
            <p className="font-medium text-red-800 dark:text-red-300">
              Suspended {business.suspendedAt ? formatRelative(business.suspendedAt).toLowerCase() : ""}
            </p>
            {business.suspensionReason && (
              <p className="mt-0.5 text-red-700 dark:text-red-400">{business.suspensionReason}</p>
            )}
          </div>
        </div>
      )}

      <MetricGroup>
        <Metric label="Sales · 30d" value={formatMoney(sales.last30d.total)} footer={`${formatNumber(sales.last30d.count)} completed sales`} />
        <Metric
          label="Sales · all time"
          value={formatMoney(sales.allTime.total)}
          footer={`Last sale ${formatRelative(sales.lastSaleAt).toLowerCase()}`}
        />
        <Metric label="Stores · products" value={`${formatNumber(stats.stores)} · ${formatNumber(stats.products)}`} footer="Stores and products listed" />
        <Metric label="Users" value={formatNumber(stats.users)} footer={roles || "No users"} />
      </MetricGroup>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Sales" description="Completed sales value, last 6 months">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales.monthly} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid vertical={false} className="stroke-zinc-100 dark:stroke-zinc-800" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                />
                <YAxis
                  tickFormatter={formatCompact}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                />
                <Tooltip
                  cursor={{ fill: "rgb(161 161 170 / 0.12)" }}
                  content={
                    <ChartTooltip
                      labelFormatter={(m) => formatMonth(m) + " " + m.slice(0, 4)}
                      valueFormatter={(v, row) => `${formatMoney(v)} · ${formatNumber(row.count)} sales`}
                    />
                  }
                />
                <Bar dataKey="total" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Subscription" bodyClassName="p-0">
          {subscription ? (
            <Details
              rows={[
                ["Plan", capitalise(subscription.planSlug)],
                ["Status", <SubscriptionStatus key="s" status={subscription.status} />],
                ["Billing", capitalise(subscription.billingCycle)],
                [
                  "Price",
                  subscription.pricePaid != null ? formatMoney(subscription.pricePaid, subscription.currency) : null,
                ],
                subscription.status === "trialing"
                  ? ["Trial ends", `${formatDate(subscription.trialEndDate)} (${formatRelative(subscription.trialEndDate).toLowerCase()})`]
                  : ["Renews", formatDate(subscription.currentPeriodEnd)],
                ["Auto-renew", subscription.autoRenew ? "On" : "Off"],
                [
                  "Limits",
                  `${subscription.limits?.maxStores ?? subscription.plan?.maxStores ?? "—"} stores · ${
                    subscription.limits?.maxUsers ?? subscription.plan?.maxUsers ?? "—"
                  } users`,
                ],
              ]}
            />
          ) : (
            <EmptyState>No subscription on record.</EmptyState>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Business" bodyClassName="p-0">
          <Details
            rows={[
              ["Email", business.businessEmail],
              ["Phone", business.businessPhone],
              ["Type", business.businessType],
              ["Registration no.", business.registrationNumber],
              ["Tax ID", business.taxId],
              [
                "Address",
                [business.businessAddress, business.city, business.postalCode, business.country]
                  .filter(Boolean)
                  .join(", "),
              ],
              ["Website", business.website],
              ["Employees", business.employeeCount],
            ]}
          />
        </Card>

        <div className="space-y-6">
          <BusinessActivityCard businessId={business._id} />

          <Card title="Owner" bodyClassName="p-0">
            {owner ? (
              <Details
                rows={[
                  ["Name", `${owner.firstName} ${owner.lastName}`],
                  ["Email", owner.email],
                  ["Phone", owner.phoneNo],
                  ["Last login", formatRelative(owner.lastLoginAt)],
                ]}
              />
            ) : (
              <EmptyState>Owner account not found.</EmptyState>
            )}
          </Card>

          <Card title="Stores" description={`${stores.length} ${stores.length === 1 ? "store" : "stores"}`} bodyClassName="p-0">
            {stores.length === 0 ? (
              <EmptyState>No stores yet.</EmptyState>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {stores.map((s) => (
                  <li key={s._id} className="flex items-center justify-between gap-3 px-5 py-3 text-[13px]">
                    <span className="min-w-0 truncate">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{s.name}</span>
                      <span className="ml-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">{s.code}</span>
                    </span>
                    <StatusDot tone={s.status === "active" ? "green" : "gray"}>{capitalise(s.status)}</StatusDot>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card title="Subscription payments" description="The 10 most recent" bodyClassName="p-0">
        {payments.length === 0 ? (
          <EmptyState>No payments yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr className={theadRowClass}>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Description</th>
                  <th className={thClass}>Method</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody className={tbodyClass}>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className={`${tdClass} whitespace-nowrap text-zinc-600 tabular-nums dark:text-zinc-400`}>
                      {formatDate(p.createdAt)}
                    </td>
                    <td className={tdClass}>{p.description || "—"}</td>
                    <td className={`${tdClass} text-zinc-600 dark:text-zinc-400`}>{capitalise(p.paymentMethod)}</td>
                    <td className={tdClass}>
                      <StatusDot
                        tone={{ successful: "green", pending: "amber", failed: "red", refunded: "gray" }[p.status]}
                      >
                        {capitalise(p.status)}
                      </StatusDot>
                    </td>
                    <td className={`${tdClass} text-right font-medium tabular-nums`}>
                      {formatMoney(p.amount, p.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {targetStatus && (
        <ChangeStatusDialog
          business={business}
          targetStatus={targetStatus}
          onClose={() => setTargetStatus(null)}
        />
      )}
    </div>
  );
};

export default PlatformBusinessDetail;
