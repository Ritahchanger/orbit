const Joi = require("joi");

const productValidationSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(200).messages({
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 1 character long",
    "string.max": "Product name cannot exceed 200 characters",
    "any.required": "Product name is required",
  }),

  sku: Joi.string()
    .optional()
    .trim()
    .uppercase()
    .pattern(/^(AMP|GAM)-\d{6}-[A-Z]{3}$/) // Allow letters only in suffix
    .messages({
      "string.pattern.base":
        "SKU must be in format AMP/GAM-XXXXXX-XXX where X are digits and last 3 are letters",
    }),

  category: Joi.string()
    .required()
    .valid(
      "gaming-pcs",
      "gaming-laptops",
      "consoles",
      "gaming-monitors",
      "gaming-headsets",
      "mechanical-keyboards",
      "gaming-mice",
      "games",
      "gaming-chairs",
      "streaming-gear",
      "storage",
      "memory",
      "cables",
      "routers",
      "servers",
      "Wiring & Cables",
      "Switches & Sockets",
      "Lighting Solutions",
      "Ventilation Systems",
      "gaming-speakers",
      "cameras",
      "Energy Management",
      "Security Systems",
      "Automation",
      "Solar Products",
    )
    .messages({
      "any.only": "Invalid category selected",
      "any.required": "Category is required",
    }),

  price: Joi.number().required().min(0).precision(2).messages({
    "number.base": "Price must be a number",
    "number.min": "Price cannot be negative",
    "any.required": "Price is required",
  }),

  costPrice: Joi.number().optional().min(0).precision(2).default(0).messages({
    "number.base": "Cost price must be a number",
    "number.min": "Cost price cannot be negative",
  }),

  stock: Joi.number().required().integer().min(0).messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be a whole number",
    "number.min": "Stock cannot be negative",
    "any.required": "Stock quantity is required",
  }),

  minStock: Joi.number().optional().integer().min(0).default(5).messages({
    "number.base": "Minimum stock must be a number",
    "number.integer": "Minimum stock must be a whole number",
    "number.min": "Minimum stock cannot be negative",
  }),

  description: Joi.string().required().trim().min(1).max(2000).messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 1 character long",
    "string.max": "Description cannot exceed 2000 characters",
    "any.required": "Description is required",
  }),

  features: Joi.array()
    .items(
      Joi.string().trim().min(1).max(500).messages({
        "string.empty": "Feature cannot be empty",
        "string.min": "Feature must be at least 1 character long",
        "string.max": "Feature cannot exceed 500 characters",
      }),
    )
    .optional()
    .default([])
    .messages({
      "array.includes": "Each feature must be a valid string",
    }),

  specifications: Joi.array()
    .items(
      Joi.string().trim().min(1).max(500).messages({
        "string.empty": "Specification cannot be empty",
        "string.min": "Specification must be at least 1 character long",
        "string.max": "Specification cannot exceed 500 characters",
      }),
    )
    .optional()
    .default([])
    .messages({
      "array.includes": "Each specification must be a valid string",
    }),

  weight: Joi.string()
    .optional()
    .trim()
    .max(50)
    .allow("")
    .default("")
    .messages({
      "string.max": "Weight cannot exceed 50 characters",
    }),

  dimensions: Joi.string()
    .optional()
    .trim()
    .max(100)
    .allow("")
    .default("")
    .messages({
      "string.max": "Dimensions cannot exceed 100 characters",
    }),

  brand: Joi.string()
    .optional()
    .trim()
    .max(100)
    .allow("")
    .default("")
    .messages({
      "string.max": "Brand name cannot exceed 100 characters",
    }),
  warranty: Joi.string()
    .optional()
    .trim()
    .pattern(/^\d+\s+(Year|Years|Month|Months)$/) // Allow both singular and plural
    .default("1 Year")
    .messages({
      "string.pattern.base":
        "Warranty must be in format like '1 Year', '2 Years', '6 Months'",
    }),

  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .optional()
    .default([])
    .messages({
      "array.includes": "Each tag must be a string",
    }),

  // Simplified images validation matching model
  images: Joi.array()
    .items(
      Joi.object({
        displayUrl: Joi.string()
          .required()
          .uri({
            allowQuerySquareBrackets: true, // Allow query params with brackets
            allowRelative: false,
            scheme: ["http", "https"],
          })
          .messages({
            "string.empty": "Image display URL is required",
            "string.uri": "Image display URL must be a valid URL",
            "any.required": "Image display URL is required",
          }),
        gcsFileName: Joi.string().required().messages({
          "string.empty": "GCS filename is required",
          "any.required": "GCS filename is required",
        }),
        isPrimary: Joi.boolean().optional().default(false),
      }),
    )
    .optional()
    .default([]),

  status: Joi.string()
    .valid(
      "active",
      "inactive",
      "discontinued",
      "In Stock",
      "Low Stock",
      "Out of Stock",
    )
    .default("active")
    .messages({
      "any.only":
        "Status must be active, inactive, discontinued, In Stock, Low Stock, or Out of Stock",
    }),

  isFeatured: Joi.boolean().optional().default(false),

  lastRestock: Joi.date().optional().default(Date.now).messages({
    "date.base": "Last restock must be a valid date",
  }),

  totalSold: Joi.number().optional().integer().min(0).default(0).messages({
    "number.base": "Total sold must be a number",
    "number.integer": "Total sold must be a whole number",
    "number.min": "Total sold cannot be negative",
  }),

  totalRevenue: Joi.number().optional().min(0).default(0).messages({
    "number.base": "Total revenue must be a number",
    "number.min": "Total revenue cannot be negative",
  }),

  productType: Joi.string()
    .valid("gaming", "electrical", "general")
    .default("general")
    .messages({
      "any.only": "Product type must be gaming, electrical, or general",
    }),

  model: Joi.string()
    .optional()
    .trim()
    .max(100)
    .allow("")
    .default("")
    .messages({
      "string.max": "Model cannot exceed 100 characters",
    }),

  color: Joi.string().optional().trim().max(50).allow("").default("").messages({
    "string.max": "Color cannot exceed 50 characters",
  }),

  connectivity: Joi.string()
    .optional()
    .trim()
    .max(100)
    .allow("")
    .default("")
    .messages({
      "string.max": "Connectivity cannot exceed 100 characters",
    }),

  powerConsumption: Joi.string()
    .optional()
    .trim()
    .max(50)
    .allow("")
    .default("")
    .messages({
      "string.max": "Power consumption cannot exceed 50 characters",
    }),
});

