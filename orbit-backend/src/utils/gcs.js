// utils/gcs.js
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

// ✅ Better environment variable handling with validation
const BUCKET_NAME = process.env.GCS_BUCKET;

const KEYFILE_PATH = path.join(__dirname, "../../gcp-key.json");

// Validate required configuration
if (!BUCKET_NAME) {
  throw new Error("GCS_BUCKET environment variable is required");
}

if (!fs.existsSync(KEYFILE_PATH)) {
  throw new Error(`GCP key file not found at: ${KEYFILE_PATH}`);
}

// ✅ Initialize GCS client with better error handling
let storage;
let bucket;

try {
  storage = new Storage({
    keyFilename: KEYFILE_PATH,
  });
  bucket = storage.bucket(BUCKET_NAME);

  // Test bucket accessibility
  bucket.exists().then(([exists]) => {
    if (!exists) {
      console.error(
        `❌ Bucket "${BUCKET_NAME}" does not exist or is not accessible`
      );
    }
  });
} catch (err) {
  console.error("❌ GCS Initialization Error:", err);
  throw new Error("Failed to initialize Google Cloud Storage");
}

module.exports = {
  /**
   * ✅ Upload file from memory buffer directly to Google Cloud Storage
   * @param {Buffer} fileBuffer - File buffer from Multer memory storage
   * @param {string} destFileName - Destination filename in bucket
   * @param {string} mimetype - File MIME type
   */
  uploadFromBuffer: async (fileBuffer, destFileName, mimetype) => {
    try {
      console.log(`📤 Uploading buffer to GCS: ${destFileName}`);

      const file = bucket.file(destFileName);

      await file.save(fileBuffer, {
        metadata: {
          contentType: mimetype,
          cacheControl: "no-cache",
        },
        resumable: false,
      });

      console.log(`✅ File uploaded to GCS: ${destFileName}`);

      return `gs://${BUCKET_NAME}/${destFileName}`;
    } catch (err) {
      console.error("❌ GCS Upload From Buffer Error:", err);
      throw new Error(`Failed to upload file to GCS: ${err.message}`);
    }
  },

  /**
   * ✅ Upload file from local path to Google Cloud Storage (keep for backward compatibility)
   * @param {string} localPath - Local file path (Multer upload)
   * @param {string} destFileName - Destination filename in bucket
   */
  uploadToGCS: async (localPath, destFileName) => {
    try {
      if (!fs.existsSync(localPath)) {
        throw new Error(`Local file not found: ${localPath}`);
      }

      await bucket.upload(localPath, {
        destination: destFileName,
        resumable: false,
        public: false,
        metadata: {
          cacheControl: "no-cache",
        },
      });

      try {
        fs.unlinkSync(localPath);
      } catch (unlinkErr) {
        console.warn(
          `⚠️ Could not delete local file: ${localPath}`,
          unlinkErr.message
        );
      }

      return `gs://${BUCKET_NAME}/${destFileName}`;
    } catch (err) {
      console.error("❌ GCS Upload Error:", err);

      try {
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      } catch {}

      throw new Error(`Failed to upload file to GCS: ${err.message}`);
    }
  },

  /**
   * ✅ Generate signed private URL
   * - Valid for 7 days by default
   * @param {string} fileName
   */
  getSignedUrl: async (fileName) => {
    try {
      const file = bucket.file(fileName);
      // Check if file exists first
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error(`File not found in GCS: ${fileName}`);
      }

      const [url] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return url;
    } catch (err) {
      console.error("❌ GCS Signed URL Error:", err);
      throw new Error(`Failed to generate signed URL: ${err.message}`);
    }
  },

  /**
   * ✅ Delete file from GCS
   * @param {string} fileName
   */
  deleteFromGCS: async (fileName) => {
    try {
      await bucket.file(fileName).delete();
      return true;
    } catch (err) {
      console.error("❌ GCS Delete Error:", err);
      throw new Error(`Failed to delete file from GCS: ${err.message}`);
    }
  },

  /**
   * ✅ Check if file exists in GCS
   * @param {string} fileName
   */
  fileExists: async (fileName) => {
    try {
      const [exists] = await bucket.file(fileName).exists();
      return exists;
    } catch (err) {
      console.error("❌ GCS File Exists Check Error:", err);
      return false;
    }
  },
};
