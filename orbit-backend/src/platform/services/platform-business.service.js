// services/platform-business.service.js
// Every business on the platform: the list, one business in detail, and
// status changes. Every query goes through the owning module's public API.
const mongoose = require("mongoose");
const CustomError = require("../../errors/CustomError");
const {
  findBusinesses,
  findBusinessById,
  countBusinesses,
  updateBusinessStatus,
} = require("../../business");
const { findSubscriptions, findPayments } = require("../../subscription");
const { aggregateUsers, countUsers, findUsers } = require("../../user");
const { aggregateStores, countStores, findStores } = require("../../stores");
const { aggregateSales } = require("../../sales");
const { countProducts } = require("../../products");
const { lastMonths, startOfMonthsAgo } = require("./platform-overview.service");
const { containsRegex, nameFilter } = require("./search-helpers");

const DAY_MS = 24 * 60 * 60 * 1000;
const STATUSES = ["pending", "active", "suspended", "cancelled"];
const PLANS = ["starter", "professional", "enterprise"];
const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { businessName: 1 },
};
const MAX_LIMIT = 100;

const toObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw CustomError.badRequest("Invalid business ID");
  }
  return new mongoose.Types.ObjectId(String(id));
};

// [{ _id: businessId, ...fields }] -> Map(businessIdString -> row)
const byBusiness = (rows) => new Map(rows.map((r) => [String(r._id), r]));

