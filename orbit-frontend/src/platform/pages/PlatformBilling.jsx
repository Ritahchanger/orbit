import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, Clock, Search, TimerOff } from "lucide-react";
import { useBillingPayments, useBillingSubscriptions } from "../hooks/use-platform-billing";
import PageHeader from "../components/ui/PageHeader";
import Avatar from "../components/ui/Avatar";
import Pagination from "../components/Pagination";
import SubscriptionActions from "../components/billing/SubscriptionActions";
import { StatusDot, SubscriptionStatus } from "../components/ui/StatusDot";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { inputClass, selectClass } from "../components/ui/styles";
import { rowLinkClass, tableClass, tbodyClass, tdClass, thClass, theadRowClass } from "../components/ui/table";
import { capitalise, formatDate, formatMoney, formatNumber, formatRelative } from "../utils/format";

const VIEWS = [
  ["subscriptions", "Subscriptions"],
  ["payments", "Payments"],
];

const ATTENTION = [
  ["trial_ending", "Trials ending in 7 days", <Clock key="i" className="h-4 w-4" />, "text-amber-600 dark:text-amber-400"],
  ["trial_ended", "Trials ended, not paid", <TimerOff key="i" className="h-4 w-4" />, "text-red-600 dark:text-red-400"],
  ["overdue", "Overdue renewals", <AlertTriangle key="i" className="h-4 w-4" />, "text-red-600 dark:text-red-400"],
];

const STATUS_TABS = [
  ["", "All"],
  ["trialing", "Trialing"],
  ["active", "Active"],
  ["past_due", "Past due"],
  ["expired", "Expired"],
  ["cancelled", "Cancelled"],
];

const PAYMENT_TONES = { successful: "green", pending: "amber", failed: "red", refunded: "gray" };
const METHOD_LABELS = { mpesa: "M-Pesa", bank_transfer: "Bank transfer", manual: "Cash / other", stripe: "Card (Stripe)", paypal: "PayPal" };

// URL-backed filters shared by both views
const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams);
  const setParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in changes)) next.delete("page");
    setSearchParams(next, { replace: true });
  };
  return [params, setParams];
};

