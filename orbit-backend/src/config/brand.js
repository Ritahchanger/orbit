// Name and contact details used in emails the platform sends. Set them per
// environment instead of hard-coding a company name into templates.
const brand = {
  name: process.env.COMPANY_NAME || "Orbit",
  email: process.env.COMPANY_EMAIL || "",
  supportEmail: process.env.SUPPORT_EMAIL || process.env.COMPANY_EMAIL || "",
  website: process.env.COMPANY_WEBSITE || "",
};

module.exports = brand;
