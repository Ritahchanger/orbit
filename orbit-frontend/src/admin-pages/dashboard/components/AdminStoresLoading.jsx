import { useEffect, useCallback, useMemo, useRef } from "react";
import {
  Store,
  Lock,
  AlertCircle,
  RefreshCw,
  Building2,
  Package,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { usePermissions } from "../../../context/permissions/permissions-context";
import { useAuth } from "../../../context/authentication/AuthenticationContext";
import { useQueryClient } from "@tanstack/react-query";
import StoreSwitcher from "./StoreSwitcher";
import { useStoreContext } from "../../../context/store/StoreContext";
import { useRole } from "../../../context/authentication/RoleContext";

const stripLinkClass =
  "inline-flex h-9 items-center gap-1.5 rounded-sm px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200/70 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white";

// The strip under the admin navbar: the store switcher plus quick links.
const AdminStoresLoading = ({
  storesLoading,
  stores,
  currentStore,
  handleStoreSwitch,
}) => {
  const { hasPermission } = usePermissions();

  const { isSuperadmin, isAdmin, user } = useAuth();
  const {
    canAccessStore: roleCanAccessStore,
    canManageStore: roleCanManageStore,
  } = useRole();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAllStores, isViewResolved, selectAllStores, setDefaultView } =
    useStoreContext();

  // Debug log only once
  const hasLogged = useRef(false);
  useEffect(() => {
    if (!hasLogged.current && user?.assignedStore) {
      console.log("User assigned store:", user.assignedStore);
      hasLogged.current = true;
    }
  }, [user?.assignedStore]);

  // Enhanced canAccessStore that respects your business rules
  const canAccessStore = useCallback(
    (storeId) => {
      if (!storeId || !user) return false;

      // 1. Superadmins can access all stores
      if (isSuperadmin) return true;

      // 2. Admins can access all stores
      if (isAdmin) return true;

      // 3. Check if user has store-specific access via role context
      return roleCanAccessStore(storeId);
    },
    [user, isSuperadmin, isAdmin, roleCanAccessStore],
  );

  const canManageStore = useCallback(
    (storeId) => {
      if (!storeId) return false;
      return roleCanManageStore(storeId);
    },
    [roleCanManageStore],
  );

  // Get accessible stores based on user role and permissions
  const accessibleStores = useMemo(() => {
    if (!stores || stores.length === 0) return [];

    // Superadmins and Admins can see ALL stores
    if (user?.role === "superadmin" || user?.role === "admin") {
      return stores;
    }

    // For non-superadmin/non-admin users, they can ONLY see their assigned store
    if (user?.assignedStore) {
      const assignedStoreId = user.assignedStore._id || user.assignedStore;
      const assignedStore = stores.find(
        (store) => store._id === assignedStoreId,
      );
      return assignedStore ? [assignedStore] : [];
    }

    // If user has no assigned store and is not superadmin/admin, they see NO stores
    return [];
  }, [stores, isSuperadmin, isAdmin, user?.assignedStore]);

  // Derived values
  const hasMultipleAccessibleStores = accessibleStores.length > 1;
  // "All stores" is offered to admins and superadmins who can see several stores
  const canViewAllStores =
    (user?.role === "superadmin" || user?.role === "admin") &&
    hasMultipleAccessibleStores;

  // Apply the default view once per session (admins start on "All stores"),
  // and drop "All stores" for anyone not allowed to use it.
  useEffect(() => {
    if (!user || storesLoading || !stores?.length) return;
    if (!isViewResolved) {
      setDefaultView(canViewAllStores);
    } else if (isAllStores && !canViewAllStores) {
      setDefaultView(false);
    }
  }, [
    user,
    storesLoading,
    stores,
    isViewResolved,
    isAllStores,
    canViewAllStores,
    setDefaultView,
  ]);

  const handleSelectAllStores = useCallback(() => {
    if (!canViewAllStores) return;
    selectAllStores();
    toast.success("Showing all stores");
  }, [canViewAllStores, selectAllStores]);
  const isCurrentStoreAccessible =
    currentStore && canAccessStore(currentStore._id);
  const hasStoreAccess = accessibleStores.length > 0;

  // Auto-switch to accessible store when current store is not accessible
  useEffect(() => {
    if (
      !storesLoading &&
      currentStore &&
      !isCurrentStoreAccessible &&
      accessibleStores.length > 0
    ) {
      const firstAccessibleStore = accessibleStores[0];
      console.log(
        "Auto-switching to accessible store:",
        firstAccessibleStore._id,
      );
      handleStoreSwitch(firstAccessibleStore._id);
    }
  }, [
    storesLoading,
    currentStore,
    isCurrentStoreAccessible,
    accessibleStores,
    handleStoreSwitch,
  ]);

  const handleStoreSwitchWithPermission = useCallback(
    (storeId) => {
      if (!canAccessStore(storeId)) {
        console.warn("User does not have access to store:", storeId);
        return;
      }
      console.log("Switching to store:", storeId);
      handleStoreSwitch(storeId);
    },
    [canAccessStore, handleStoreSwitch],
  );

  // Handle refetching stores when empty
  useEffect(() => {
    let timer;
    if (!storesLoading && (!stores || stores.length === 0)) {
      timer = setTimeout(() => {
        queryClient.invalidateQueries(["stores"]);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [storesLoading, stores, queryClient]);

  // ============ RENDER LOGIC ============

  if (storesLoading) {
    return (
      <div className="border-t border-gray-200 dark:border-gray-800 bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="animate-pulse flex items-center gap-2">
              <div className="h-8 w-40 bg-gray-300 dark:bg-gray-700 rounded-sm"></div>
            </div>
            <div className="animate-pulse flex items-center gap-2">
              <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No stores in system
  if (!stores || stores.length === 0) {
    return (
      <div className="border-t border-gray-200 dark:border-gray-800 bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-sm">
                <Store size={14} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  No stores available
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw
                  size={14}
                  className="text-blue-500 dark:text-blue-400 animate-spin"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Reloading...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has no access to any stores (not superadmin, not admin, and no assigned store)
  if (!hasStoreAccess) {
    return (
      <div className="border-t border-gray-200 dark:border-gray-800 bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-sm border border-red-200 dark:border-red-500/30 bg-linear-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 shadow-sm">
                <Lock size={14} className="text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  No Store Access
                </span>
                <AlertCircle
                  size={14}
                  className="text-red-600 dark:text-red-400 ml-1"
                  title="You are not assigned to any store. Contact your administrator."
                />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Contact administrator for access
              </span>
            </div>

            {/* Only superadmins and admins can manage stores */}
            {(isSuperadmin || isAdmin) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/admin/stores")}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Manage Stores
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User can only see ONE store (not superadmin/admin)
  const isSingleStoreUser =
    !isSuperadmin && !isAdmin && accessibleStores.length === 1;

  const canManageStores =
    isAdmin ||
    isSuperadmin ||
    hasPermission("stores.manage") ||
    canManageStore(currentStore?._id);
  const canViewInventory =
    hasPermission("inventory.view") || hasPermission("products.view");

  return (
    <div className="sticky top-0 z-40 border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center justify-between gap-3">
          <StoreSwitcher
            stores={accessibleStores}
            currentStore={currentStore}
            isAllStores={isAllStores}
            canViewAllStores={canViewAllStores}
            onSelectStore={handleStoreSwitchWithPermission}
            onSelectAll={handleSelectAllStores}
            label={isSingleStoreUser ? "Your store" : "Store"}
          />

          <div className="flex shrink-0 items-center gap-1">
            {canViewInventory && (
              <Link to="/admin/inventory" className={stripLinkClass}>
                <Package size={15} />
                <span className="hidden sm:inline">Inventory</span>
              </Link>
            )}
            {canManageStores && (
              <Link to="/admin/stores" className={stripLinkClass}>
                <Building2 size={15} />
                <span className="hidden sm:inline">Manage stores</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStoresLoading;
