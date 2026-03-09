import {
  Keyboard,
  ShoppingCart,
  Calculator,
  X,
  ArrowUp,
  ArrowDown,
  Search,
  Home,
  Package,
  RefreshCw,
  Users,
  Mail,
  BarChart3,
  Receipt,
  HelpCircle,
  FileText,
  Store,
  Settings,
  Shield,
  TrendingUp,
  ArrowRightLeft,
} from "lucide-react";

export const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    cashier: ["cashier"],
    manager: ["cashier", "manager"],
    admin: ["cashier", "manager", "admin"],
    superadmin: ["cashier", "manager", "admin", "superadmin"],
  };

  if (!userRole || !requiredRole) return false;
  if (userRole === "superadmin") return true;

  const userRoles = roleHierarchy[userRole] || [];
  return userRoles.includes(requiredRole);
};
export const navItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: Home,
    type: "link",
  },
  {
    name: "Products",
    icon: Package,
    type: "dropdown",
    items: [{ name: "All Products", path: "/admin/products", icon: Package }],
  },
  {
    name: "Transactions",
    path: "/admin/transactions",
    icon: Package,
    type: "link",
    requiredRole: "cashier",
  },
  {
    name: "Workers",
    path: "/admin/workers",
    icon: Users,
    type: "link",
    requiredRole: "admin",
  },
  {
    name: "Newsletter",
    path: "/admin/newsletter",
    icon: Mail,
    type: "link",
    requiredRole: "admin",
  },
  {
    name: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
    type: "link",
    requiredRole: "admin",
  },
  {
    name: "Consultation ",
    path: "/admin/consultation-setup",
    icon: BarChart3,
    type: "link",
    requiredRole: "superadmin",
  },
  {
    name: "Stock Transfers ",
    path: "/admin/stock-tranfers",
    icon: ArrowRightLeft,
    type: "link",
    requiredRole: "superadmin",
  },
];
export const getAllowedNavItems = (userRole) => {
  return navItems.filter((item) => {
    if (userRole === "superadmin") return true;
    if (item.requiredRole) {
      return hasPermission(userRole, item.requiredRole);
    }
    if (item.type === "dropdown") {
      const accessibleSubItems = item.items.filter((subItem) => {
        if (subItem.requiredRole) {
          return hasPermission(userRole, subItem.requiredRole);
        }
        return true;
      });
      return accessibleSubItems.length > 0;
    }
    return true;
  });
};

export const notifications = [
  {
    id: 1,
    title: "New Order",
    message: "Order #ORD-1234 has been placed",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    title: "Low Stock Alert",
    message: "Gaming Mouse Pro stock is low",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "Payment Received",
    message: "Payment confirmed for ORD-1233",
    time: "2 hours ago",
    read: true,
  },
  {
    id: 4,
    title: "New Subscriber",
    message: "New newsletter subscription",
    time: "5 hours ago",
    read: true,
  },
];
export const keyboardShortcuts = [
  {
    key: "Ctrl + P",
    description: "Open POS",
    action: "posModal",
    icon: ShoppingCart,
    color: "text-green-500 dark:text-green-400",
    requiredPermission: "sales.create",
    allowedRoles: ["cashier", "manager", "admin", "superadmin"],
  },
  {
    key: "Ctrl + B",
    description: "Focus Search",
    action: "focusSearch",
    icon: Search,
    color: "text-blue-500 dark:text-blue-400",
    requiredPermission: null, // Global - available to all
    allowedRoles: ["cashier", "manager", "admin", "superadmin", "staff"],
  },
  {
    key: "Ctrl + C",
    description: "Calculator",
    action: "calculator",
    icon: Calculator,
    color: "text-yellow-500 dark:text-yellow-400",
    requiredPermission: null, // Global - available to all
    allowedRoles: ["cashier", "manager", "admin", "superadmin", "staff"],
  },
  {
    key: "Ctrl + N",
    description: "New Product",
    action: "productModal",
    icon: Package,
    color: "text-purple-500 dark:text-purple-400",
    requiredPermission: "products.create",
    allowedRoles: ["manager", "admin", "superadmin"],
  },
  {
    key: "Ctrl + T",
    description: "Scroll Top",
    action: "scrollTop",
    icon: ArrowUp,
    color: "text-indigo-500 dark:text-indigo-400",
    requiredPermission: null, // Global - UI action
    allowedRoles: ["cashier", "manager", "admin", "superadmin", "staff"],
  },
  {
    key: "Ctrl + L",
    description: "Scroll Bottom",
    action: "scrollBottom",
    icon: ArrowDown,
    color: "text-pink-500 dark:text-pink-400",
    requiredPermission: null, // Global - UI action
    allowedRoles: ["cashier", "manager", "admin", "superadmin", "staff"],
  },
  {
    key: "Ctrl + H",
    description: "Dashboard",
    action: "dashboard",
    icon: Home,
    color: "text-orange-500 dark:text-orange-400",
    requiredPermission: "dashboard.view",
    allowedRoles: ["cashier", "manager", "admin", "superadmin", "staff"],
  },
  {
    key: "Ctrl + K",
    description: "Search",
    action: "searchModal",
    icon: Search,
    color: "text-blue-500 dark:text-blue-400",
    requiredPermission: null, // Global
    allowedRoles: ["cashier", "manager", "admin", "superadmin", "staff"],
  },
  {
    key: "Ctrl + R",
    description: "Refresh",
    action: "refresh",
    icon: RefreshCw,
    color: "text-cyan-500 dark:text-cyan-400",
    requiredPermission: null, // Global
    allowedRoles: ["cashier", "manager", "admin", "superadmin", "staff"],
  },
  {
    key: "Ctrl + /",
    description: "Toggle Shortcuts",
    action: "toggleShortcuts",
    icon: Keyboard,
    color: "text-gray-500 dark:text-gray-400",
    requiredPermission: null, // Global
    allowedRoles: ["cashier", "manager", "admin", "superadmin", "staff"],
  },
  {
    key: "Esc",
    description: "Close",
    action: "close",
    icon: X,
    color: "text-red-500 dark:text-red-400",
    requiredPermission: null, // Global
    allowedRoles: ["cashier", "manager", "admin", "superadmin", "staff"],
  },
  {
    key: "Shift + T",
    description: "Transactions",
    action: "transactions",
    icon: Receipt,
    color: "text-teal-500 dark:text-teal-400",
    requiredPermission: "transactions.view",
    allowedRoles: ["cashier", "manager", "admin", "superadmin"],
  },
  {
    key: "Ctrl + ?",
    description: "Help & Support",
    action: "helpModal",
    icon: HelpCircle,
    color: "text-purple-500 dark:text-purple-400",
    requiredPermission: null, // Global
    allowedRoles: ["cashier", "manager", "admin", "superadmin", "staff"],
  },
  // Additional role-specific shortcuts
  {
    key: "Ctrl + U",
    description: "Users Management",
    action: "users",
    icon: Users,
    color: "text-indigo-500 dark:text-indigo-400",
    requiredPermission: "users.view",
    allowedRoles: ["admin", "superadmin"],
  },

  {
    key: "Ctrl + M",
    description: "Store Management",
    action: "stores",
    icon: Store,
    color: "text-emerald-500 dark:text-emerald-400",
    requiredPermission: "stores.view",
    allowedRoles: ["admin", "superadmin"],
  },
  {
    key: "Ctrl + Shift + S",
    description: "System Settings",
    action: "settings",
    icon: Settings,
    color: "text-slate-500 dark:text-slate-400",
    requiredPermission: "settings.manage",
    allowedRoles: ["superadmin"],
  },
  {
    key: "Ctrl + Shift + R",
    description: "Roles & Permissions",
    action: "roles",
    icon: Shield,
    color: "text-violet-500 dark:text-violet-400",
    requiredPermission: "roles.view",
    allowedRoles: ["superadmin"],
  },
];

