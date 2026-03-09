const express = require("express");
const multer = require("multer");
const SendEmailController = require("./sent-consultation-email.controller");
const tokenValidator = require("../middlewares/tokenValidator");
const asyncHandler = require("../middlewares/asyncMiddleware");
const router = express.Router();

const upload = require("../utils/multer");

router.use(tokenValidator);

// POST /api/consultations/send-email
router.post(
  "/send-email",
  upload.array("attachments"),
  asyncHandler(SendEmailController.sendEmail),
);

router.get("/emails", asyncHandler(SendEmailController.getConsultationEmails));

router.delete(
  "/email/:id",
  asyncHandler(SendEmailController.deleteConsultationEmail),
);

// Delete multiple emails
router.delete(
  "/emails",
  asyncHandler(SendEmailController.deleteMultipleConsultationEmails),
);

module.exports = router;
