// What each business status can move to, mirroring the server's allowed
// transitions (business.service updateStatus)
export const STATUS_ACTIONS = {
  pending: ["active", "cancelled"],
  active: ["suspended", "cancelled"],
  suspended: ["active", "cancelled"],
  cancelled: [],
};

export const actionLabel = (from, to) => {
  if (to === "active") return from === "pending" ? "Verify & activate" : "Reactivate";
  if (to === "suspended") return "Suspend";
  return "Cancel business";
};
