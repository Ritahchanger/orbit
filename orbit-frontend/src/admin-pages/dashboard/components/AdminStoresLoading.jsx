import { useEffect, useCallback, useMemo, useRef } from "react";
import { Store, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../context/permissions/permissions-context";
import { useAuth } from "../../../context/authentication/AuthenticationContext";
import { useQueryClient } from "@tanstack/react-query";
import StoresControls from "./StoresControls";
import { useRole } from "../../../context/authentication/RoleContext";
import { useDispatch } from "react-redux";
import { openCategoriesModal } from "../../../store/features/categoryModalSlice";
const AdminStoresLoading = ({
  storesLoading,
  stores,
  currentStore,
  handleStoreSwitch,
  toggleStoresMenu,
  showStoresMenu,
  setShowStoresMenu,
}) => {
  const { hasPermission, getStorePermissions: getPermissionsForStore } =
    usePermissions();

  const dispatch = useDispatch();

  const { isSuperadmin, isAdmin, user } = useAuth();
  const {
    canAccessStore: roleCanAccessStore,
    canManageStore: roleCanManageStore,
  } = useRole();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const handleQuickSwitch = useCallback(
    (storeId) => {
      handleStoreSwitchWithPermission(storeId);
      setShowStoresMenu(false);
    },
    [handleStoreSwitchWithPermission, setShowStoresMenu],
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
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-sm">
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

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: Current Store */}
          <div
            className={`flex items-center gap-3 ${isSingleStoreUser ? "min-w-[420px]" : "min-w-[300px]"}`}
          >
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-sm border shadow-sm ${
                isCurrentStoreAccessible
                  ? "border-blue-200 dark:border-blue-500/30 bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
                  : "border-yellow-200 dark:border-yellow-500/30 bg-linear-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20"
              }`}
            >
              <Store
                size={16}
                className={
                  isCurrentStoreAccessible
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }
              />
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isSingleStoreUser ? "Your Store:" : "Current:"}
                </span>
                <span className="relative group">
                  <span
                    className={`text-sm font-semibold ${
                      isCurrentStoreAccessible
                        ? "text-blue-700 dark:text-blue-400"
                        : "text-yellow-700 dark:text-yellow-400"
                    }`}
                  >
                    {currentStore?.name
                      ? currentStore.name.length > 20
                        ? `${currentStore.name.substring(0, 18)}...`
                        : currentStore.name
                      : "No store selected"}
                  </span>
                  {currentStore?.name && currentStore.name.length > 20 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block z-50">
                      <div className="bg-gray-900 text-white text-xs rounded-sm py-1.5 px-2.5 whitespace-nowrap shadow-lg">
                        {currentStore.name}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  )}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-1.5 py-0.5 rounded">
                {currentStore?.code || "N/A"}
              </span>
              {!isCurrentStoreAccessible && currentStore && (
                <AlertCircle
                  size={14}
                  className="text-yellow-600 dark:text-yellow-400 animate-pulse"
                  title="Auto-switching to accessible store..."
                />
              )}
            </div>

            {/* Store Products button for single store users */}
            {isSingleStoreUser && (
              <button
                className="px-4 py-2 rounded-sm text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 
                          bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm
                          hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => navigate("/admin/inventory")}
              >
                <Store size={14} />
                MANAGE STORES
              </button>
            )}
          </div>

          {/* Center: Store Scrollable Strip (only show for superadmins/admins or users with multiple stores) */}
          {hasMultipleAccessibleStores && (
            <div className="hidden lg:flex flex-1 mx-6 relative">
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {accessibleStores.map((store) => {
                  const isCurrent = currentStore?._id === store._id;
                  const permissions = getPermissionsForStore(store._id);

                  return (
                    <div
                      key={store._id}
                      className="relative flex-shrink-0 group"
                    >
                      <button
                        onClick={() =>
                          handleStoreSwitchWithPermission(store._id)
                        }
                        className={`px-3 py-2 rounded-sm text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 shadow-sm ${
                          isCurrent
                            ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-500/30"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700"
                        }`}
                        title={`Switch to ${store.name}`}
                      >
                        <Store size={14} />
                        <span className="font-medium">{store.code}</span>
                        {store.manager && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        )}
                        <div className="flex gap-0.5 ml-1">
                          {permissions.canManage && (
                            <span className="w-2 h-2 rounded-sm bg-blue-500"></span>
                          )}
                          {permissions.canSell && (
                            <span className="w-2 h-2 rounded-sm bg-green-500"></span>
                          )}
                          {permissions.canEdit && (
                            <span className="w-2 h-2 rounded-sm bg-yellow-500"></span>
                          )}
                        </div>
                      </button>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
                        <div className="bg-gray-900 text-white text-xs rounded-sm py-1.5 px-2.5 whitespace-nowrap shadow-lg">
                          {store.name}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Store Products button for users with multiple stores */}
                {(hasPermission("inventory.view") ||
                  hasPermission("products.view")) && (
                  <button
                    className="px-4 py-2 rounded-sm text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 
                              bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm
                              hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => navigate("/admin/inventory")}
                  >
                    <Store size={14} />
                    MANAGE STORES
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Product Categories Button */}
          {/* Product Categories Button */}
          <button
            className="px-4 py-2 rounded-sm text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 
            bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-sm
            hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 mr-[2rem]"
            onClick={() => {
              dispatch(openCategoriesModal()); // This dispatches the action
            }}
          >
            <span>📦</span>
            PRODUCT CATEGORIES
          </button>
          {/* Right: Store Controls (only show for superadmins/admins or users with multiple stores) */}
          {hasMultipleAccessibleStores && (
            <StoresControls
              accessibleStores={accessibleStores}
              stores={stores}
              hasMultipleAccessibleStores={hasMultipleAccessibleStores}
              showStoresMenu={showStoresMenu}
              toggleStoresMenu={toggleStoresMenu}
              setShowStoresMenu={setShowStoresMenu}
              handleQuickSwitch={handleQuickSwitch}
              isAdmin={isAdmin}
              isSuperadmin={isSuperadmin}
              hasPermission={hasPermission}
              canManageStore={canManageStore}
              currentStore={currentStore}
              canAccessStore={canAccessStore}
              getPermissionsForStore={getPermissionsForStore}
              filteredStores={accessibleStores}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStoresLoading;