const SearchBox = ({ value, onChange, placeholder }) => {
  const [text, setText] = useState(value || "");
  // Follow outside changes (e.g. switching views), without fighting typing
  const [synced, setSynced] = useState(value || "");
  if ((value || "") !== synced) {
    setSynced(value || "");
    setText(value || "");
  }
  useEffect(() => {
    if (text === (value || "")) return undefined;
    const timer = setTimeout(() => onChange(text.trim()), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <label className="relative min-w-0 flex-1">
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pl-9`}
      />
    </label>
  );
};

const skeletonRows = (columns) =>
  Array.from({ length: 6 }, (_, i) => (
    <tr key={i}>
      {Array.from({ length: columns }, (__, j) => (
        <td key={j} className={tdClass}>
          <Skeleton className={j === 0 ? "h-8 w-44" : "h-4 w-20"} />
        </td>
      ))}
    </tr>
  ));

const SubscriptionsView = ({ params, setParams }) => {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, error, refetch } = useBillingSubscriptions({ ...params, limit: 20 });
  const counts = data?.counts;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {ATTENTION.map(([key, label, icon, tone]) => {
          const active = params.attention === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setParams({ attention: active ? "" : key, status: "" })}
              className={`flex items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-left shadow-xs transition-colors dark:bg-zinc-900 ${
                active
                  ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-300 dark:ring-zinc-300"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
              }`}
            >
              <span className="flex items-center gap-2 text-[13px] text-zinc-600 dark:text-zinc-400">
                <span className={tone}>{icon}</span>
                {label}
              </span>
              <span className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {counts ? formatNumber(counts.attention[key]) : "–"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex gap-6 overflow-x-auto border-b border-zinc-200 px-5 dark:border-zinc-800" role="tablist">
          {STATUS_TABS.map(([value, label]) => {
            const active = (params.status || "") === value && !params.attention;
            const count = counts && (value ? counts.byStatus[value] : Object.values(counts.byStatus).reduce((a, b) => a + b, 0));
            return (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setParams({ status: value, attention: "" })}
                className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 py-3 text-sm transition-colors ${
                  active
                    ? "border-zinc-900 font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {label}
                {count != null && (
                  <span className="rounded-full bg-zinc-100 px-1.5 py-px text-[11px] font-medium tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {formatNumber(count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 border-b border-zinc-200 p-3 sm:flex-row dark:border-zinc-800">
          <SearchBox value={params.search} onChange={(search) => setParams({ search })} placeholder="Search by business name or email" />
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <select aria-label="Plan" value={params.plan || ""} onChange={(e) => setParams({ plan: e.target.value })} className={`${selectClass} sm:w-36`}>
              <option value="">All plans</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select aria-label="Billing cycle" value={params.cycle || ""} onChange={(e) => setParams({ cycle: e.target.value })} className={`${selectClass} sm:w-36`}>
              <option value="">Any billing</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
            <select aria-label="Sort" value={params.sort || "renewal"} onChange={(e) => setParams({ sort: e.target.value })} className={`${selectClass} sm:w-44`}>
              <option value="renewal">Renews soonest</option>
              <option value="trial">Trial ends soonest</option>
              <option value="price">Highest price</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="p-5">
            <ErrorState error={error} onRetry={refetch} />
          </div>
        ) : !isLoading && data.data.length === 0 ? (
          <EmptyState title="No subscriptions found">Try another filter or clear the search.</EmptyState>
        ) : (
          <>
            <div className={`overflow-x-auto transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}>
              <table className={tableClass}>
                <thead>
                  <tr className={theadRowClass}>
                    <th className={thClass}>Business</th>
                    <th className={thClass}>Plan</th>
                    <th className={thClass}>Status</th>
                    <th className={`${thClass} text-right`}>Price</th>
                    <th className={thClass}>Trial / period ends</th>
                    <th className={thClass}>Last payment</th>
                    <th className={`${thClass} w-12`}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={tbodyClass}>
                  {isLoading
                    ? skeletonRows(7)
                    : data.data.map((s) => {
                        const business = s.business || {};
                        const open = () => business._id && navigate(`/platform/businesses/${business._id}`);
                        const trialing = s.status === "trialing";
                        const endDate = trialing ? s.trialEndDate : s.currentPeriodEnd;
                        const late = s.flags.trialEnded || s.flags.overdue;
                        return (
                          <tr key={s._id} className={rowLinkClass} tabIndex={0} onClick={open} onKeyDown={(e) => e.key === "Enter" && open()}>
                            <td className={tdClass}>
                              <div className="flex items-center gap-3">
                                <Avatar name={business.businessName} />
                                <div className="min-w-0">
                                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{business.businessName || "Deleted business"}</p>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{business.businessEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className={tdClass}>
                              <p className="text-zinc-900 dark:text-zinc-100">{capitalise(s.planSlug)}</p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">{capitalise(s.billingCycle)}</p>
                            </td>
                            <td className={tdClass}>
                              <SubscriptionStatus status={s.status} />
                              {s.flags.trialEnded && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">Trial ended</p>}
                              {s.flags.overdue && s.status === "active" && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">Overdue</p>}
                            </td>
                            <td className={`${tdClass} text-right tabular-nums`}>
                              {formatMoney(s.pricePaid, s.currency)}
                              <span className="text-xs text-zinc-500">/{s.billingCycle === "annual" ? "yr" : "mo"}</span>
                            </td>
                            <td className={tdClass}>
                              <p className="whitespace-nowrap text-zinc-900 tabular-nums dark:text-zinc-100">{formatDate(endDate)}</p>
                              <p className={`text-xs ${late ? "text-red-600 dark:text-red-400" : s.flags.trialEndingSoon ? "text-amber-600 dark:text-amber-400" : "text-zinc-500 dark:text-zinc-400"}`}>
                                {trialing ? "Trial " : "Renews "}
                                {formatRelative(endDate).toLowerCase()}
                              </p>
                            </td>
                            <td className={`${tdClass} whitespace-nowrap text-zinc-600 dark:text-zinc-400`}>
                              {s.lastPaymentDate ? formatDate(s.lastPaymentDate) : "Never"}
                            </td>
                            <td className={`${tdClass} text-right`}>
                              {business._id && (
                                <SubscriptionActions
                                  compact
                                  onView={open}
                                  subscription={{
                                    businessId: business._id,
                                    businessName: business.businessName,
                                    planSlug: s.planSlug,
                                    billingCycle: s.billingCycle,
                                    status: s.status,
                                    pricePaid: s.pricePaid,
                                    currency: s.currency,
                                    trialEndDate: s.trialEndDate,
                                    currentPeriodEnd: s.currentPeriodEnd,
                                  }}
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
            {data && (
              <Pagination
                page={data.pagination.page}
                limit={data.pagination.limit}
                total={data.pagination.total}
                totalPages={data.pagination.totalPages}
                onPageChange={(page) => setParams({ page: String(page) })}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

const PaymentsView = ({ params, setParams }) => {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, error, refetch } = useBillingPayments({ ...params, limit: 25 });

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-2 border-b border-zinc-200 p-3 sm:flex-row dark:border-zinc-800">
        <SearchBox value={params.search} onChange={(search) => setParams({ search })} placeholder="Search by business name or email" />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <select aria-label="Payment status" value={params.status || ""} onChange={(e) => setParams({ status: e.target.value })} className={`${selectClass} sm:w-40`}>
            <option value="">Any status</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select aria-label="Payment method" value={params.method || ""} onChange={(e) => setParams({ method: e.target.value })} className={`${selectClass} sm:w-44`}>
            <option value="">Any method</option>
            {Object.entries(METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="p-5">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      ) : !isLoading && data.data.length === 0 ? (
        <EmptyState title="No payments found">Payments appear here when businesses pay or one is recorded.</EmptyState>
      ) : (
        <>
          <div className={`overflow-x-auto transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}>
            <table className={tableClass}>
              <thead>
                <tr className={theadRowClass}>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Business</th>
                  <th className={thClass}>Method</th>
                  <th className={thClass}>Reference</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Period</th>
                  <th className={`${thClass} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody className={tbodyClass}>
                {isLoading
                  ? skeletonRows(7)
                  : data.data.map((p) => {
                      const open = () => p.business?._id && navigate(`/platform/businesses/${p.business._id}`);
                      return (
                        <tr key={p._id} className={rowLinkClass} tabIndex={0} onClick={open} onKeyDown={(e) => e.key === "Enter" && open()}>
                          <td className={`${tdClass} whitespace-nowrap text-zinc-600 tabular-nums dark:text-zinc-400`}>{formatDate(p.createdAt)}</td>
                          <td className={tdClass}>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{p.business?.businessName || "Deleted business"}</p>
                            {p.metadata?.source === "platform-console" && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">Recorded by {p.metadata.recordedBy}</p>
                            )}
                          </td>
                          <td className={`${tdClass} text-zinc-600 dark:text-zinc-400`}>{METHOD_LABELS[p.paymentMethod] || capitalise(p.paymentMethod)}</td>
                          <td className={`${tdClass} font-mono text-xs text-zinc-600 dark:text-zinc-400`}>{p.transactionRef || "—"}</td>
                          <td className={tdClass}>
                            <StatusDot tone={PAYMENT_TONES[p.status]}>{capitalise(p.status)}</StatusDot>
                          </td>
                          <td className={`${tdClass} whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400`}>
                            {p.billingPeriodStart ? `${formatDate(p.billingPeriodStart)} – ${formatDate(p.billingPeriodEnd)}` : "—"}
                          </td>
                          <td className={`${tdClass} text-right font-medium tabular-nums`}>{formatMoney(p.amount, p.currency)}</td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
          {data && (
            <Pagination
              page={data.pagination.page}
              limit={data.pagination.limit}
              total={data.pagination.total}
              totalPages={data.pagination.totalPages}
              onPageChange={(page) => setParams({ page: String(page) })}
            />
          )}
        </>
      )}
    </div>
  );
};

const PlatformBilling = () => {
  const [params, setParams] = useUrlFilters();
  const view = params.view === "payments" ? "payments" : "subscriptions";
  const { view: _view, ...filters } = params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Subscriptions and payments across every business. Record payments made outside the app, extend trials and change plans."
      />

      <div className="inline-flex rounded-md border border-zinc-200 bg-white p-0.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900" role="tablist">
        {VIEWS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={view === value}
            // Switching views starts from clean filters; they don't share any
            onClick={() => {
              const next = new URLSearchParams(value === "payments" ? { view: value } : {});
              setParams(Object.fromEntries([...Object.keys(params).map((k) => [k, ""]), ...next]));
            }}
            className={`rounded px-3 py-1.5 text-sm transition-colors ${
              view === value
                ? "bg-zinc-900 font-medium text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "payments" ? (
        <PaymentsView params={filters} setParams={setParams} />
      ) : (
        <SubscriptionsView params={filters} setParams={setParams} />
      )}
    </div>
  );
};

export default PlatformBilling;