const listBusinesses = async (filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), MAX_LIMIT);
  const sort = SORTS[filters.sort] || SORTS.newest;

  const query = { isDeleted: { $ne: true } };
  if (STATUSES.includes(filters.status)) query.status = filters.status;
  if (filters.verified === "true") query.isVerified = true;
  if (filters.verified === "false") query.isVerified = false;

  // Matches the business's own fields, its owner's name, or one of its
  // stores' names or codes
  const search = String(filters.search || "").trim().slice(0, 80);
  if (search) {
    const regex = containsRegex(search);
    const [owners, stores] = await Promise.all([
      findUsers({ ...nameFilter(search), role: { $ne: "platform_admin" } }).select("_id").limit(200).lean(),
      findStores({ $or: [{ name: regex }, { code: regex }] }).select("businessId").limit(200).lean(),
    ]);
    query.$or = [
      { businessName: regex },
      { businessEmail: regex },
      { registrationNumber: regex },
      { city: regex },
      { owner: { $in: owners.map((o) => o._id) } },
      { _id: { $in: stores.map((s) => s.businessId) } },
    ];
  }

  if (PLANS.includes(filters.plan)) {
    const subscriptions = await findSubscriptions({ planSlug: filters.plan })
      .select("_id")
      .lean();
    query.subscription = { $in: subscriptions.map((s) => s._id) };
  }

  const [businesses, total] = await Promise.all([
    findBusinesses(query)
      .select(
        "businessName businessEmail businessType city country status isVerified createdAt owner subscription",
      )
      .populate("owner", "firstName lastName email phoneNo lastLoginAt")
      .populate("subscription", "planSlug status billingCycle trialEndDate currentPeriodEnd")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    countBusinesses(query),
  ]);

  const ids = businesses.map((b) => b._id);
  const since30d = new Date(Date.now() - 30 * DAY_MS);

  const [storeRows, userRows, salesRows] = ids.length
    ? await Promise.all([
        aggregateStores([
          { $match: { businessId: { $in: ids } } },
          { $group: { _id: "$businessId", count: { $sum: 1 } } },
        ]),
        aggregateUsers([
          { $match: { businessId: { $in: ids } } },
          { $group: { _id: "$businessId", count: { $sum: 1 } } },
        ]),
        aggregateSales([
          { $match: { businessId: { $in: ids }, status: "completed" } },
          {
            $group: {
              _id: "$businessId",
              lastSaleAt: { $max: "$createdAt" },
              count30d: { $sum: { $cond: [{ $gte: ["$createdAt", since30d] }, 1, 0] } },
              total30d: {
                $sum: { $cond: [{ $gte: ["$createdAt", since30d] }, "$total", 0] },
              },
            },
          },
        ]),
      ])
    : [[], [], []];

  const stores = byBusiness(storeRows);
  const users = byBusiness(userRows);
  const sales = byBusiness(salesRows);

  return {
    businesses: businesses.map((b) => {
      const s = sales.get(String(b._id));
      return {
        ...b,
        stats: {
          stores: stores.get(String(b._id))?.count || 0,
          users: users.get(String(b._id))?.count || 0,
          lastSaleAt: s?.lastSaleAt || null,
          sales30d: { count: s?.count30d || 0, total: s?.total30d || 0 },
        },
      };
    }),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getBusiness = async (id) => {
  const businessId = toObjectId(id);

  const business = await findBusinessById(businessId)
    .select("-ecommerce -settings")
    .populate("owner", "firstName lastName email phoneNo lastLoginAt createdAt")
    .populate({
      path: "subscription",
      populate: {
        path: "plan",
        select: "name monthlyPrice annualPrice currency maxStores maxUsers",
      },
    })
    .lean();

  if (!business || business.isDeleted) {
    throw CustomError.notFound("Business not found");
  }

  const months = lastMonths(6);
  const since30d = new Date(Date.now() - 30 * DAY_MS);

  const [storeCount, userCount, productCount, stores, usersByRole, salesFacets, payments] =
    await Promise.all([
      countStores({ businessId }),
      countUsers({ businessId }),
      countProducts({ businessId }),
      findStores({ businessId })
        .select("name code status createdAt")
        .sort({ createdAt: 1 })
        .lean(),
      aggregateUsers([
        { $match: { businessId } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      aggregateSales([
        { $match: { businessId, status: "completed" } },
        {
          $facet: {
            allTime: [
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  total: { $sum: "$total" },
                  lastSaleAt: { $max: "$createdAt" },
                },
              },
            ],
            last30d: [
              { $match: { createdAt: { $gte: since30d } } },
              { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$total" } } },
            ],
            monthly: [
              { $match: { createdAt: { $gte: startOfMonthsAgo(5) } } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                  count: { $sum: 1 },
                  total: { $sum: "$total" },
                },
              },
            ],
          },
        },
      ]),
      findPayments({ business: businessId })
        .select("amount currency paymentMethod status description createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

  const { allTime, last30d, monthly } = salesFacets[0];
  const monthlyByKey = new Map(monthly.map((m) => [m._id, m]));

  return {
    business,
    stats: {
      stores: storeCount,
      users: userCount,
      products: productCount,
      usersByRole: Object.fromEntries(usersByRole.map((r) => [r._id, r.count])),
    },
    sales: {
      allTime: { count: allTime[0]?.count || 0, total: allTime[0]?.total || 0 },
      last30d: { count: last30d[0]?.count || 0, total: last30d[0]?.total || 0 },
      lastSaleAt: allTime[0]?.lastSaleAt || null,
      monthly: months.map((month) => ({
        month,
        count: monthlyByKey.get(month)?.count || 0,
        total: monthlyByKey.get(month)?.total || 0,
      })),
    },
    stores,
    payments,
  };
};

const changeStatus = async (id, status, reason = "") => {
  const businessId = toObjectId(id);
  if (!STATUSES.includes(status)) {
    throw CustomError.badRequest(`Status must be one of: ${STATUSES.join(", ")}`);
  }
  if (status === "suspended" && !String(reason).trim()) {
    throw CustomError.badRequest("A reason is required to suspend a business");
  }

  const existing = await findBusinessById(businessId).select("isDeleted").lean();
  if (!existing || existing.isDeleted) {
    throw CustomError.notFound("Business not found");
  }

  try {
    const business = await updateBusinessStatus(businessId, status, String(reason).trim());
    return {
      _id: business._id,
      status: business.status,
      isVerified: business.isVerified,
      isSuspended: business.isSuspended,
      suspensionReason: business.suspensionReason,
    };
  } catch (error) {
    if (error.message?.startsWith("Cannot transition")) {
      throw CustomError.badRequest(error.message);
    }
    throw error;
  }
};

module.exports = { listBusinesses, getBusiness, changeStatus };
