const ConsultationEmailLog = require("./sent-consultation-email.model");
const { sendConsultationEmail } = require("./utils/sent-consultation-email");
const Booking = require("./booking.model");
const sendEmail = async (req, res) => {
  const {
    consultationId,
    to,
    cc = [],
    bcc = [],
    subject,
    content,
    templateUsed,
    status,
    sentAt,
  } = req.body;

  if (!to || !subject || !content || !consultationId) {
    return res.status(400).json({
      success: false,
      message: "consultationId, to, subject and content are required",
    });
  }

  const info = await sendConsultationEmail({
    to,
    cc,
    bcc,
    subject,
    content,
    attachments: req.files || [],
  });
  await ConsultationEmailLog.create({
    to,
    cc,
    bcc,
    subject,
    content,
    templateUsed,
    status,
    sentAt: sentAt ? new Date(sentAt) : new Date(),
    sentBy: req.user?._id,
    messageId: info.messageId,
    deliveryStatus: "sent",
  });
  await Booking.updateOne(
    { _id: consultationId }, // or { referenceNumber: ref } if you prefer
    { $set: { responded: true } },
  );

  return res.status(200).json({
    success: true,
    message: "Email sent successfully",
    messageId: info.messageId,
  });
};

const getConsultationEmails = async (req, res) => {
  const {
    consultationId,
    page = 1,
    limit = 10,
    sortBy = "sentAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  // Filter by consultationId if provided
  if (consultationId) {
    query.consultationId = consultationId;
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute query
  const emails = await ConsultationEmailLog.find(query)
    .populate("sentBy", "name email") // Populate user details
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const totalEmails = await ConsultationEmailLog.countDocuments(query);

  return res.status(200).json({
    success: true,
    data: emails,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(totalEmails / limitNum),
      totalItems: totalEmails,
      itemsPerPage: limitNum,
    },
  });
};

const deleteConsultationEmail = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Email ID is required",
    });
  }

  // Find the email first to check if it exists
  const email = await ConsultationEmailLog.findById(id);

  if (!email) {
    return res.status(404).json({
      success: false,
      message: "Consultation email not found",
    });
  }

  // Optional: Add authorization check
  // if (email.sentBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  //   return res.status(403).json({
  //     success: false,
  //     message: "You don't have permission to delete this email"
  //   });
  // }

  // Delete the email
  await ConsultationEmailLog.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "Consultation email deleted successfully",
  });
};

const deleteMultipleConsultationEmails = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide an array of email IDs to delete",
    });
  }

  // Optional: Add authorization check
  // For admin only deletion
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({
  //     success: false,
  //     message: "Only admins can delete multiple emails"
  //   });
  // }

  // Delete all emails with the provided IDs
  const result = await ConsultationEmailLog.deleteMany({
    _id: { $in: ids },
  });

  return res.status(200).json({
    success: true,
    message: `${result.deletedCount} consultation email(s) deleted successfully`,
    deletedCount: result.deletedCount,
  });
};

module.exports = {
  sendEmail,
  getConsultationEmails,
  deleteConsultationEmail,
  deleteMultipleConsultationEmails,
};
