// logs.controller.js
const logsService = require("../services/logs.service");
/**
 * GET /api/v1/logs
 */
const getLogs = async (req, res) => {
  const result = await logsService.getLogs(req.query);
  res.json(result);
};

/**
 * DELETE /api/v1/logs/:id
 */
const deleteLog = async (req, res, next) => {
  const deleted = await logsService.deleteLog(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Log not found" });
  }
  res.json({ message: "Log deleted successfully" });
};

/**
 * DELETE /api/v1/logs (batch)
 */
const deleteLogsBatch = async (req, res, next) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ message: "Invalid log IDs" });
  }
  const result = await logsService.deleteLogsBatch(ids);
  res.json({
    message: "Logs deleted successfully",
    deletedCount: result.deletedCount,
  });
};

module.exports = {
  getLogs,
  deleteLog,
  deleteLogsBatch,
};
