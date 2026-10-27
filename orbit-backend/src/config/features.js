// Features that are switched off until they work per business. Mirrors the
// frontend's src/config/features.js; turn a feature on in both places.
//
// consultations: bookings, consultation types, availability and the
//   consultation email log aren't scoped to a business, public booking
//   fails, and bookings can be read or cancelled by guessing a reference.
//   Set FEATURE_CONSULTATIONS=true to mount its routes again.
const FEATURES = {
  consultations: process.env.FEATURE_CONSULTATIONS === "true",
};

const isFeatureEnabled = (feature) => FEATURES[feature] === true;

module.exports = { FEATURES, isFeatureEnabled };
