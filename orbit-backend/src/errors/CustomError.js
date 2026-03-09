class CustomError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Mark as operational error (not programming error)

    // Capture stack trace (excluding constructor call)
    Error.captureStackTrace(this, this.constructor);

    // Set the name property to the class name
    this.name = this.constructor.name;
  }

  // Static factory methods for common errors
  static badRequest(message = "Bad Request", details = null) {
    return new CustomError(400, message, details);
  }

  static unauthorized(message = "Unauthorized", details = null) {
    return new CustomError(401, message, details);
  }

  static forbidden(message = "Forbidden", details = null) {
    return new CustomError(403, message, details);
  }

  static notFound(message = "Not Found", details = null) {
    return new CustomError(404, message, details);
  }

  static conflict(message = "Conflict", details = null) {
    return new CustomError(409, message, details);
  }

  static validationError(message = "Validation Error", details = null) {
    return new CustomError(422, message, details);
  }

  static internalServerError(message = "Internal Server Error", details = null) {
    return new CustomError(500, message, details);
  }

  // For database errors
  static databaseError(message = "Database Error", details = null) {
    return new CustomError(503, message, details);
  }

  // For business logic errors
  static businessRule(message = "Business Rule Violation", details = null) {
    return new CustomError(422, message, details);
  }

  // For sale-specific errors
  static insufficientStock(available, requested) {
    return new CustomError(400, `Insufficient stock`, {
      available: available,
      requested: requested,
      message: `Only ${available} units available, but ${requested} requested`
    });
  }

  static invalidDiscount(subtotal, discount) {
    return new CustomError(400, "Discount exceeds subtotal", {
      subtotal: subtotal,
      discount: discount,
      message: `Discount (${discount}) cannot exceed subtotal (${subtotal})`
    });
  }

  static invalidTotal(subtotal, discount, total) {
    return new CustomError(400, "Invalid total calculation", {
      subtotal: subtotal,
      discount: discount,
      total: total,
      expectedTotal: subtotal - discount,
      message: `Total (${total}) must equal subtotal (${subtotal}) minus discount (${discount}) = ${subtotal - discount}`
    });
  }

  // Format error for API responses
  toJSON() {
    return {
      success: false,
      error: {
        name: this.name,
        message: this.message,
        statusCode: this.statusCode,
        details: this.details,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Format error for logging
  toLog() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      stack: this.stack,
      details: this.details,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = CustomError;