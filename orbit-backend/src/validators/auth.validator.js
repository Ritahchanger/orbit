const Joi = require("joi");

const userSignupValidator = Joi.object({
  firstName: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .required()
    .messages({
      "string.empty": "First name is required",
      "string.min": "First name must be at least 1 character long",
      "string.max": "First name cannot exceed 50 characters",
    })
    .label("First Name"),

  lastName: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .required()
    .messages({
      "string.empty": "Last name is required",
      "string.min": "Last name must be at least 1 character long",
      "string.max": "Last name cannot exceed 50 characters",
    })
    .label("Last Name"),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email is required",
    })
    .label("Email"),

  // FIXED: Password should NOT be optional in validator since it will be generated
  // Remove password from validator entirely since backend generates it
  // password: Joi.string()... REMOVE THIS

  company: Joi.string()
    .max(100)
    .trim()
    .allow("")
    .optional()
    .default("")
    .messages({
      "string.max": "Company name cannot exceed 100 characters",
    })
    .label("Company"),

  phoneNo: Joi.string()
    .pattern(/^\+?[\d\s\-()]+$/)
    .trim()
    .allow("")
    .optional()
    .default("")
    .messages({
      "string.pattern.base": "Please enter a valid phone number",
    })
    .label("Phone Number"),

  newsletter: Joi.boolean()
    .optional()
    .default(true)
    .label("Newsletter Subscription"),

  // FIXED: Add "manager" to valid roles
  role: Joi.string()
    .valid("admin", "superadmin", "cashier", "manager", "staff") // ADDED "manager"
    .optional()
    .default("normal-user")
    .messages({
      "any.only": "Role must be one of: admin, superadmin, manager, cashier, staff",
    })
    .label("Role"),

  profileImage: Joi.string()
    .uri()
    .allow("")
    .optional()
    .default("")
    .messages({
      "string.uri": "Profile image must be a valid URL",
    })
    .label("Profile Image"),

  // ADDED: Store assignment fields to match your User model
  assignedStore: Joi.string()
    .hex()
    .length(24)
    .optional()
    .allow(null, "")
    .default(null)
    .messages({
      "string.hex": "Store ID must be a valid MongoDB ObjectId",
      "string.length": "Store ID must be 24 characters long",
    })
    .label("Assigned Store"),

  canAccessAllStores: Joi.boolean()
    .optional()
    .default(false)
    .label("Can Access All Stores"),

  storePermissions: Joi.array()
    .items(
      Joi.object({
        store: Joi.string()
          .hex()
          .length(24)
          .required()
          .messages({
            "string.hex": "Store ID must be a valid MongoDB ObjectId",
            "string.length": "Store ID must be 24 characters long",
          })
          .label("Store ID"),
        canView: Joi.boolean().default(true).label("Can View"),
        canEdit: Joi.boolean().default(false).label("Can Edit"),
        canSell: Joi.boolean().default(false).label("Can Sell"),
        canManage: Joi.boolean().default(false).label("Can Manage"),
      })
    )
    .optional()
    .default([])
    .label("Store Permissions"),

  storeRoles: Joi.array()
    .items(
      Joi.object({
        store: Joi.string()
          .hex()
          .length(24)
          .required()
          .messages({
            "string.hex": "Store ID must be a valid MongoDB ObjectId",
            "string.length": "Store ID must be 24 characters long",
          })
          .label("Store ID"),
        role: Joi.string()
          .valid("manager", "cashier", "staff", "viewer")
          .required()
          .messages({
            "any.only": "Store role must be one of: manager, cashier, staff, viewer",
          })
          .label("Store Role"),
      })
    )
    .optional()
    .default([])
    .label("Store Roles"),
});

const userLoginValidator = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email is required",
    })
    .label("Email"),

  password: Joi.string()
    .required()
    .messages({
      "string.empty": "Password is required",
    })
    .label("Password"),
});

const userUpdateValidator = Joi.object({
  firstName: Joi.string().min(1).max(50).trim().optional().label("First Name"),

  lastName: Joi.string().min(1).max(50).trim().optional().label("Last Name"),

  company: Joi.string().max(100).trim().allow("").optional().label("Company"),

  phoneNo: Joi.string()
    .pattern(/^\+?[\d\s\-()]+$/)
    .trim()
    .allow("")
    .optional()
    .label("Phone Number"),

  newsletter: Joi.boolean().optional().label("Newsletter Subscription"),

  profileImage: Joi.string().uri().allow("").optional().label("Profile Image"),

  // Also add store fields to update validator if needed
  assignedStore: Joi.string()
    .hex()
    .length(24)
    .optional()
    .allow(null, "")
    .label("Assigned Store"),

  canAccessAllStores: Joi.boolean().optional().label("Can Access All Stores"),

  storePermissions: Joi.array()
    .items(
      Joi.object({
        store: Joi.string().hex().length(24).required().label("Store ID"),
        canView: Joi.boolean().default(true).label("Can View"),
        canEdit: Joi.boolean().default(false).label("Can Edit"),
        canSell: Joi.boolean().default(false).label("Can Sell"),
        canManage: Joi.boolean().default(false).label("Can Manage"),
      })
    )
    .optional()
    .label("Store Permissions"),

  storeRoles: Joi.array()
    .items(
      Joi.object({
        store: Joi.string().hex().length(24).required().label("Store ID"),
        role: Joi.string()
          .valid("manager", "cashier", "staff", "viewer")
          .required()
          .label("Store Role"),
      })
    )
    .optional()
    .label("Store Roles"),
});

module.exports = {
  userSignupValidator,
  userLoginValidator,
  userUpdateValidator,
};