// Helper function to filter shortcuts based on user role and permissions
export const getAccessibleShortcuts = (userRole, userPermissions = []) => {
  return keyboardShortcuts.filter((shortcut) => {
    // Superadmin gets everything
    if (userRole === "superadmin") return true;

    // Check if user's role is allowed
    if (shortcut.allowedRoles && !shortcut.allowedRoles.includes(userRole)) {
      return false;
    }

    // Check permission if required
    if (shortcut.requiredPermission) {
      return userPermissions.includes(shortcut.requiredPermission);
    }

    return true;
  });
};

// Helper function to check if a specific shortcut is accessible
export const isShortcutAccessible = (
  shortcut,
  userRole,
  userPermissions = [],
) => {
  if (userRole === "superadmin") return true;

  if (shortcut.allowedRoles && !shortcut.allowedRoles.includes(userRole)) {
    return false;
  }

  if (shortcut.requiredPermission) {
    return userPermissions.includes(shortcut.requiredPermission);
  }

  return true;
};

// Group shortcuts by role for display
export const shortcutsByRole = {
  cashier: keyboardShortcuts.filter(
    (s) =>
      s.allowedRoles?.includes("cashier") &&
      !s.requiredPermission?.includes("profit") &&
      !s.requiredPermission?.includes("reports.profit"),
  ),
  manager: keyboardShortcuts.filter(
    (s) =>
      s.allowedRoles?.includes("manager") &&
      !s.requiredPermission?.includes("profit") &&
      !s.requiredPermission?.includes("reports.profit"),
  ),
  admin: keyboardShortcuts.filter((s) => s.allowedRoles?.includes("admin")),
  superadmin: keyboardShortcuts, // Superadmin gets all
};

// Permission-based shortcut categories
export const shortcutCategories = {
  global: keyboardShortcuts.filter((s) => !s.requiredPermission),
  sales: keyboardShortcuts.filter(
    (s) =>
      s.requiredPermission?.startsWith("sales") ||
      s.requiredPermission?.startsWith("transactions"),
  ),
  products: keyboardShortcuts.filter((s) =>
    s.requiredPermission?.startsWith("products"),
  ),
  inventory: keyboardShortcuts.filter((s) =>
    s.requiredPermission?.startsWith("inventory"),
  ),
  reports: keyboardShortcuts.filter((s) =>
    s.requiredPermission?.startsWith("reports"),
  ),
  admin: keyboardShortcuts.filter(
    (s) =>
      s.requiredPermission?.startsWith("users") ||
      s.requiredPermission?.startsWith("stores"),
  ),
  system: keyboardShortcuts.filter(
    (s) =>
      s.requiredPermission?.startsWith("settings") ||
      s.requiredPermission?.startsWith("roles"),
  ),
};
