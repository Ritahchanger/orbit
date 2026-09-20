// repositories/permission.repository.js
// Only file (besides the model itself) allowed to query the Permission collection directly.
const Permission = require("../models/permission.model");

const findByKeys = (keys) => {
  return Permission.find({ key: { $in: keys } });
};

const findAll = () => {
  return Permission.find({});
};

const findAllKeys = () => {
  return Permission.find({}).select("key");
};

module.exports = {
  findByKeys,
  findAll,
  findAllKeys,
};
