// repositories/role.repository.js
// Only file (besides the model itself) allowed to query the Role collection directly.
const Role = require("../models/role.model");

const findAll = (query = {}, sort = {}) => {
  return Role.find(query).sort(sort).lean();
};

const findById = (roleId) => {
  return Role.findById(roleId).lean();
};

// Non-lean, live document — for flows that mutate fields and call .save()
const findByIdForUpdate = (roleId) => {
  return Role.findById(roleId);
};

const findByName = (name) => {
  return Role.findOne({ name: name.toLowerCase ? name.toLowerCase() : name }).lean();
};

const findByNameRaw = (name) => {
  // No lowercasing — mirrors the exact query external callers (permissionValidator,
  // normal-auth.service) already performed before this refactor.
  return Role.findOne({ name }).lean();
};

const findByNameExcludingId = (name, excludeId) => {
  return Role.findOne({ name: name.toLowerCase(), _id: { $ne: excludeId } });
};

const findOneByName = (name) => {
  // Non-lean — used where callers need a live document (e.g. createRole duplicate check)
  return Role.findOne({ name: name.toLowerCase() });
};

const create = (data) => {
  return new Role(data).save();
};

const save = (doc) => {
  return doc.save();
};

const deleteOne = (doc) => {
  return doc.deleteOne();
};

const findAssignable = (level) => {
  return Role.find({ level: { $lte: level }, isSystemRole: false })
    .sort({ level: -1 })
    .lean();
};

const countAll = () => {
  return Role.countDocuments();
};

const deleteAll = () => {
  return Role.deleteMany({});
};

const insertMany = (docs) => {
  return Role.insertMany(docs);
};

const getDefaultRoles = () => {
  return Role.getDefaultRoles();
};

module.exports = {
  findAll,
  findById,
  findByIdForUpdate,
  findByName,
  findByNameRaw,
  findByNameExcludingId,
  findOneByName,
  create,
  save,
  deleteOne,
  findAssignable,
  countAll,
  deleteAll,
  insertMany,
  getDefaultRoles,
};
