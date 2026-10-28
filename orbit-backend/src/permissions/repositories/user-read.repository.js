// repositories/user-read.repository.js
// Narrow, read-only wrapper around the small set of User queries role/permission
// business logic needs (user counts per role, business-ownership checks).
// Goes through the user module's public API.
const {
  countUsers,
  findUser,
  findUserById,
  findUsers,
} = require("../../user");

const countByRole = (roleName) => {
  return countUsers({ role: roleName });
};

const findPaginatedByRole = (roleName, { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = {}) => {
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  return Promise.all([
    findUsers({ role: roleName })
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    countUsers({ role: roleName }),
  ]);
};

const findById = (userId) => {
  return findUserById(userId);
};

const findByIdLean = (userId) => {
  return findUserById(userId).lean();
};

const findByIdAndBusiness = (userId, businessId) => {
  return findUser({ _id: userId, businessId });
};

module.exports = {
  countByRole,
  findPaginatedByRole,
  findById,
  findByIdLean,
  findByIdAndBusiness,
};
