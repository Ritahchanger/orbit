const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

// Path to uploads folder at project root (outside backend)
const UPLOADS_DIR = path.join(__dirname, "../../../uploads");
const BASE_URL = process.env.BACKEND_URL;

class LocalStorage {
  /**
   * Ensure upload directory exists
   */
  static async ensureDir(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Upload file from buffer to local storage
   */
  static async uploadFromBuffer(buffer, fileName, mimetype) {
    const fullPath = path.join(UPLOADS_DIR, fileName);
    const dirPath = path.dirname(fullPath);

    // Ensure directory exists
    await this.ensureDir(dirPath);

    // Write file
    await fs.writeFile(fullPath, buffer);

    // Generate URL for accessing the file
    const fileUrl = `${BASE_URL}/uploads/${fileName}`;

    return {
      success: true,
      fileUrl,
      filePath: fullPath,
      fileName,
      mimetype,
      size: buffer.length,
    };
  }

  /**
   * Delete a folder and its contents
   */
  static async deleteFolder(folderPath) {
    try {
      const fullPath = path.join(UPLOADS_DIR, folderPath);

      // Check if folder exists
      try {
        await fs.access(fullPath);
      } catch {
        // Folder doesn't exist, consider it success
        return { success: true, notFound: true };
      }

      // Read directory
      const files = await fs.readdir(fullPath);

      if (files.length > 0) {
        // Delete all files in the folder
        for (const file of files) {
          const filePath = path.join(fullPath, file);
          await fs.unlink(filePath);
        }
      }

      // Delete the empty folder
      await fs.rmdir(fullPath);

      return { success: true };
    } catch (error) {
      console.error("Error deleting folder:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete file from local storage
   */
  static async deleteFile(fileName) {
    try {
      const fullPath = path.join(UPLOADS_DIR, fileName);
      await fs.unlink(fullPath);
      return { success: true };
    } catch (error) {
      console.error("Error deleting file:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get file URL
   */
  static async getFileUrl(fileName) {
    return `${BASE_URL}/uploads/${fileName}`;
  }

  /**
   * Generate unique filename
   */
  static generateFileName(originalName, sku, index) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString("hex");
    const extension = path.extname(originalName);
    const baseName = path
      .basename(originalName, extension)
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    return `products/${sku}/${timestamp}-${random}-${baseName}${extension}`;
  }

  /**
   * Delete multiple files
   */
  static async deleteFiles(fileNames) {
    const results = await Promise.allSettled(
      fileNames.map((fileName) => this.deleteFile(fileName)),
    );

    return {
      success: true,
      deleted: results.filter(
        (r) => r.status === "fulfilled" && r.value.success,
      ).length,
      failed: results.filter((r) => r.status === "rejected" || !r.value.success)
        .length,
    };
  }
}

module.exports = { LocalStorage, UPLOADS_DIR };