// File upload validation schema (for Multer/GCS)
const fileUploadSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string()
    .valid("image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif")
    .required()
    .messages({
      "any.only": "File must be an image (JPEG, PNG, WEBP, GIF)",
      "any.required": "File is required",
    }),
  buffer: Joi.binary().required(),
  size: Joi.number()
    .max(10 * 1024 * 1024) // 10MB limit
    .required()
    .messages({
      "number.max": "File size must be less than 10MB",
    }),
});

// Validation for creating a new product
const validateCreateProduct = (data, files = []) => {
  // Validate main product data
  const productValidation = productValidationSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  // Validate files if providedzz
  let fileErrors = [];
  if (files && files.length > 0) {
    files.forEach((file, index) => {
      const fileValidation = fileUploadSchema.validate(file, {
        abortEarly: false,
      });
      if (fileValidation.error) {
        fileErrors.push({
          fileIndex: index,
          errors: fileValidation.error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })),
        });
      }
    });
  }

  return {
    product: productValidation,
    files: fileErrors.length > 0 ? { error: fileErrors } : { value: files },
    isValid: !productValidation.error && fileErrors.length === 0,
  };
};

// FIXED validateUpdateProduct function
const validateUpdateProduct = (data) => {
  // Get the keys from the base schema
  const baseSchemaKeys = productValidationSchema.describe().keys;

  // Create a new schema where ALL fields from the base schema are optional
  const updateSchemaObj = {};

  // Make all fields optional by creating a new object
  Object.keys(baseSchemaKeys).forEach((key) => {
    // Extract each field from the base schema and make it optional
    updateSchemaObj[key] = productValidationSchema.extract(key).optional();
  });

  // Create the update schema with all optional fields
  const updateSchema = Joi.object(updateSchemaObj).append({
    replaceImages: Joi.boolean().optional().default(false),
    clearImages: Joi.boolean().optional().default(false),
    // Allow images array for updates (can be used for reordering)
    images: Joi.array()
      .items(
        Joi.object({
          displayUrl: Joi.string().uri().required(),
          gcsFileName: Joi.string().required(),
          isPrimary: Joi.boolean().optional().default(false),
          _id: Joi.string().optional(), // For existing images
          size: Joi.number().optional(),
          contentType: Joi.string().optional(),
          originalName: Joi.string().optional(),
        }),
      )
      .optional()
      .default([]),
  });

  return updateSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

// products.validator.js
const validateProductId = (id) => {
  console.log("DEBUG validateProductId - Input:", id);
  console.log("DEBUG validateProductId - Type:", typeof id);

  // First handle null/undefined
  if (!id) {
    return {
      error: {
        details: [{ message: "Product ID is required" }],
      },
    };
  }

  // Convert to string if it's not
  const idString = String(id);

  // Check length first
  if (idString.length !== 24) {
    console.warn(`Product ID length is ${idString.length}, expected 24`);
    // Don't fail immediately - let MongoDB handle it
  }

  // Use a more flexible validation
  return Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/) // Allows uppercase and lowercase
    .messages({
      "string.pattern.base": "Product ID must be a 24-character hex string",
      "any.required": "Product ID is required",
    })
    .validate(idString);
};
// Custom validation for stock update
const validateStockUpdate = (data) => {
  const stockSchema = Joi.object({
    stock: Joi.number().integer().min(0).required().messages({
      "number.base": "Stock must be a number",
      "number.integer": "Stock must be a whole number",
      "number.min": "Stock cannot be negative",
      "any.required": "Stock is required",
    }),
    operation: Joi.string()
      .valid("set", "increment", "decrement")
      .default("set")
      .messages({
        "any.only": "Operation must be set, increment, or decrement",
      }),
  });

  return stockSchema.validate(data, { abortEarly: false });
};

