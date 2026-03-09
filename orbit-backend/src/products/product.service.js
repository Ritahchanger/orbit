const Product = require("./products.model");
const Store = require("../stores/store.model");
const StoreInventory = require("../store-inventory/store-inventory.model"); // Fixed import name
const { LocalStorage, UPLOADS_DIR } = require("../utils/localStorage");
const path = require("path");
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateGCSImageData,
} = require("./products.validator");
const fs = require("fs");
// Custom error classes
class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "ValidationError";
    this.status = 400;
    this.details = details;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
    this.status = 409;
  }
}

const productService = {
  /**
   * Create a new global product
   */
  createProduct: async (productData, files = []) => {
    // Validate product data
    const validation = validateCreateProduct(productData, files);

    if (!validation.isValid) {
      throw new ValidationError("Product validation failed", {
        product: validation.product.error?.details || null,
        files: validation.files.error || null,
      });
    }

    const validatedData = validation.product.value;
    let uploadedImages = [];

    try {
      // Generate SKU if not provided
      if (!validatedData.sku) {
        const prefix = validatedData.productType === "gaming" ? "GAM" : "AMP";
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        validatedData.sku = `${prefix}-${timestamp}-${random}`;
      } else {
        // Check if SKU already exists globally
        const existingProduct = await Product.findOne({
          sku: validatedData.sku,
        });
        if (existingProduct) {
          throw new ConflictError("SKU already exists");
        }
      }

      // Upload images to local storage if files provided
      if (files && files.length > 0) {
        uploadedImages = await Promise.all(
          files.map(async (file, index) => {
            // Generate filename using the SKU
            const fileName = LocalStorage.generateFileName(
              file.originalname,
              validatedData.sku,
              index,
            );

            // Upload to local storage
            await LocalStorage.uploadFromBuffer(
              file.buffer,
              fileName,
              file.mimetype,
            );

            const fileUrl = await LocalStorage.getFileUrl(fileName);

            return {
              displayUrl: fileUrl,
              gcsFileName: fileName, // Keep the field name as is for schema compatibility
              isPrimary: index === 0,
              originalName: file.originalname,
              size: file.size,
              contentType: file.mimetype,
            };
          }),
        );

        // Validate image data (keeping same validation)
        uploadedImages.forEach((img) => {
          const { error } = validateGCSImageData(img);
          if (error) {
            throw new ValidationError("Invalid image data", error.details);
          }
        });

        validatedData.images = uploadedImages;
      }

      // Set default values
      if (!validatedData.lastRestock) {
        validatedData.lastRestock = new Date();
      }

      // Set productType based on category if not provided
      if (!validatedData.productType) {
        const gamingCategories = [
          "gaming-pcs",
          "gaming-laptops",
          "consoles",
          "gaming-monitors",
          "gaming-headsets",
          "mechanical-keyboards",
          "gaming-mice",
          "gaming-chairs",
          "streaming-gear",
          "storage",
          "memory",
          "cables",
          "routers",
          "servers",
        ];
        validatedData.productType = gamingCategories.includes(
          validatedData.category,
        )
          ? "gaming"
          : "electrical";
      }

      // Create global product
      const product = new Product(validatedData);
      await product.save();

      return {
        success: true,
        message: "Product created successfully",
        data: product.toFrontendFormat(),
      };
    } catch (error) {
      // Cleanup uploaded images if product creation fails
      if (uploadedImages.length > 0) {
        await LocalStorage.deleteFiles(
          uploadedImages.map((img) => img.gcsFileName),
        ).catch(console.error);
      }
      throw error;
    }
  },

  updateProduct: async (productId, updateData, files = []) => {
    // Validate product ID
    const { error: idError } = validateProductId(productId);
    if (idError) {
      throw new ValidationError("Invalid product ID", idError.details);
    }

    // Validate update data
    const { error, value } = validateUpdateProduct(updateData);
    if (error) {
      throw new ValidationError("Update validation failed", error.details);
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check SKU uniqueness globally
    if (value.sku && value.sku !== product.sku) {
      const skuExists = await Product.findOne({
        sku: value.sku,
        _id: { $ne: productId },
      });
      if (skuExists) {
        throw new ConflictError("SKU already exists");
      }
    }

    // Store current state for rollback
    const originalImages = product.images.map((img) => ({ ...img.toObject() }));
    const originalSku = product.sku;

    let newUploadedImages = [];
    let imagesToDelete = [];
    let imagesMoved = false;
    let failedStorageDeletions = [];

    try {
      // PARSE incoming image data from frontend
      let incomingImages = [];
      if (value.images) {
        if (typeof value.images === "string") {
          try {
            incomingImages = JSON.parse(value.images);
          } catch (e) {
            console.warn("Failed to parse images JSON:", e);
            incomingImages = [];
          }
        } else if (Array.isArray(value.images)) {
          incomingImages = value.images;
        }
      }

      // CRITICAL FIX: Only process image deletions if images array is explicitly provided
      const isImageUpdateProvided =
        value.images !== undefined && value.images !== null;

      // Get current image filenames
      const currentImageFilenames = product.images.map(
        (img) => img.gcsFileName,
      );

      if (isImageUpdateProvided) {
        // Determine which images to keep from incoming data
        const imagesToKeep = incomingImages
          .filter(
            (img) =>
              img.gcsFileName &&
              currentImageFilenames.includes(img.gcsFileName),
          )
          .map((img) => img.gcsFileName);

        // Images to delete from DB = current - keep
        imagesToDelete = currentImageFilenames.filter(
          (filename) => !imagesToKeep.includes(filename),
        );

        // Update metadata for kept images
        if (incomingImages.length > 0) {
          const updatedImages = product.images.map((existingImg) => {
            const matchingIncoming = incomingImages.find(
              (img) => img.gcsFileName === existingImg.gcsFileName,
            );

            if (matchingIncoming) {
              return {
                ...existingImg.toObject(),
                isPrimary: matchingIncoming.isPrimary || false,
              };
            }
            return existingImg;
          });

          // Filter out images that are being deleted
          product.images = updatedImages.filter(
            (img) => !imagesToDelete.includes(img.gcsFileName),
          );
        } else if (incomingImages.length === 0) {
          // Explicitly setting images to empty array - delete all
          imagesToDelete = [...currentImageFilenames];
          product.images = [];
        }
      } else {
        // No image update provided - KEEP ALL EXISTING IMAGES
        console.log("No image update provided, keeping all existing images");
        imagesToDelete = [];
        // Keep existing images as-is
      }

      // Handle new file uploads
      if (files && files.length > 0) {
        newUploadedImages = await Promise.all(
          files.map(async (file, index) => {
            const fileName = LocalStorage.generateFileName(
              file.originalname,
              product.sku,
              Date.now() + index,
            );

            // Upload to local storage
            await LocalStorage.uploadFromBuffer(
              file.buffer,
              fileName,
              file.mimetype,
            );

            const fileUrl = await LocalStorage.getFileUrl(fileName);

            return {
              displayUrl: fileUrl,
              gcsFileName: fileName,
              isPrimary: product.images.length === 0 && index === 0,
            };
          }),
        );

        // Add new images to product
        product.images.push(...newUploadedImages);
      }

      // Delete removed images from storage (only if we explicitly determined images to delete)
      if (imagesToDelete.length > 0) {
        console.log(
          `Attempting to delete ${imagesToDelete.length} images from storage`,
        );

        // Try to delete each file individually and track failures
        for (const filename of imagesToDelete) {
          try {
            const result = await LocalStorage.deleteFile(filename);
            if (!result.success) {
              failedStorageDeletions.push({ filename, error: result.error });
              console.warn(
                `Failed to delete file from storage: ${filename}`,
                result.error,
              );
            } else {
              console.log(`Successfully deleted file: ${filename}`);
            }
          } catch (err) {
            failedStorageDeletions.push({ filename, error: err.message });
            console.warn(
              `Error deleting file from storage: ${filename}`,
              err.message,
            );
          }
        }

        // Log summary
        if (failedStorageDeletions.length > 0) {
          console.warn(
            `${failedStorageDeletions.length} files could not be deleted from storage, but will be removed from DB`,
          );
        }
      } else {
        console.log("No images to delete from storage");
      }

      // Handle SKU update (this will move images to new folder)
      if (value.sku && value.sku !== product.sku) {
        const updatedImages = await Promise.all(
          product.images.map(async (img) => {
            const oldFileName = img.gcsFileName;
            const newFileName = oldFileName.replace(
              `/products/${originalSku}/`,
              `/products/${value.sku}/`,
            );

            // Move file to new location
            const oldPath = path.join(UPLOADS_DIR, oldFileName);
            const newPath = path.join(UPLOADS_DIR, newFileName);

            try {
              // Check if source file exists
              try {
                await fs.access(oldPath);
              } catch (e) {
                // Source file doesn't exist, just update the path in DB
                console.warn(
                  `Source file not found, updating path only: ${oldFileName}`,
                );
                const newUrl = await LocalStorage.getFileUrl(newFileName);
                return {
                  ...img.toObject(),
                  displayUrl: newUrl,
                  gcsFileName: newFileName,
                };
              }

              // Ensure directory exists
              await LocalStorage.ensureDir(path.dirname(newPath));

              // Move file (rename)
              await fs.rename(oldPath, newPath);

              // Update URL
              const newUrl = await LocalStorage.getFileUrl(newFileName);

              return {
                ...img.toObject(),
                displayUrl: newUrl,
                gcsFileName: newFileName,
              };
            } catch (err) {
              console.error("Error moving file:", err);
              // If move fails, keep original
              return img.toObject();
            }
          }),
        );

        product.images = updatedImages;
        product.sku = value.sku;
        imagesMoved = true;
      }

      // Ensure only one primary image
      const primaryImages = product.images.filter((img) => img.isPrimary);
      if (primaryImages.length > 1) {
        let primarySet = false;
        product.images.forEach((img) => {
          if (!primarySet && img.isPrimary) {
            primarySet = true;
          } else {
            img.isPrimary = false;
          }
        });
      } else if (primaryImages.length === 0 && product.images.length > 0) {
        product.images[0].isPrimary = true;
      }

      // Update other fields (exclude images and sku as they're handled separately)
      Object.keys(value).forEach((key) => {
        if (key !== "images" && key !== "sku") {
          product[key] = value[key];
        }
      });

      // Save product (this will update the DB with the new images array)
      await product.save();

      // Prepare response message
      let message = "Product updated successfully";
      if (failedStorageDeletions.length > 0) {
        message += `, but ${failedStorageDeletions.length} image${failedStorageDeletions.length > 1 ? "s were" : " was"} not found in storage`;
      }

      return {
        success: true,
        message,
        data: product.toFrontendFormat(),
        warnings:
          failedStorageDeletions.length > 0
            ? {
                message:
                  "Some image files were missing from storage but removed from database",
                failedDeletions: failedStorageDeletions,
              }
            : undefined,
      };
    } catch (error) {
      // ROLLBACK: Clean up on failure

      // 1. Delete newly uploaded images
      if (newUploadedImages.length > 0) {
        await LocalStorage.deleteFiles(
          newUploadedImages.map((img) => img.gcsFileName),
        ).catch(console.error);
      }

      // 2. If SKU was changed and images were moved, move them back
      if (imagesMoved && value.sku && value.sku !== originalSku) {
        try {
          await Promise.all(
            product.images.map(async (img) => {
              const currentFileName = img.gcsFileName;
              const originalFileName = currentFileName.replace(
                `/products/${value.sku}/`,
                `/products/${originalSku}/`,
              );

              const currentPath = path.join(UPLOADS_DIR, currentFileName);
              const originalPath = path.join(UPLOADS_DIR, originalFileName);

              // Move back if files exist
              try {
                await fs.access(currentPath);
                await fs.rename(currentPath, originalPath);
              } catch (e) {
                // File might not exist, ignore
              }
            }),
          );
        } catch (moveError) {
          console.error("Error rolling back moved images:", moveError);
        }
      }

      throw error;
    }
  },

  deleteProduct: async (productId) => {
    // Validate product ID
    const { error } = validateProductId(productId);
    if (error) {
      throw new ValidationError("Invalid product ID", error.details);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Log the paths for debugging
    console.log("UPLOADS_DIR:", UPLOADS_DIR);
    const productFolderPath = path.join(UPLOADS_DIR, "products", product.sku);
    console.log("Product folder path:", productFolderPath);
    console.log("Attempting to delete folder:", productFolderPath);

    let folderDeleted = false;
    let folderError = null;
    let imageCount = product.images ? product.images.length : 0;

    // Use shell command to delete the folder (most reliable)
    const { exec } = require("child_process");
    const util = require("util");
    const execPromise = util.promisify(exec);

    try {
      // Try to delete the folder using shell command
      console.log(`📁 Attempting to delete folder via shell: ${product.sku}`);

      const { stdout, stderr } = await execPromise(
        `rm -rf "${productFolderPath}"`,
      );

      if (stderr) {
        console.warn(`Shell warning: ${stderr}`);
      }

      console.log(`✅ Successfully deleted folder via shell: ${product.sku}`);
      folderDeleted = true;
    } catch (error) {
      console.error(`❌ Shell command failed:`, error);
      folderDeleted = false;
      folderError = error.message;

      // Fallback: try Node.js fs operations
      console.log(`⚠️ Shell deletion failed, trying Node.js fs operations...`);

      try {
        // Try to delete individual images first
        if (product.images && product.images.length > 0) {
          for (const img of product.images) {
            try {
              await LocalStorage.deleteFile(img.gcsFileName);
              console.log(`✅ Deleted image: ${img.gcsFileName}`);
            } catch (imgError) {
              console.error(
                `❌ Failed to delete image: ${img.gcsFileName}`,
                imgError.message,
              );
            }
          }
        }

        // Then try to delete the folder if it's empty
        try {
          await fs.rmdir(productFolderPath);
          console.log(`✅ Deleted empty folder: ${product.sku}`);
          folderDeleted = true;
          folderError = null;
        } catch (rmdirError) {
          if (rmdirError.code === "ENOENT") {
            // Folder doesn't exist, that's fine
            folderDeleted = true;
            folderError = null;
          } else {
            console.error(`❌ Failed to delete folder: ${rmdirError.message}`);
          }
        }
      } catch (fallbackError) {
        console.error(`❌ All deletion methods failed:`, fallbackError);
      }
    }

    // Delete product from database
    await product.deleteOne();

    // Prepare response message
    let message = "Product deleted successfully";
    const details = [];

    if (folderDeleted) {
      details.push(`folder "${product.sku}" and all contents removed`);
    } else if (folderError) {
      details.push(
        `folder "${product.sku}" could not be removed (${folderError})`,
      );
      if (imageCount > 0) {
        details.push(`attempted to delete ${imageCount} images individually`);
      }
    }

    if (details.length > 0) {
      message += ` (${details.join(", ")})`;
    }

    // Check if folder still exists after deletion attempt
    try {
      await fs.access(productFolderPath);
      console.log(`⚠️ WARNING: Folder still exists: ${productFolderPath}`);
    } catch {
      console.log(`✅ Verified folder is gone: ${productFolderPath}`);
    }

    return {
      success: true,
      message,
      data: {
        productId,
        productName: product.name,
        productSku: product.sku,
        totalImages: imageCount,
        folderDeleted,
        folderError,
        folderPath: `products/${product.sku}`,
      },
    };
  },

  // Add this helper function INSIDE your productService object, before the methods
  deleteFolderRecursive: async (folderPath) => {
    const fs = require("fs").promises;
    const path = require("path");

    console.log(`Manually deleting folder: ${folderPath}`);

    // Read all files/folders in the directory
    const entries = await fs.readdir(folderPath, { withFileTypes: true });

    // Delete all contents first
    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively delete subdirectory
        await deleteFolderRecursive(fullPath);
      } else {
        // Delete file
        await fs.unlink(fullPath);
        console.log(`Deleted file: ${entry.name}`);
      }
    }

    // Delete the now-empty folder
    await fs.rmdir(folderPath);
    console.log(`Deleted empty folder: ${folderPath}`);
  },

  deleteProductImage: async (productId, gcsFileName) => {
    // Validate product ID
    const { error } = validateProductId(productId);
    if (error) {
      throw new ValidationError("Invalid product ID", error.details);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check if image exists in product
    const imageExists = product.images.some(
      (img) => img.gcsFileName === gcsFileName,
    );
    if (!imageExists) {
      throw new NotFoundError("Image not found in product");
    }

    // Delete from storage first
    let storageDeleteSuccess = false;
    try {
      const result = await LocalStorage.deleteFile(gcsFileName);
      storageDeleteSuccess = result.success;
    } catch (error) {
      console.error("Error deleting file from storage:", error);
    }

    // Remove image from product using schema method
    const result = await product.removeImage(gcsFileName);

    return {
      success: true,
      message: storageDeleteSuccess
        ? "Image deleted successfully"
        : "Image removed from product but file may still exist in storage",
      data: {
        ...result,
        storageDeleteSuccess,
      },
    };
  },
  cleanupOrphanedImages: async () => {
    try {
      // Get all products with their images
      const products = await Product.find({}, "images");

      // Collect all valid image filenames from database
      const validFilenames = new Set();
      products.forEach((product) => {
        product.images.forEach((img) => {
          if (img.gcsFileName) {
            validFilenames.add(img.gcsFileName);
          }
        });
      });

      // Scan uploads directory for orphaned files
      const uploadsPath = path.join(UPLOADS_DIR, "products");

      async function scanDir(dir) {
        let orphaned = [];
        try {
          const files = await fs.readdir(dir);

          for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
              const subDirOrphaned = await scanDir(fullPath);
              orphaned = [...orphaned, ...subDirOrphaned];
            } else {
              // Get relative path from uploads directory
              const relativePath = path.relative(UPLOADS_DIR, fullPath);

              // Check if this file exists in any product
              if (!validFilenames.has(relativePath)) {
                orphaned.push({
                  path: fullPath,
                  filename: relativePath,
                  size: stat.size,
                  modified: stat.mtime,
                });
              }
            }
          }
        } catch (error) {
          console.error("Error scanning directory:", error);
        }

        return orphaned;
      }

      const orphanedFiles = await scanDir(uploadsPath);

      return {
        success: true,
        count: orphanedFiles.length,
        orphanedFiles,
      };
    } catch (error) {
      console.error("Error in cleanupOrphanedImages:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  /**
   * Get global low stock products with detailed analysis
   */
  getGlobalLowStockProducts: async (options = {}) => {
    const {
      limit = 50,
      sortBy = "stock",
      sortOrder = "asc",
      minSeverity = "all", // 'critical', 'warning', 'low', 'all'
      category = null,
      productType = null,
    } = options;

    // Build base query for low stock products
    const query = {
      $expr: { $lte: ["$stock", "$minStock"] },
      status: { $in: ["active", "Low Stock", "In Stock"] },
    };

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (productType) {
      query.productType = productType;
    }

    // Get low stock products
    const lowStockProducts = await Product.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .limit(limit)
      .select(
        "name sku stock minStock price costPrice category brand totalSold status productType lastRestock",
      )
      .lean();

    if (lowStockProducts.length === 0) {
      return {
        success: true,
        message: "No low stock products found",
        summary: {
          totalAlerts: 0,
          critical: 0,
          warning: 0,
          low: 0,
          estimatedRestockValue: 0,
          totalPotentialLoss: 0,
        },
        products: [],
        timestamp: new Date().toISOString(),
      };
    }

    // Calculate severity levels
    const criticalProducts = lowStockProducts.filter((p) => p.stock === 0);
    const warningProducts = lowStockProducts.filter(
      (p) => p.stock > 0 && p.stock <= p.minStock * 0.3,
    );
    const lowProducts = lowStockProducts.filter(
      (p) => p.stock > p.minStock * 0.3 && p.stock <= p.minStock,
    );

    // Filter by severity if specified
    let filteredProducts = lowStockProducts;
    if (minSeverity !== "all") {
      const severityLevels = { critical: 1, warning: 2, low: 3 };
      const minLevel = severityLevels[minSeverity];

      filteredProducts = lowStockProducts.filter((p) => {
        const severity =
          p.stock === 0
            ? "critical"
            : p.stock <= p.minStock * 0.3
              ? "warning"
              : "low";
        return severityLevels[severity] <= minLevel;
      });
    }

    // Calculate summary statistics
    const summary = {
      totalAlerts: lowStockProducts.length,
      critical: criticalProducts.length,
      warning: warningProducts.length,
      low: lowProducts.length,
      estimatedRestockValue: lowStockProducts.reduce((sum, p) => {
        return sum + Math.max(0, p.minStock - p.stock) * p.costPrice;
      }, 0),
      totalPotentialLoss: lowStockProducts.reduce((sum, p) => {
        return (
          sum + Math.max(0, p.minStock - p.stock) * (p.price - p.costPrice)
        );
      }, 0),
      byCategory: {},
      byProductType: {},
    };

    // Group by category
    lowStockProducts.forEach((p) => {
      if (!summary.byCategory[p.category]) {
        summary.byCategory[p.category] = {
          count: 0,
          totalDeficit: 0,
          totalValue: 0,
        };
      }
      summary.byCategory[p.category].count++;
      summary.byCategory[p.category].totalDeficit += Math.max(
        0,
        p.minStock - p.stock,
      );
      summary.byCategory[p.category].totalValue += p.costPrice * p.stock;
    });

    // Group by product type
    lowStockProducts.forEach((p) => {
      if (!summary.byProductType[p.productType]) {
        summary.byProductType[p.productType] = {
          count: 0,
          totalDeficit: 0,
          totalValue: 0,
        };
      }
      summary.byProductType[p.productType].count++;
      summary.byProductType[p.productType].totalDeficit += Math.max(
        0,
        p.minStock - p.stock,
      );
      summary.byProductType[p.productType].totalValue += p.costPrice * p.stock;
    });

    // Helper function to get stock severity
    const getStockSeverity = (stock, minStock) => {
      if (stock === 0) return "critical";
      if (stock <= minStock * 0.3) return "warning";
      if (stock <= minStock) return "low";
      return "healthy";
    };

    // Helper function to get stock priority
    const getStockPriority = (product) => {
      if (product.stock === 0) return "critical";

      const deficitRatio =
        (product.minStock - product.stock) / product.minStock;
      const valueImpact =
        product.costPrice * Math.max(0, product.minStock - product.stock);

      if (deficitRatio > 0.7 || valueImpact > 5000) return "high";
      if (deficitRatio > 0.4 || valueImpact > 1000) return "medium";
      return "low";
    };

    // Helper function to get recommendation
    const getRecommendation = (product) => {
      if (product.stock === 0) {
        return {
          action: "urgent_restock",
          message: "Product is out of stock. Restock immediately.",
          quantity: product.minStock * 2,
          timeframe: "ASAP",
          priority: "critical",
        };
      }

      const deficit = Math.max(0, product.minStock - product.stock);
      if (deficit > 0) {
        return {
          action: "restock",
          message: `Stock is below minimum (${deficit} units needed).`,
          quantity: deficit,
          timeframe:
            deficit > product.minStock * 0.7 ? "Within 1 day" : "Within 3 days",
          priority: deficit > product.minStock * 0.7 ? "high" : "medium",
        };
      }

      return {
        action: "monitor",
        message: "Stock is adequate. Continue monitoring.",
        quantity: 0,
        timeframe: "Next week",
        priority: "low",
      };
    };

    // Enrich products with additional data
    const enrichedProducts = filteredProducts.map((p) => {
      const deficit = Math.max(0, p.minStock - p.stock);
      const severity = getStockSeverity(p.stock, p.minStock);
      const recommendation = getRecommendation(p);
      const priority = getStockPriority(p);

      // Calculate days to stockout based on sales velocity
      const dailySales = p.totalSold > 0 ? p.totalSold / 30 : 0.1; // Assume 30 days, or 0.1 if no sales
      const daysToStockout =
        dailySales > 0 ? Math.floor(p.stock / dailySales) : 999;

      return {
        ...p,
        deficit,
        severity,
        priority,
        recommendation,
        inventoryValue: p.costPrice * p.stock,
        lostSalesValue: deficit * p.price,
        daysToStockout,
        urgencyScore:
          daysToStockout < 7
            ? 100
            : daysToStockout < 14
              ? 75
              : daysToStockout < 30
                ? 50
                : 25,
        lastRestockDate: p.lastRestock
          ? new Date(p.lastRestock).toISOString().split("T")[0]
          : null,
        daysSinceRestock: p.lastRestock
          ? Math.floor(
              (new Date() - new Date(p.lastRestock)) / (1000 * 60 * 60 * 24),
            )
          : null,
      };
    });

    // Sort enriched products by priority and urgency
    enrichedProducts.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.urgencyScore > b.urgencyScore ? -1 : 1;
    });

    return {
      success: true,
      summary,
      products: enrichedProducts,
      timestamp: new Date().toISOString(),
      filtersApplied: options,
    };
  },

  /**
   * Get all products with pagination (global)
   */

  getProducts: async (filters = {}, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    // Build query - Exclude discontinued products by default, but DON'T filter by stock
    let query = {
      status: { $ne: "discontinued" },
      // REMOVED: stock: { $gt: 0 }  - This was filtering out zero stock products
    };

    // Apply filters
    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.productType) {
      query.productType = filters.productType;
    }

    if (filters.status) {
      // If status filter is provided
      if (filters.status === "Out of Stock") {
        query.stock = { $eq: 0 };
      } else if (filters.status === "In Stock") {
        query.stock = { $gt: 0 };
      } else {
        query.status = filters.status;
      }
    }

    // Add specific stock filter if requested
    if (filters.stockStatus) {
      if (filters.stockStatus === "in-stock") {
        query.stock = { $gt: 0 };
      } else if (filters.stockStatus === "out-of-stock") {
        query.stock = { $eq: 0 };
      } else if (filters.stockStatus === "low-stock") {
        query.stock = { $gt: 0, $lt: 10 }; // Example: low stock threshold
      }
    }

    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { sku: { $regex: filters.search, $options: "i" } },
        { brand: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
    }

    // Brand filter
    if (filters.brand) {
      query.brand = { $regex: filters.brand, $options: "i" };
    }

    // Sort configuration
    const sort = {};
    if (filters.sortBy) {
      sort[filters.sortBy] = filters.sortOrder === "asc" ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    // Convert to frontend format
    const productsFormatted = products.map((product) => {
      const productObj = new Product(product);
      return productObj.toFrontendFormat();
    });

    return {
      success: true,
      data: productsFormatted,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit,
      },
      filters: {
        applied: Object.keys(filters).filter(
          (key) => filters[key] !== undefined,
        ),
      },
      summary: {
        totalInStock: products.filter((p) => p.stock > 0).length,
        totalOutOfStock: products.filter((p) => p.stock === 0).length,
      },
    };
  },

  /**
   * Get single product by ID (global)
   */
  getProductById: async (productId) => {
    // Validate product ID
    const { error } = validateProductId(productId);
    if (error) {
      throw new ValidationError("Invalid product ID", error.details);
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check if product is accessible (not discontinued)
    if (product.status === "discontinued") {
      throw new NotFoundError("Product has been discontinued");
    }

    return {
      success: true,
      data: product.toFrontendFormat(),
    };
  },

  updateProductStock: async (productId, stockData) => {
    // Validate product ID
    const { error: idError } = validateProductId(productId);
    if (idError) {
      throw new ValidationError("Invalid product ID", idError.details);
    }

    // Validate stock data
    const { operation, stock } = stockData;

    if (!operation || !["increment", "decrement", "set"].includes(operation)) {
      throw new ValidationError(
        "Invalid operation. Must be 'increment', 'decrement', or 'set'",
        {
          operation: operation || "undefined",
        },
      );
    }

    if (typeof stock !== "number" || stock < 0) {
      throw new ValidationError("Stock must be a positive number", {
        stock: stock,
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    let newStock;
    const currentStock = product.stock || 0;

    // Calculate new stock based on operation
    switch (operation) {
      case "increment":
        newStock = currentStock + stock;
        break;
      case "decrement":
        if (stock > currentStock) {
          throw new ValidationError(
            "Cannot decrement more than current stock",
            { currentStock, requestedDecrement: stock },
          );
        }
        newStock = Math.max(0, currentStock - stock);
        break;
      case "set":
        newStock = stock;
        break;
      default:
        throw new ValidationError("Invalid operation", { operation });
    }

    // Update the product stock using the model's method
    await product.updateStock(newStock);

    // Update last restock date if we're incrementing or setting to a higher value
    if (
      (operation === "increment" && stock > 0) ||
      (operation === "set" && newStock > currentStock)
    ) {
      product.lastRestock = new Date();
    }

    await product.save();

    // Log the update for audit purposes
    console.log(
      `Stock update: Product ${product.sku} (${productId}) - ${operation} ${stock} units. New stock: ${newStock}`,
    );

    return {
      success: true,
      message: `Stock ${operation === "increment" ? "increased" : operation === "decrement" ? "decreased" : "set to"} ${stock} units successfully`,
      data: {
        productId,
        sku: product.sku,
        name: product.name,
        operation,
        amount: stock,
        previousStock: currentStock,
        newStock,
        updatedAt: new Date().toISOString(),
      },
    };
  },

  restockProduct: async (productId, quantity, buyingPrice) => {
    const { error } = validateProductId(productId);
    if (error) {
      throw new ValidationError("Invalid product ID", error.details);
    }

    if (!quantity || quantity <= 0) {
      throw new ValidationError("Quantity must be a positive number", {
        quantity,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Use the model's restock method
    await product.restock(quantity, buyingPrice);

    return {
      success: true,
      message: `Product restocked with ${quantity} units`,
      data: product.toFrontendFormat(),
    };
  },

  /**
   * Update product (global)
   */

  /**
   * Delete product (global)
   */

  /**
   * Get products by category (global)
   */
  getProductsByCategory: async (category, limit = 20) => {
    const products = await Product.find({
      category: category,
      status: { $in: ["active", "In Stock", "Low Stock"] },
    }).limit(limit);

    const productsFormatted = products.map((product) =>
      product.toFrontendFormat(),
    );

    return {
      success: true,
      data: productsFormatted,
      category: category,
      count: products.length,
    };
  },

  /**
   * Get featured products (global)
   */
  getFeaturedProducts: async (limit = 10) => {
    const products = await Product.find({
      isFeatured: true,
      status: { $in: ["active", "In Stock"] },
    }).limit(limit);

    const productsFormatted = products.map((product) =>
      product.toFrontendFormat(),
    );

    return {
      success: true,
      data: productsFormatted,
      featuredCount: products.length,
    };
  },

  /**
   * Get low stock products (global)
   */
  getLowStockProducts: async (limit = 20) => {
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$minStock"] },
      status: { $in: ["active", "Low Stock"] },
    }).limit(limit);

    const productsFormatted = products.map((product) =>
      product.toFrontendFormat(),
    );

    return {
      success: true,
      data: productsFormatted,
      lowStockCount: products.length,
    };
  },

  /**
   * Get product statistics (global)
   */
  getProductStats: async () => {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$costPrice", "$stock"] } },
          totalStock: { $sum: "$stock" },
          averagePrice: { $avg: "$price" },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ["$stock", "$minStock"] }, 1, 0],
            },
          },
          outOfStockCount: {
            $sum: {
              $cond: [{ $eq: ["$stock", 0] }, 1, 0],
            },
          },
          totalRevenue: { $sum: "$totalRevenue" },
          totalSold: { $sum: "$totalSold" },
          // Category counts
          byCategory: {
            $push: {
              category: "$category",
              count: 1,
              value: { $multiply: ["$costPrice", "$stock"] },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalValue: { $round: ["$totalValue", 2] },
          totalStock: 1,
          averagePrice: { $round: ["$averagePrice", 2] },
          lowStockCount: 1,
          outOfStockCount: 1,
          totalRevenue: 1,
          totalSold: 1,
          categoryStats: {
            $reduce: {
              input: "$byCategory",
              initialValue: [],
              in: {
                $cond: [
                  { $in: ["$$this.category", "$$value.category"] },
                  "$$value",
                  {
                    $concatArrays: [
                      "$$value",
                      [
                        {
                          category: "$$this.category",
                          count: { $sum: "$$this.count" },
                          value: { $sum: "$$this.value" },
                        },
                      ],
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    return {
      success: true,
      data: stats[0] || {
        totalProducts: 0,
        totalValue: 0,
        totalStock: 0,
        averagePrice: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalRevenue: 0,
        totalSold: 0,
        categoryStats: [],
      },
    };
  },

  /**
   * Add product to a store's inventory
   */
  addProductToStore: async (storeId, productId, inventoryData = {}) => {
    // Validate store exists
    const store = await Store.findById(storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check if product already exists in store inventory
    const existingInventory = await StoreInventory.findOne({
      store: storeId,
      product: productId,
    });

    if (existingInventory) {
      throw new ConflictError("Product already exists in store inventory");
    }

    // Create store inventory entry
    const storeInventory = new StoreInventory({
      store: storeId,
      product: productId,
      stock: inventoryData.stock || 0,
      minStock: inventoryData.minStock || product.minStock || 5,
      // Store can override price if needed, otherwise use product price
      storePrice: inventoryData.price || product.price,
      status: inventoryData.stock > 0 ? "In Stock" : "Out of Stock",
    });

    await storeInventory.save();

    // Populate references
    await storeInventory.populate("store", "name code");
    await storeInventory.populate("product", "name sku price");

    return {
      success: true,
      message: "Product added to store inventory successfully",
      data: storeInventory,
    };
  },

  /**
   * Get products in a specific store
   */
  getProductsByStore: async (storeId, filters = {}, page = 1, limit = 20) => {
    // Validate store exists
    const store = await Store.findById(storeId);
    if (!store) {
      throw new NotFoundError("Store not found");
    }

    const skip = (page - 1) * limit;

    // Build query for store inventory
    let inventoryQuery = { store: storeId };

    // Apply filters
    if (filters.status) {
      inventoryQuery.status = filters.status;
    }

    if (filters.lowStock === "true") {
      inventoryQuery.$expr = { $lte: ["$stock", "$minStock"] };
    }

    if (filters.search) {
      // We'll need to search in product collection and join
      const searchProducts = await Product.find({
        $or: [
          { name: { $regex: filters.search, $options: "i" } },
          { sku: { $regex: filters.search, $options: "i" } },
          { brand: { $regex: filters.search, $options: "i" } },
        ],
      }).select("_id");

      inventoryQuery.product = { $in: searchProducts.map((p) => p._id) };
    }

    // Execute query with population
    const [inventoryItems, total] = await Promise.all([
      StoreInventory.find(inventoryQuery)
        .populate({
          path: "product",
          select: "name sku price images brand category",
          match: filters.category ? { category: filters.category } : {},
        })
        .populate("store", "name code")
        .skip(skip)
        .limit(limit)
        .lean(),
      StoreInventory.countDocuments(inventoryQuery),
    ]);

    // Filter out items where product was not found (due to category filter)
    const validItems = inventoryItems.filter((item) => item.product);

    const formattedItems = validItems.map((item) => {
      const product = new Product(item.product);
      return {
        ...item,
        product: product.toFrontendFormat(),
        store: item.store,
        // Include store-specific data
        storeStock: item.stock,
        storeStatus: item.status,
        storeSold: item.storeSold || 0,
        storeRevenue: item.storeRevenue || 0,
      };
    });

    return {
      success: true,
      data: formattedItems,
      store: {
        id: store._id,
        name: store.name,
        code: store.code,
        totalProductsInStore: total,
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit,
      },
    };
  },
};

module.exports = productService;
