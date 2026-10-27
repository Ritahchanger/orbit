// Roles allowed on the pages linked from the admin navbar. Both the routes
// (config/routes.config.jsx) and the navbar menu read from here, so the menu
// only offers pages the user can actually open.
export const ROUTE_ROLES = {
  "/admin/dashboard": ["manager", "admin", "superadmin", "cashier"],
  "/admin/products": ["manager", "admin", "superadmin", "cashier"],
  "/admin/inventory": ["admin", "superadmin", "manager", "cashier"],
  "/admin/transactions": ["superadmin", "admin", "manager", "cashier"],
  "/admin/reports": ["admin", "superadmin", "manager"],
  "/admin/workers": ["superadmin", "admin"],
  "/admin/analytics": ["superadmin", "admin"],
  "/admin/stock-transfers": ["admin", "superadmin"],
  "/admin/newsletter": ["superadmin"],
  "/admin/consultation-setup": ["superadmin"],
};

export const canOpenRoute = (path, role) =>
  Boolean(role && ROUTE_ROLES[path]?.includes(role));
