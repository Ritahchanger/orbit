// Features that are switched off until they work per business.
//
// newsletter: public sign-ups aren't linked to a business, so the admin
//   page never shows them and "Send" reaches nobody.
// consultations: public bookings have no business and fail to save, and
//   consultation types are shared by every business.
//
// Set a flag to true to bring the feature back: its routes, menu entries
// and links on the public site reappear. Consultations is also switched off
// in the backend (FEATURE_CONSULTATIONS in orbit-backend/src/config/features.js).
export const FEATURES = {
  newsletter: false,
  consultations: false,
};

export const isFeatureEnabled = (feature) => FEATURES[feature] !== false;

// Drops items tagged with a disabled `feature` (routes, menu entries, ...).
export const withEnabledFeatures = (items) =>
  items.filter((item) => !item.feature || isFeatureEnabled(item.feature));
