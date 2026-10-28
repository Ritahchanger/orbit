// routes/platform.routes.js
// The platform dashboard API, for Orbit's own staff. Mounted at
// /api/v1/platform; everything except login requires a platform session.
const express = require("express");
const router = express.Router();
const asyncWrapper = require("../../middlewares/asyncMiddleware");
const { platformAuth } = require("../middlewares/platform-auth.middleware");
const loginThrottle = require("../middlewares/login-throttle.middleware");
const authCtrl = require("../controllers/platform-auth.controller");
const platformCtrl = require("../controllers/platform.controller");

router.post("/auth/login", loginThrottle, asyncWrapper(authCtrl.login));
router.post("/auth/logout", asyncWrapper(authCtrl.logout));

router.use(platformAuth);

router.get("/auth/me", authCtrl.me);

router.get("/overview", asyncWrapper(platformCtrl.getOverview));

router.get("/search", asyncWrapper(platformCtrl.search));

router.get("/activity", asyncWrapper(platformCtrl.listActivity));

router.get("/businesses", asyncWrapper(platformCtrl.listBusinesses));
router.get("/businesses/:id", asyncWrapper(platformCtrl.getBusiness));
router.patch(
  "/businesses/:id/status",
  asyncWrapper(platformCtrl.changeBusinessStatus),
);

module.exports = router;
