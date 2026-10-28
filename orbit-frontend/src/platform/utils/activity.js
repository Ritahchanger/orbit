// How activity log entries read in the console

export const ACTION_FILTERS = [
  ["", "All activity"],
  ["business.status_changed", "Business status changes"],
  ["auth.login", "Sign-ins"],
  ["auth.login_failed", "Failed sign-ins"],
  ["auth.logout", "Sign-outs"],
];

export const actorLabel = (entry) => entry.actor?.name || entry.actor?.email || "Unknown";

// Tone of the dot shown next to an entry
export const activityTone = (entry) => {
  if (entry.action === "auth.login_failed") return "red";
  if (entry.action === "business.status_changed") {
    return { active: "green", suspended: "red", cancelled: "gray" }[entry.details?.to] || "amber";
  }
  return "gray";
};
