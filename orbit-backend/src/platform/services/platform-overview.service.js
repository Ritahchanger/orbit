// services/platform-overview.service.js
// Platform-wide numbers for the overview page. Read-only; every query goes
// through the owning module's public API.
const { aggregateBusinesses, countBusinesses, findBusinesses } = require("../../business");
const {
  aggregateSubscriptions,
  findSubscriptions,
  aggregatePayments,
} = require("../../subscription");
const { countUsers } = require("../../user");
const { countStores } = require("../../stores");
const { aggregateSales } = require("../../sales");

const DAY_MS = 24 * 60 * 60 * 1000;
const NOT_DELETED = { isDeleted: { $ne: true } };

const BUSINESS_STATUSES = ["pending", "active", "suspended", "cancelled"];
const SUBSCRIPTION_STATUSES = ["trialing", "active", "past_due", "cancelled", "expired"];

// [{ _id: key, count }] -> { key: count } with every expected key present
const toCounts = (rows, keys) => {
  const counts = Object.fromEntries(keys.map((k) => [k, 0]));
  rows.forEach((r) => {
    if (r._id != null) counts[r._id] = r.count;
  });
  return counts;
};

const monthKey = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

// The last `months` calendar months (UTC), oldest first, including this one
const lastMonths = (months) => {
  const now = new Date();
  return Array.from({ length: months }, (_, i) =>
    monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1 - i), 1))),
  );
};

const startOfMonthsAgo = (monthsAgo) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
};

const getOverview = async () => {
  const now = new Date();
  const since30d = new Date(now.getTime() - 30 * DAY_MS);
  const in7d = new Date(now.getTime() + 7 * DAY_MS);
  const months = lastMonths(12);

  const [
    businessesByStatus,
    totalBusinesses,
    verifiedBusinesses,
    signupRows,
    subscriptionsByStatus,
    subscriptionsByPlan,
    recurringRevenue,
    payments30d,
    trialsEndingSoon,
    totalUsers,
    totalStores,
    sales30d,
    recentBusinesses,
  ] = await Promise.all([
    aggregateBusinesses([
      { $match: NOT_DELETED },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    countBusinesses(NOT_DELETED),
    countBusinesses({ ...NOT_DELETED, isVerified: true }),
    aggregateBusinesses([
      { $match: { ...NOT_DELETED, createdAt: { $gte: startOfMonthsAgo(11) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    aggregateSubscriptions([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    aggregateSubscriptions([
      { $match: { status: { $in: ["trialing", "active"] } } },
      { $group: { _id: "$planSlug", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    // Monthly recurring revenue from paying subscriptions; annual plans
    // count as a twelfth of their price. Grouped by currency, never summed
    // across currencies.
    aggregateSubscriptions([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$currency",
          amount: {
            $sum: {
              $cond: [
                { $eq: ["$billingCycle", "annual"] },
                { $divide: ["$pricePaid", 12] },
                "$pricePaid",
              ],
            },
          },
          subscriptions: { $sum: 1 },
        },
      },
    ]),
    aggregatePayments([
      { $match: { status: "successful", createdAt: { $gte: since30d } } },
      { $group: { _id: "$currency", amount: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    findSubscriptions({ status: "trialing", trialEndDate: { $gte: now, $lte: in7d } })
      .populate("business", "businessName businessEmail")
      .select("business planSlug trialEndDate")
      .sort({ trialEndDate: 1 })
      .limit(10)
      .lean(),
    countUsers({ role: { $ne: "platform_admin" } }),
    countStores({}),
    aggregateSales([
      { $match: { status: "completed", createdAt: { $gte: since30d } } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$total" } } },
    ]),
    findBusinesses(NOT_DELETED)
      .select("businessName businessEmail city country status isVerified createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const signupCounts = toCounts(signupRows, months);
  const thisMonth = months[months.length - 1];
  const lastMonth = months[months.length - 2];

  return {
    businesses: {
      total: totalBusinesses,
      verified: verifiedBusinesses,
      byStatus: toCounts(businessesByStatus, BUSINESS_STATUSES),
      newThisMonth: signupCounts[thisMonth],
      newLastMonth: signupCounts[lastMonth],
    },
    signups: months.map((month) => ({ month, count: signupCounts[month] })),
    subscriptions: {
      byStatus: toCounts(subscriptionsByStatus, SUBSCRIPTION_STATUSES),
      byPlan: subscriptionsByPlan.map((r) => ({ plan: r._id, count: r.count })),
      monthlyRecurringRevenue: recurringRevenue.map((r) => ({
        currency: r._id,
        amount: Math.round(r.amount),
        subscriptions: r.subscriptions,
      })),
      payments30d: payments30d.map((r) => ({
        currency: r._id,
        amount: r.amount,
        count: r.count,
      })),
      trialsEndingSoon: trialsEndingSoon
        .filter((s) => s.business)
        .map((s) => ({
          businessId: s.business._id,
          businessName: s.business.businessName,
          businessEmail: s.business.businessEmail,
          plan: s.planSlug,
          trialEndDate: s.trialEndDate,
        })),
    },
    activity: {
      users: totalUsers,
      stores: totalStores,
      sales30d: { count: sales30d[0]?.count || 0, total: sales30d[0]?.total || 0 },
    },
    recentBusinesses,
  };
};

module.exports = { getOverview, lastMonths, startOfMonthsAgo };
