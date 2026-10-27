// One account status: suspended wins over inactive, which wins over active
export const getUserStatus = (user) => {
  if (user?.isSuspended) return "suspended";
  if (user?.isActive === false) return "inactive";
  return "active";
};