// Validation for product filters/query (updated with gaming categories)
const validateProductFilters = (query) => {
  const filterSchema = Joi.object({
    category: Joi.string()
      .valid(
        "gaming-pcs",
        "gaming-laptops",
        "consoles",
        "gaming-monitors",
        "gaming-headsets",
        "mechanical-keyboards",
        "gaming-mice",
        "games",
        "gaming-chairs",
        "streaming-gear",
        "storage",
        "memory",
        "cables",
        "routers",
        "servers",
        "Wiring & Cables",
        "Switches & Sockets",
        "Lighting Solutions",
        "Ventilation Systems",
        "gaming-speakers",
        "cameras",
        "Energy Management",
        "Security Systems",
        "Automation",
        "Solar Products",
      )
      .optional(),

    productType: Joi.string()
      .valid("gaming", "electrical", "general")
      .optional(),

    minPrice: Joi.number().min(0).optional().messages({
      "number.min": "Minimum price cannot be negative",
    }),

    maxPrice: Joi.number().min(0).optional().messages({
      "number.min": "Maximum price cannot be negative",
    }),

    minStock: Joi.number().min(0).optional().messages({
      "number.min": "Minimum stock filter cannot be negative",
    }),

    inStock: Joi.boolean().optional(),

    lowStock: Joi.boolean().optional(),

    isFeatured: Joi.boolean().optional(),

    status: Joi.string()
      .valid(
        "active",
        "inactive",
        "discontinued",
        "In Stock",
        "Low Stock",
        "Out of Stock",
      )
      .optional(),

    brand: Joi.string().trim().optional(),

    search: Joi.string().trim().max(100).optional().messages({
      "string.max": "Search query cannot exceed 100 characters",
    }),

    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": "Page must be at least 1",
    }),

    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),

    sortBy: Joi.string()
      .valid(
        "name",
        "price",
        "stock",
        "createdAt",
        "updatedAt",
        "totalSold",
        "totalRevenue",
      )
      .default("createdAt")
      .messages({
        "any.only": "Invalid sort field",
      }),

    sortOrder: Joi.string().valid("asc", "desc").default("desc").messages({
      "any.only": "Sort order must be asc or desc",
    }),
  });

  return filterSchema.validate(query, {
    abortEarly: false,
    stripUnknown: true,
  });
};

