/**
 * Simplified phone number formatter - more lenient for various Kenyan formats
 */
// src/utils/formatPhoneNumber.js
const formatPhoneNumber = (phone, strict = true) => {
  try {
    if (!phone) {
      throw new Error("Phone number is required");
    }

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // Validate we have digits
    if (!digits) {
      throw new Error("Phone number contains no valid digits");
    }

    // If not in strict mode (for validation while typing), be lenient
    if (!strict && digits.length < 9) {
      return null; // Return null instead of throwing error
    }

    // Validate length
    if (digits.length < 9 || digits.length > 12) {
      throw new Error(
        `Invalid phone number length: ${digits.length} digits. Expected 9-12 digits`,
      );
    }

    let formattedNumber;
    let numberPart;

    // Case 1: Already in 254 format (12 digits)
    if (digits.length === 12 && digits.startsWith("254")) {
      formattedNumber = digits;
      numberPart = digits.substring(3);
    }
    // Case 2: Starts with 0 (10 digits) - e.g., 0712345678
    else if (digits.length === 10 && digits.startsWith("0")) {
      numberPart = digits.substring(1);
      formattedNumber = "254" + numberPart;
    }
    // Case 3: 9 digits - e.g., 712345678 or 113174493
    else if (digits.length === 9) {
      numberPart = digits;
      formattedNumber = "254" + digits;
    } else {
      // Try to extract last 9 digits
      const last9Digits = digits.slice(-9);
      if (last9Digits.length === 9) {
        numberPart = last9Digits;
        formattedNumber = "254" + last9Digits;
      } else {
        throw new Error("Could not extract valid 9-digit number");
      }
    }

    // Validate the numberPart is exactly 9 digits
    if (!numberPart || numberPart.length !== 9) {
      throw new Error(
        `Invalid number length: ${numberPart?.length || 0} digits. Expected 9 digits`,
      );
    }

    // Accept numbers starting with 1 or 7
    const firstDigit = numberPart.charAt(0);
    if (!["1", "7"].includes(firstDigit)) {
      throw new Error(`Invalid Kenyan number prefix: ${firstDigit}`);
    }

    console.log(`✅ Phone formatted: ${phone} -> ${formattedNumber}`);
    return formattedNumber;
  } catch (error) {
    if (strict) {
      console.error(`❌ Failed to format phone: "${phone}" - ${error.message}`);
      throw new Error(
        `Invalid phone number: ${phone}. Please use formats like: 0712345678, 712345678, or 254712345678`,
      );
    } else {
      // In non-strict mode, just return null for invalid numbers
      return null;
    }
  }
};

module.exports = { formatPhoneNumber };
