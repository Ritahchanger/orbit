// routes/appRoutes.js
import { useSimpleRolePermissionCheck } from "../context/RolePermissionContext";
// Public Components
import Community from "../everyone-pages/community/pages/Community";
import SetUpConsultation from "../everyone-pages/consultation/pages/SetUpConsultation";
import AdminLogin from "../authentication/login/Login";
import PageNotFound from "../components/common/PageNotFound";
import RootHome from "../everyone-pages/storefront/pages/RootHome";
import RootProducts from "../everyone-pages/storefront/pages/RootProducts";
import RootProductDetail from "../everyone-pages/storefront/pages/RootProductDetail";
import StorefrontHome from "../everyone-pages/storefront/pages/StorefrontHome";
import StorefrontProductDetail from "../everyone-pages/storefront/pages/StorefrontProductDetail";
import StorefrontCart from "../everyone-pages/storefront/pages/StorefrontCart";
import StorefrontCheckout from "../everyone-pages/storefront/pages/StorefrontCheckout";
import StorefrontOrderConfirmation from "../everyone-pages/storefront/pages/StorefrontOrderConfirmation";
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

import AdminSubscriptions from "../admin-pages/admin-subscriptions/pages/AdminSubscriptions";

import AdminBusinessProfile from "../admin-pages/admin-business-profile/pages/AdminBusinessProfile";

import AdminEcommerceSettings from "../admin-ecommerce/settings/pages/AdminEcommerceSettings";
import AdminEcommerceOrders from "../admin-ecommerce/orders/pages/AdminEcommerceOrders";
import AdminEcommerceOrderDetail from "../admin-ecommerce/orders/pages/AdminEcommerceOrderDetail";
import AdminEcommerceInvoices from "../admin-ecommerce/invoices/pages/AdminEcommerceInvoices";
import AdminEcommerceInvoiceDetail from "../admin-ecommerce/invoices/pages/AdminEcommerceInvoiceDetail";
import AdminEcommerceCustomers from "../admin-ecommerce/customers/pages/AdminEcommerceCustomers";
import AdminEcommerceCustomerDetail from "../admin-ecommerce/customers/pages/AdminEcommerceCustomerDetail";

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
  // Domain-aware: renders that business's storefront when the hostname (or a
  // ?store= override) resolves to a tenant, otherwise falls back to the
  // platform's own marketing pages. See useStoreSlug for resolution order.
  { path: "/", element: <RootHome /> },
  { path: "/community", element: <Community /> },
  { path: "/setup-consultation", element: <SetUpConsultation /> },
  { path: "/products", element: <RootProducts /> },
  { path: "/products/category/:category", element: <RootProducts /> },
  { path: "/products/:id", element: <RootProductDetail /> },
  { path: "/category/:category", element: <RootProducts /> },
  { path: "/brand/:brand", element: <RootProducts /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/signup", element: <AdminSignup /> },

  // Domain-scoped cart/checkout (no :slug in the path — the tenant is
  // implicit from the hostname or a ?store= override)
  { path: "/cart", element: <StorefrontCart /> },
  { path: "/checkout", element: <StorefrontCheckout /> },
  { path: "/order-confirmation/:orderNumber", element: <StorefrontOrderConfirmation /> },

  // Path-scoped storefront (explicit /store/:slug, always works regardless of domain)
  { path: "/store/:slug", element: <StorefrontHome /> },
  { path: "/store/:slug/products/:productId", element: <StorefrontProductDetail /> },
  { path: "/store/:slug/cart", element: <StorefrontCart /> },
  { path: "/store/:slug/checkout", element: <StorefrontCheckout /> },
  {
    path: "/store/:slug/order-confirmation/:orderNumber",
    element: <StorefrontOrderConfirmation />,
  },

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

  {
    path: "/admin/subscriptions",
    element: <AdminSubscriptions />,
    roles: ["admin", "superadmin"],
  },
  {
    path: "/admin/business-profile",
    element: <AdminBusinessProfile />,
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
  {
    path: "/admin/ecommerce/settings/store",
    element: <AdminEcommerceSettings />,
    roles: ["admin", "superadmin"],
  },
  {
    path: "/admin/ecommerce/orders",
    element: <AdminEcommerceOrders />,
    roles: ["admin", "superadmin", "manager", "cashier"],
  },
  {
    path: "/admin/ecommerce/orders/:orderId",
    element: <AdminEcommerceOrderDetail />,
    roles: ["admin", "superadmin", "manager", "cashier"],
  },
  {
    path: "/admin/ecommerce/invoices",
    element: <AdminEcommerceInvoices />,
    roles: ["admin", "superadmin", "manager"],
  },
  {
    path: "/admin/ecommerce/invoices/:invoiceId",
    element: <AdminEcommerceInvoiceDetail />,
    roles: ["admin", "superadmin", "manager"],
  },
  {
    path: "/admin/ecommerce/customers",
    element: <AdminEcommerceCustomers />,
    roles: ["admin", "superadmin", "manager"],
  },
  {
    path: "/admin/ecommerce/customers/:phone",
    element: <AdminEcommerceCustomerDetail />,
    roles: ["admin", "superadmin", "manager"],
  },
];
