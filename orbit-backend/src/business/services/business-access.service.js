// services/business-access.service.js
// Whether a business's users may use Orbit. Suspended and cancelled
// businesses are locked out; pending (new, not yet verified) businesses are
// not. Checked on every authenticated request, so results are cached briefly
// per process; a status change clears the entry in the process that made it,
// and other processes pick it up within CACHE_MS.
const Business = require("../models/business.model");

const CACHE_MS = 30 * 1000;
const BLOCKED_STATUSES = ["suspended", "cancelled"];

const cache = new Map(); // businessId -> { block, at }

const MESSAGES = {
  suspended: "This business has been suspended. Contact Orbit support.",
  cancelled: "This business account has been cancelled. Contact Orbit support.",
  missing: "This business no longer exists. Contact Orbit support.",
};

/**
 * Returns null when the business's users may continue, otherwise
 * { status, message } describing why they're blocked.
 */
const checkBusinessAccess = async (businessId) => {
  if (!businessId) return null;
  const key = String(businessId);

  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.block;

  const business = await Business.findById(businessId).select("status isDeleted").lean();

  let block = null;
  if (!business || business.isDeleted) {
    block = { status: "missing", message: MESSAGES.missing };
  } else if (BLOCKED_STATUSES.includes(business.status)) {
    block = { status: business.status, message: MESSAGES[business.status] };
  }

  cache.set(key, { block, at: Date.now() });
  return block;
};

const clearBusinessAccess = (businessId) => cache.delete(String(businessId));

module.exports = { checkBusinessAccess, clearBusinessAccess };
