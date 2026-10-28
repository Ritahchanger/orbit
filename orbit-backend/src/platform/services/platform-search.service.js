// services/platform-search.service.js
// The console's quick search: businesses, stores and business owners, a few
// of each. Results carry only what's needed to recognise a match and open
// the business; owners are matched by name and shown as name + business,
// never with contact details, and staff and customers aren't searchable.
const CustomError = require("../../errors/CustomError");
const { findBusinesses } = require("../../business");
const { findStores } = require("../../stores");
const { findUsers } = require("../../user");
const { containsRegex, nameFilter } = require("./search-helpers");

const MIN_LENGTH = 2;
const MAX_LENGTH = 80;
const PER_GROUP = 5;
const NOT_DELETED = { isDeleted: { $ne: true } };

const searchBusinesses = (regex) =>
  findBusinesses({
    ...NOT_DELETED,
    $or: [{ businessName: regex }, { businessEmail: regex }, { registrationNumber: regex }, { city: regex }],
  })
    .select("businessName status city country")
    .sort({ businessName: 1 })
    .limit(PER_GROUP)
    .lean();

const searchStores = async (regex) => {
  // Over-fetch a little: stores of deleted businesses are dropped below
  const stores = await findStores({ $or: [{ name: regex }, { code: regex }] })
    .select("name code status businessId")
    .sort({ name: 1 })
    .limit(PER_GROUP * 2)
    .lean();
  if (!stores.length) return [];

  const businesses = await findBusinesses({
    ...NOT_DELETED,
    _id: { $in: [...new Set(stores.map((s) => String(s.businessId)))] },
  })
    .select("businessName")
    .lean();
  const names = new Map(businesses.map((b) => [String(b._id), b.businessName]));

  return stores
    .filter((s) => names.has(String(s.businessId)))
    .slice(0, PER_GROUP)
    .map((s) => ({
      _id: s._id,
      name: s.name,
      code: s.code,
      status: s.status,
      businessId: s.businessId,
      businessName: names.get(String(s.businessId)),
    }));
};

const searchOwners = async (query) => {
  const people = await findUsers({ ...nameFilter(query), role: { $ne: "platform_admin" } })
    .select("firstName lastName")
    .limit(50)
    .lean();
  if (!people.length) return [];

  // Only people who own a business are returned
  const owned = await findBusinesses({ ...NOT_DELETED, owner: { $in: people.map((p) => p._id) } })
    .select("businessName owner")
    .sort({ businessName: 1 })
    .limit(PER_GROUP)
    .lean();
  const byId = new Map(people.map((p) => [String(p._id), p]));

  return owned.map((b) => {
    const owner = byId.get(String(b.owner));
    return {
      _id: owner._id,
      name: `${owner.firstName} ${owner.lastName}`.trim(),
      businessId: b._id,
      businessName: b.businessName,
    };
  });
};

const search = async (rawQuery) => {
  const query = String(rawQuery || "").trim();
  if (query.length < MIN_LENGTH) {
    throw CustomError.badRequest(`Type at least ${MIN_LENGTH} characters to search`);
  }
  if (query.length > MAX_LENGTH) {
    throw CustomError.badRequest(`Search is limited to ${MAX_LENGTH} characters`);
  }

  const regex = containsRegex(query);
  const [businesses, stores, owners] = await Promise.all([
    searchBusinesses(regex),
    searchStores(regex),
    searchOwners(query),
  ]);

  return { query, businesses, stores, owners };
};

module.exports = { search };
