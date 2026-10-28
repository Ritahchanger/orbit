import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, Package, Receipt, Store, Users } from "lucide-react";
import { usePlatformBusiness } from "../hooks/use-platform-data";
import StatCard from "../components/StatCard";
import Panel from "../components/Panel";
import ChangeStatusDialog from "../components/ChangeStatusDialog";
import { STATUS_ACTIONS, actionLabel } from "../utils/business-status";
import {
  BusinessStatusBadge,
  PlanBadge,
  SubscriptionStatusBadge,
  VerifiedBadge,
} from "../components/Badges";
import { EmptyState, ErrorState, LoadingState } from "../components/PageState";
import {
  capitalise,
  formatDate,
  formatMoney,
  formatMonth,
  formatNumber,
  formatRelative,
} from "../utils/format";

const Field = ({ label, children }) => (
  <div>
    <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="text-sm text-gray-900 dark:text-white break-words">{children || "—"}</dd>
  </div>
);

const PlatformBusinessDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = usePlatformBusiness(id);
  const [targetStatus, setTargetStatus] = useState(null);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={error.status === 404 ? undefined : refetch} />;

  const { business, stats, sales, stores, payments } = data;
  const { owner, subscription } = business;
  const actions = STATUS_ACTIONS[business.status] || [];

  return (
    <div className="space-y-4">
      <Link
        to="/platform/businesses"
        className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> All businesses
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{business.businessName}</h1>
            <BusinessStatusBadge status={business.status} />
            <VerifiedBadge verified={business.isVerified} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {[business.businessType, business.city, business.country].filter(Boolean).join(" · ")} · joined{" "}
            {formatDate(business.createdAt)}
          </p>
          {business.status === "suspended" && business.suspensionReason && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Suspended {formatDate(business.suspendedAt)}: {business.suspensionReason}
            </p>
          )}
        </div>
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setTargetStatus(status)}
                className={`px-3 py-1.5 text-sm font-medium rounded-sm ${
                  status === "active"
                    ? "text-white bg-blue-600 hover:bg-blue-700"
                    : "border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                }`}
              >
                {actionLabel(business.status, status)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard title="Stores" value={formatNumber(stats.stores)} icon={<Store className="h-5 w-5" />} />
        <StatCard
          title="Users"
          value={formatNumber(stats.users)}
          icon={<Users className="h-5 w-5" />}
          tone="indigo"
          hint={Object.entries(stats.usersByRole)
            .map(([role, count]) => `${count} ${role}`)
            .join(" · ")}
        />
        <StatCard title="Products" value={formatNumber(stats.products)} icon={<Package className="h-5 w-5" />} tone="purple" />
        <StatCard
          title="Sales (30 days)"
          value={formatMoney(sales.last30d.total)}
          icon={<Receipt className="h-5 w-5" />}
          tone="green"
          hint={`${formatNumber(sales.last30d.count)} sales · last ${formatRelative(sales.lastSaleAt).toLowerCase()}`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel title="Sales, last 6 months" className="xl:col-span-2">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales.monthly} margin={{ top: 4, right: 4, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12 }} stroke="currentColor" className="text-gray-500" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-gray-500"
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
                />
                <Tooltip
                  labelFormatter={formatMonth}
                  formatter={(value, _name, item) => [
                    `${formatMoney(value)} (${formatNumber(item.payload.count)} sales)`,
                    "Sales",
                  ]}
                  cursor={{ fillOpacity: 0.1 }}
                />
                <Bar dataKey="total" fill="#16a34a" radius={[2, 2, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            All time: {formatMoney(sales.allTime.total)} from {formatNumber(sales.allTime.count)} completed sales.
          </p>
        </Panel>

        <Panel title="Subscription">
          {subscription ? (
            <dl className="grid grid-cols-2 gap-3">
              <Field label="Plan"><PlanBadge plan={subscription.planSlug} /></Field>
              <Field label="Status"><SubscriptionStatusBadge status={subscription.status} /></Field>
              <Field label="Billing">{capitalise(subscription.billingCycle)}</Field>
              <Field label="Price paid">
                {subscription.pricePaid != null ? formatMoney(subscription.pricePaid, subscription.currency) : null}
              </Field>
              {subscription.status === "trialing" ? (
                <Field label="Trial ends">
                  {formatDate(subscription.trialEndDate)} ({formatRelative(subscription.trialEndDate)})
                </Field>
              ) : (
                <Field label="Current period ends">{formatDate(subscription.currentPeriodEnd)}</Field>
              )}
              <Field label="Auto-renew">{subscription.autoRenew ? "Yes" : "No"}</Field>
              <Field label="Store limit">{subscription.limits?.maxStores ?? subscription.plan?.maxStores}</Field>
              <Field label="User limit">{subscription.limits?.maxUsers ?? subscription.plan?.maxUsers}</Field>
            </dl>
          ) : (
            <EmptyState>No subscription on record.</EmptyState>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel title="Business details">
          <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            <Field label="Email">{business.businessEmail}</Field>
            <Field label="Phone">{business.businessPhone}</Field>
            <Field label="Registration number">{business.registrationNumber}</Field>
            <Field label="Tax ID">{business.taxId}</Field>
            <Field label="Address">
              {[business.businessAddress, business.city, business.postalCode, business.country]
                .filter(Boolean)
                .join(", ")}
            </Field>
            <Field label="Website">{business.website}</Field>
            <Field label="Employees">{business.employeeCount}</Field>
          </dl>
        </Panel>

        <Panel title="Owner">
          {owner ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
              <Field label="Name">{`${owner.firstName} ${owner.lastName}`}</Field>
              <Field label="Email">{owner.email}</Field>
              <Field label="Phone">{owner.phoneNo}</Field>
              <Field label="Last login">{formatRelative(owner.lastLoginAt)}</Field>
            </dl>
          ) : (
            <EmptyState>Owner account not found.</EmptyState>
          )}
        </Panel>

        <Panel title={`Stores (${stores.length})`}>
          {stores.length === 0 ? (
            <EmptyState>No stores yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {stores.map((s) => (
                <li key={s._id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-gray-900 dark:text-white truncate">
                    {s.name} <span className="text-gray-500 dark:text-gray-400">({s.code})</span>
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{capitalise(s.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Subscription payments">
        {payments.length === 0 ? (
          <EmptyState>No payments yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                  <th className="px-4 py-2 font-medium">Method</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{p.description || "—"}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{capitalise(p.paymentMethod)}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{capitalise(p.status)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-900 dark:text-white">
                      {formatMoney(p.amount, p.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

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
