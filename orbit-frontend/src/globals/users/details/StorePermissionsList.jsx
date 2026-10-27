const idOf = (ref) => (ref && typeof ref === "object" ? ref._id : ref);

const PERMISSION_LABELS = [
  ["canView", "View"],
  ["canEdit", "Edit"],
  ["canSell", "Sell"],
  ["canManage", "Manage"],
];

// Per-store permissions, each paired with the store role for the same store
const StorePermissionsList = ({ storePermissions = [], storeRoles = [] }) => {
  if (storePermissions.length === 0) {
    return (
      <p className="mb-0 text-sm text-gray-500 dark:text-gray-400">
        No store-specific permissions. Access follows the user's role and
        assigned store.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {storePermissions.map((perm, index) => {
        const storeId = String(idOf(perm.store) ?? index);
        const storeRole = storeRoles.find(
          (r) => String(idOf(r.store)) === storeId,
        );
        const granted = PERMISSION_LABELS.filter(([key]) => perm[key]);

        return (
          <li
            key={storeId}
            className="rounded-sm border border-gray-200 px-3 py-2 dark:border-gray-700"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {perm.store?.name || "Store no longer available"}
              </span>
              {storeRole && (
                <span className="shrink-0 text-xs text-gray-500 capitalize dark:text-gray-400">
                  {storeRole.role}
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {granted.length > 0 ? (
                granted.map(([key, label]) => (
                  <span
                    key={key}
                    className="rounded-sm bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {label}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  No access
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default StorePermissionsList;
