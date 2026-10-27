import { isFeatureEnabled } from "../../config/features";

// Renders its children only while `feature` is switched on in config/features.
const FeatureGate = ({ feature, children, fallback = null }) =>
  isFeatureEnabled(feature) ? children : fallback;

export default FeatureGate;
