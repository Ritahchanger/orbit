// logs/middleware/record-admin-log.js
const Log = require("../models/logs.model");

const recordAdminLog = (action = "generic") => {
  return (req, res, next) => {
    const startTime = Date.now();

    // Only record for admins
    const isAdmin =
      req.user?.role === "admin" || "superadmin" || "manager" || "cashier";

    if (!isAdmin) return next();

    // Wrap res.send/res.json to record logs
    const originalSend = res.send.bind(res);

    res.send = async function (body) {
      try {
        const responseTime = Date.now() - startTime;

        await Log.logHttp(req, res, responseTime, {
          tags: ["admin-action"],
          metadata: { action },
          source: "admin-api",
        });
      } catch (err) {
        console.error("Failed to record admin log:", err);
      }

      return originalSend(body);
    };

    next();
  };
};

module.exports = recordAdminLog;
