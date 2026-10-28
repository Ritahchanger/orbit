// controllers/platform.controller.js
const overviewService = require("../services/platform-overview.service");
const businessService = require("../services/platform-business.service");
const searchService = require("../services/platform-search.service");
const log = require("../../utils/log");

const getOverview = async (req, res) => {
  const data = await overviewService.getOverview();
  res.status(200).json({ success: true, data });
};

const listBusinesses = async (req, res) => {
  const { businesses, pagination } = await businessService.listBusinesses(req.query);
  res.status(200).json({ success: true, data: businesses, pagination });
};

const getBusiness = async (req, res) => {
  const data = await businessService.getBusiness(req.params.id);
  res.status(200).json({ success: true, data });
};

const changeBusinessStatus = async (req, res) => {
  const { status, reason } = req.body || {};
  const business = await businessService.changeStatus(req.params.id, status, reason);

  log.info(
    `Platform admin ${req.platformAdmin.email} set business ${business._id} to ${business.status}` +
      (reason ? ` (${reason})` : ""),
  );

  res.status(200).json({
    success: true,
    message: `Business is now ${business.status}`,
    data: business,
  });
};

const search = async (req, res) => {
  const data = await searchService.search(req.query.q);
  res.status(200).json({ success: true, data });
};

module.exports = { getOverview, listBusinesses, getBusiness, changeBusinessStatus, search };
