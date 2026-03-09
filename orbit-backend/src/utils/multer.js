// utils/multer.js
const multer = require("multer");
// Use memory storage instead of disk storage
const storage = multer.memoryStorage(); // Files will be stored in memory as Buffer

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images and documents
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype === "application/msword"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage: storage, // Memory storage
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

module.exports = upload;
