// src/user/index.js
// Public API of the user module. Other modules should require THIS file only
// — never reach into user/models or user/repositories directly.
//
// The finders return Mongoose queries (documents, not lean objects, unless the
// caller adds .lean()), so callers chain .select("+password"), .populate(),
// .session() etc. exactly as they did on the model.
const userRepository = require("./repositories/user.repository");

const findUserById = (id) => userRepository.findById(id);

const findUser = (filter) => userRepository.findOne(filter);

const findUsers = (filter = {}) => userRepository.find(filter);

const countUsers = (filter = {}) => userRepository.countDocuments(filter);

/** Read-only analytics (store user stats). */
const aggregateUsers = (pipeline) => userRepository.aggregate(pipeline);

/** Same arguments as Model.create, e.g. (doc) or ([doc], { session }). */
const createUser = (...args) => userRepository.create(...args);

const deleteUser = (filter) => userRepository.deleteOne(filter);

/** Stamps lastLoginAt; called on every successful login. */
const recordUserLogin = (id) =>
  userRepository.updateOne({ _id: id }, { $set: { lastLoginAt: new Date() } });

module.exports = {
  findUserById,
  findUser,
  findUsers,
  countUsers,
  aggregateUsers,
  createUser,
  deleteUser,
  recordUserLogin,
};
