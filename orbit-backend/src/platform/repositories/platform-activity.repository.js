// repositories/platform-activity.repository.js
const PlatformActivity = require("../models/platform-activity.model");

const create = (entry) => PlatformActivity.create(entry);

const find = (filter = {}) => PlatformActivity.find(filter);

const countDocuments = (filter = {}) => PlatformActivity.countDocuments(filter);

module.exports = { create, find, countDocuments };
