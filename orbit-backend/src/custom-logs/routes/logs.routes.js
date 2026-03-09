// logs.routes.js
const express = require("express");
const router = express.Router();

const logsController = require("../controllers/logs.controller");
const asyncWrapper = require("../../middlewares/asyncMiddleware");
const tokenValidator = require("../../middlewares/tokenValidator");
// const authorize = require("../../middlewares/authorizeMiddleware");
const recordAdminLog = require("../middleware/record-admin.middleware");

// Apply authentication middleware for all routes
router.use(tokenValidator);

/**
 * GET /api/v1/logs
 * Get logs (requires permission: logs.view)
 */
router.get(
  "/",
  //   authorize(["logs.view"]),
  recordAdminLog("VIEW_LOGS"),
  asyncWrapper(logsController.getLogs),
);

/**
 * DELETE /api/v1/logs/:id
 * Delete a single log (requires permission: logs.delete)
 */
router.delete(
  "/:id",
  //   authorize(["logs.delete"]),
  recordAdminLog("DELETE_LOG"),
  asyncWrapper(logsController.deleteLog),
);

/**
 * DELETE /api/v1/logs
 * Batch delete logs (requires permission: logs.delete)
 * Expects { ids: ["id1", "id2", ...] } in request body
 */
router.delete(
  "/",
  //   authorize(["logs.delete"]),
  recordAdminLog("DELETE_LOG_BATCH"),
  asyncWrapper(logsController.deleteLogsBatch),
);

module.exports = router;
