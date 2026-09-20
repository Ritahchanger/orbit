// repositories/user-permission.repository.js
// Only file (besides the model itself) allowed to query the UserPermission collection directly.
const UserPermission = require("../models/user-permission.model");

const findByUser = (userId) => {
  return UserPermission.find({ user: userId });
};

const findByUserPopulated = (userId) => {
  return UserPermission.find({ user: userId }).populate("store", "name code").lean();
};

const exists = (query) => {
  return UserPermission.exists(query);
};

const create = (data) => {
  return UserPermission.create(data);
};

const findOneAndDelete = (query) => {
  return UserPermission.findOneAndDelete(query);
};

module.exports = {
  findByUser,
  findByUserPopulated,
  exists,
  create,
  findOneAndDelete,
};