// Validation for image upload only (returns GCS ready format)
const validateImageUpload = (files) => {
  if (!files || files.length === 0) {
    return {
      error: {
        details: [
          {
            message: "At least one image file is required",
          },
        ],
      },
    };
  }

  const fileErrors = [];
  const validFiles = [];

  files.forEach((file, index) => {
    const validation = fileUploadSchema.validate(file, { abortEarly: false });
    if (validation.error) {
      fileErrors.push({
        fileIndex: index,
        errors: validation.error.details,
      });
    } else {
      validFiles.push({
        originalname: file.originalname,
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname,
      });
    }
  });

  if (fileErrors.length > 0) {
    return {
      error: {
        details: fileErrors.flatMap((fe) => fe.errors),
      },
    };
  }

  return { value: validFiles };
};

// Validation for GCS image data after upload
const validateGCSImageData = (imageData) => {
  const gcsImageSchema = Joi.object({
    displayUrl: Joi.string().required().uri().messages({
      "string.empty": "Display URL is required",
      "string.uri": "Display URL must be a valid URL",
      "any.required": "Display URL is required",
    }),
    gcsFileName: Joi.string().required().messages({
      "string.empty": "GCS filename is required",
      "any.required": "GCS filename is required",
    }),
    isPrimary: Joi.boolean().optional().default(false),
    // Optional metadata
    size: Joi.number().optional().min(0),
    originalName: Joi.string().optional(),
    width: Joi.number().optional().min(0),
    height: Joi.number().optional().min(0),
    // ADD THIS FIELD:
    contentType: Joi.string()
      .optional()
      .pattern(/^image\//) // Optional: validate it starts with "image/"
      .messages({
        "string.pattern.base": "Content type must be an image MIME type",
      }),
  });

  return gcsImageSchema.validate(imageData, { abortEarly: false });
};

// Validation for bulk image update/assignment
const validateBulkImagesUpdate = (data) => {
  const bulkImagesSchema = Joi.object({
    images: Joi.array()
      .items(
        Joi.object({
          displayUrl: Joi.string().required().uri().messages({
            "string.empty": "Display URL is required",
            "string.uri": "Display URL must be a valid URL",
            "any.required": "Display URL is required",
          }),
          gcsFileName: Joi.string().required().messages({
            "string.empty": "GCS filename is required",
            "any.required": "GCS filename is required",
          }),
          isPrimary: Joi.boolean().optional().default(false),
        }),
      )
      .min(0)
      .required()
      .messages({
        "array.min": "Images array cannot be empty",
        "any.required": "Images array is required",
      }),
    clearExisting: Joi.boolean().optional().default(false),
  });

  return bulkImagesSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateStockUpdate,
  validateProductFilters,
  validateImageUpload,
  validateGCSImageData,
  validateBulkImagesUpdate,
  productValidationSchema,
  fileUploadSchema,
};
