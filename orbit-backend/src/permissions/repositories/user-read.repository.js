// repositories/user-read.repository.js
// The ONLY file in the permissions module allowed to require the User model.
// Narrow, read-only wrapper around the small set of User queries role/permission
// business logic needs (user counts per role, business-ownership checks).
const User = require("../../user/user.model");

const countByRole = (roleName) => {
  return User.countDocuments({ role: roleName });
};

const findPaginatedByRole = (roleName, { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = {}) => {
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  return Promise.all([
    User.find({ role: roleName })
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments({ role: roleName }),
  ]);
};

const findById = (userId) => {
  return User.findById(userId);
};

const findByIdLean = (userId) => {
  return User.findById(userId).lean();
};

const findByIdAndBusiness = (userId, businessId) => {
  return User.findOne({ _id: userId, businessId });
};

module.exports = {
  countByRole,
  findPaginatedByRole,
  findById,
  findByIdLean,
  findByIdAndBusiness,
};
