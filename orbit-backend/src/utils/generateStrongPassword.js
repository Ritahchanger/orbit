const generateStrongPassword = (length = 8) => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  // Ensure at least one character from each category
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";

  // Add one character from each required category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest with random characters from all categories
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to make it more random
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// Alternative: More sophisticated password generator with configurable options
const generateStrongPasswordV2 = (options = {}) => {
  const {
    length = 8,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let charPool = "";
  let password = "";

  // Build character pool based on options
  if (includeUppercase) charPool += uppercase;
  if (includeLowercase) charPool += lowercase;
  if (includeNumbers) charPool += numbers;
  if (includeSymbols) charPool += symbols;

  if (charPool.length === 0) {
    throw new Error("At least one character type must be selected");
  }

  // Ensure at least one character from each selected category
  if (includeUppercase) {
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
  }
  if (includeLowercase) {
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
  }
  if (includeNumbers) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
  }
  if (includeSymbols) {
    password += symbols[Math.floor(Math.random() * symbols.length)];
  }

  // Fill the remaining length
  for (let i = password.length; i < length; i++) {
    password += charPool[Math.floor(Math.random() * charPool.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// Example passwords generated:
// "A5b!2xQ@" - 8 characters with all requirements
// "K8#mP2!d" - Another example
// "Xy3$zQ9!" - And another

module.exports = { generateStrongPassword, generateStrongPasswordV2 };
