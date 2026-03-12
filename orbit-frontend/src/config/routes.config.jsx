// routes/appRoutes.js
import { useSimpleRolePermissionCheck } from "../context/RolePermissionContext";
// Public Components
import Home from "../everyone-pages/home/pages/Home";
import Products from "../everyone-pages/products/pages/Products";
import ProductDetails from "../everyone-pages/products/pages/ProductDetails";
import Community from "../everyone-pages/community/pages/Community";
import SetUpConsultation from "../everyone-pages/consultation/pages/SetUpConsultation";
import AdminLogin from "../authentication/login/Login";
import PageNotFound from "../components/common/PageNotFound";
// Admin Components
import AdminDashboard from "../admin-pages/dashboard/pages/AdminDashboard";
import AdminProducts from "../admin-pages/products/pages/Products";
import AdminWorkers from "../admin-pages/admin-workers/pages/AdminWorkers";
import AdminNewsletter from "../admin-pages/news-letter/pages/Newsletter";
import AdminAnalytics from "../admin-pages/admin-analytics/pages/AdminAnalytics";
import AdminConsultation from "../admin-pages/consultation/pages/AdminConsultation";
import AdminConsultationTypes from "../admin-pages/consultation/pages/AdminConsultationTypes";
import AdminSystemSettings from "../admin-pages/system/pages/Settings";
import AdminSystemPermissions from "../admin-pages/system/pages/Permissions";
import AdminSystemDatabase from "../admin-pages/system/pages/Database";
import AdminSystemApiKeys from "../admin-pages/system/pages/ApiKeys";
import AdminManageStores from "../admin-pages/admin-stores/pages/AdminManageStores";
import AdminPayments from "../admin-pages/payments/pages/Payments";
import AdminInventory from "../admin-pages/inventory/pages/InventoryPage1";
import AdminProfile from "../admin-pages/profile/pages/Profile";
import AdminReports from "../admin-pages/admin-reports/pages/AdminReports";
import AdminPermissions from "../admin-pages/admin-permissions/pages/AdminPermissions";
import RoleManagement from "../admin-pages/admin-permissions/components/RoleManagement";
import AdminTransactions from "../admin-pages/admin-transactions/pages/AdminTransactions";
import AdminStockTransfers from "../admin-pages/admin-stock-transfers/pages/AdminStockTransfers";
import AdminTrash from "../admin-pages/admin-trash/pages/AdminTrash";
import AdminLogs from "../admin-pages/admin-logs/pages/AdminLogs";
import AdminEcommerceDashboard from "../admin-ecommerce/admin-ecommerce-dashboard/AdminEcommerceDashboard";
import AdminSignup from "../authentication/signup/SignUp";

// import AdminCategoriesPage from "../admin-pages/admin-categories/pages/AdminCategories";

// Hook to use role-based route protection
export const useRouteAccess = () => {
  const { canAccessRole } = useSimpleRolePermissionCheck();
  return {
    canAccessRoute: (requiredRoles = []) => {
      if (requiredRoles.length === 0) return true;
      return requiredRoles.some((role) => canAccessRole(role));
    },
  };
};

// Route definitions
export const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/community", element: <Community /> },
  { path: "/setup-consultation", element: <SetUpConsultation /> },
  { path: "/products", element: <Products /> },
  { path: "/products/category/:category", element: <Products /> },
  { path: "/products/:id", element: <ProductDetails /> },
  { path: "/category/:category", element: <Products /> },
  { path: "/brand/:brand", element: <Products /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/signup", element: <AdminSignup /> },
  { path: "*", element: <PageNotFound /> },
];

export const protectedRoutes = [
  // Dashboard (manager, admin, superadmin, cashier)
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
    roles: ["manager", "admin", "superadmin", "cashier"],
  },

  // Products (manager, admin, superadmin, cashier)
  {
    path: "/admin/products",
    element: <AdminProducts />,
    roles: ["manager", "admin", "superadmin", "cashier"],
  },
  {
    path: "/admin/products/:productId",
    element: <AdminProducts />,
    roles: ["manager", "admin", "superadmin"],
  },

  // Stores (admin, superadmin)
  {
    path: "/admin/stock-tranfers",
    element: <AdminStockTransfers />,
    roles: ["admin", "superadmin"],
  },
  {
    path: "/admin/stores",
    element: <AdminManageStores />,
    roles: ["admin", "superadmin"],
  },

  // Workers (superadmin only)
  {
    path: "/admin/workers",
    element: <AdminWorkers />,
    roles: ["superadmin"],
  },
  // {
  //   path: "/admin/categories",
  //   element: <AdminCategoriesPage />,
  //   roles: ["superadmin","admin","manager"],
  // },
  {
    path: "/admin/transactions",
    element: <AdminTransactions />,
    roles: ["superadmin", "admin", "manager", "cashier"],
  },
  {
    path: "/admin/logs",
    element: <AdminLogs />,
    roles: ["superadmin", "admin", "manager", "cashier"],
  },
  {
    path: "/admin/trash-items",
    element: <AdminTrash />,
    roles: ["superadmin", "admin", "manager"],
  },
  // Newsletter (superadmin only)
  {
    path: "/admin/newsletter",
    element: <AdminNewsletter />,
    roles: ["superadmin"],
  },

  // Analytics (superadmin only)
  {
    path: "/admin/analytics",
    element: <AdminAnalytics />,
    roles: ["superadmin"],
  },

  // Consultation (superadmin only)
  {
    path: "/admin/consultation-setup",
    element: <AdminConsultation />,
    roles: ["superadmin"],
  },
  {
    path: "/admin/consultation/types",
    element: <AdminConsultationTypes />,
    roles: ["superadmin"],
  },

  // System Routes (superadmin only)
  {
    path: "/admin/system/settings",
    element: <AdminSystemSettings />,
    roles: ["superadmin"],
  },
  {
    path: "/admin/settings/permissions",
    element: <AdminPermissions />,
    roles: ["superadmin"],
  },
  {
    path: "/admin/roles/management",
    element: <RoleManagement />,
    roles: ["superadmin"],
  },
  {
    path: "/admin/settings/:userId",
    element: <AdminPermissions />,
    roles: ["superadmin"],
  },
  {
    path: "/admin/system/permissions",
    element: <AdminSystemPermissions />,
    roles: ["superadmin"],
  },
  {
    path: "/admin/system/database",
    element: <AdminSystemDatabase />,
    roles: ["superadmin"],
  },
  {
    path: "/admin/system/api-keys",
    element: <AdminSystemApiKeys />,
    roles: ["superadmin"],
  },

  // Additional routes
  {
    path: "/admin/payments",
    element: <AdminPayments />,
    roles: ["superadmin"],
  },
  {
    path: "/admin/inventory",
    element: <AdminInventory />,
    roles: ["admin", "superadmin", "manager", "cashier"],
  },
  {
    path: "/admin/reports",
    element: <AdminReports />,
    roles: ["admin", "superadmin", "manager"],
  },
  {
    path: "/admin/profile",
    element: <AdminProfile />,
    roles: ["admin", "superadmin", "manager", "cashier"],
  },
  // ECOMMERCE
  {
    path: "/admin/ecommerce",
    element: <AdminEcommerceDashboard />,
    roles: ["admin", "superadmin", "manager", "cashier"],
  },
];
