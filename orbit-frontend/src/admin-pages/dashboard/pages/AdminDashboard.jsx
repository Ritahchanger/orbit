  import { useState, useEffect, useRef, useMemo } from "react";
  import { useDailySummary } from "../../hooks/sales.hooks";
  import { ShoppingCart, Filter, Store, AlertCircle } from "lucide-react";
  import { format } from "date-fns";

  import AdminLayout from "../layout/Layout";

  import AdminDailyProducts from "../components/AdminDailyProducts";

  import { useAuth } from "../../../context/authentication/AuthenticationContext";

  import {

    useStoreContext,

    useStoreId,
    
  } from "../../../context/store/StoreContext";

  import SummaryCards from "../components/SummaryCards";

  import { useNavigate } from "react-router-dom";

  import { useRole } from "../../../context/authentication/RoleContext";

  import { toast } from "react-hot-toast";

  import AdminHeader from "../components/AdminHeader";

  import AdminLoadingSales from "../components/AdminLoadingSales";

  import ErrorLoadingSales from "../components/ErrorLoadingSales";

  import ProfitabilitySummary from "../components/ProfitabilitySummary";

  import AdminFooterNote from "../components/AdminFooterNote";

  import AdminStoreComparison from "../components/AdminStoreComparison";

  const AdminDashboard = () => {
    
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [dateString, setDateString] = useState(
      format(new Date(), "yyyy-MM-dd"),
    );

    const [selectedStoreId, setSelectedStoreId] = useState("");

    const { user, userRole } = useAuth();

    const { stores, isLoading: storesLoading } = useStoreContext();

    const storeId = useStoreId();

    const {
      canAccessStore,
      canAccessAllStores,
      isAdmin,
      isSuperadmin,
      isManager,
    } = useRole();

    const dailyItemsRef = useRef(null);

    const accessibleStores = useMemo(() => {
      if (!stores || stores.length === 0) return [];

      if (isAdmin || isSuperadmin || canAccessAllStores) {
        return stores;
      }

      const filteredStores = stores.filter((store) => {
        if (user?.assignedStore && store._id === user.assignedStore) {
          return true;
        }

        return canAccessStore(store._id);
      });

      return filteredStores;
    }, [
      stores,
      isAdmin,
      isSuperadmin,
      canAccessAllStores,
      canAccessStore,
      user?.assignedStore,
    ]);

    const primaryStore = useMemo(() => {
      if (user?.assignedStore && stores && stores.length > 0) {
        const foundStore = stores.find((s) => s._id === user.assignedStore);
        if (foundStore) {
          return foundStore;
        }
      }

      if (accessibleStores.length > 0) {
        return accessibleStores[0];
      }

      return null;
    }, [user?.assignedStore, stores, accessibleStores]);

    const effectiveStoreId = useMemo(() => {
      if (!isAdmin && !isSuperadmin && !canAccessAllStores) {
        if (selectedStoreId && selectedStoreId !== "all") {
          if (canAccessStore(selectedStoreId)) {
            return selectedStoreId;
          }
        }

        return primaryStore?._id || null;
      }

      if (selectedStoreId === "all") {
        return "all";
      }

      if (selectedStoreId && selectedStoreId !== "all") {
        return selectedStoreId;
      }

      if (storeId && canAccessStore(storeId)) {
        return storeId;
      }
      return primaryStore?._id || null;
    }, [
      selectedStoreId,
      storeId,
      canAccessStore,
      primaryStore,
      isAdmin,
      isSuperadmin,
      canAccessAllStores,
    ]);

    const isViewingAllStores = useMemo(() => {
      return effectiveStoreId === "all" && (isAdmin || isSuperadmin);
    }, [effectiveStoreId, isAdmin, isSuperadmin]);

    const actualStoreLabel = useMemo(() => {
      if (effectiveStoreId === "all") {
        return isAdmin || isSuperadmin ? "All Stores" : "My Store Data";
      }
      if (!effectiveStoreId) return "No store selected";

      const store = stores?.find((s) => s._id === effectiveStoreId);
      return store ? `${store.name} (${store.code})` : "Store";
    }, [effectiveStoreId, stores, isAdmin, isSuperadmin]);

    const hasMultipleStoresAccess = useMemo(() => {
      return (
        (isAdmin || isSuperadmin || canAccessAllStores) &&
        accessibleStores.length > 1
      );
    }, [isAdmin, isSuperadmin, canAccessAllStores, accessibleStores]);

    useEffect(() => {
      if (!storesLoading && stores && stores.length > 0 && !selectedStoreId) {
        if (!isAdmin && !isSuperadmin && !canAccessAllStores) {
          if (primaryStore) {
            console.log(
              "Setting selected store to primary store for non-admin:",
              primaryStore.name,
            );
            setSelectedStoreId(primaryStore._id);
          } else if (accessibleStores.length > 0) {
            console.log(
              "Setting selected store to first accessible store:",
              accessibleStores[0].name,
            );
            setSelectedStoreId(accessibleStores[0]._id);
          }
        } else if ((isAdmin || isSuperadmin) && canAccessAllStores) {
          console.log('Admin user - defaulting to "all" stores');
          setSelectedStoreId("all");
        } else if (accessibleStores.length > 0) {
          console.log(
            "Setting selected store to first accessible store:",
            accessibleStores[0].name,
          );
          setSelectedStoreId(accessibleStores[0]._id);
        }
      }
    }, [
      storesLoading,
      stores,
      selectedStoreId,
      primaryStore,
      accessibleStores,
      isAdmin,
      isSuperadmin,
      canAccessAllStores,
    ]);

    const formatCurrency = (amount) => {
      if (!amount && amount !== 0) return "KSh 0";
      return `KSh ${amount.toLocaleString()}`;
    };

    const getStoreDetails = (storeId) => {
      if (!storeId || !stores || stores.length === 0) return null;
      return stores.find((s) => s._id === storeId);
    };

    const {
      data: dailyData,
      isLoading: dailyLoading,
      isError: dailyError,
      error: dailyFetchError,
      refetch,
    } = useDailySummary({
      date: selectedDate,
      storeId: effectiveStoreId,
    });

    useEffect(() => {
      if (!dailyLoading && dailyData?.data?.itemsSold && dailyItemsRef.current) {
        setTimeout(() => {
          const element = dailyItemsRef.current;
          if (element) {
            const elementTop =
              element.getBoundingClientRect().top + window.scrollY;
            const offset = 160;
            window.scrollTo({
              top: elementTop - offset,
              behavior: "smooth",
            });
          }
        }, 100);
      }
    }, [dailyLoading, dailyData]);

    const navigateToInventory = () => {
      if (!isAdmin && !isSuperadmin && !isManager) {
        toast.error("You don't have permission to access inventory");
        return;
      }
      navigate("/admin/inventory");
    };

    const handleDateChange = (e) => {
      const newDate = new Date(e.target.value);
      setSelectedDate(newDate);
      setDateString(e.target.value);
    };

    const handleTodayClick = () => {
      const today = new Date();
      setSelectedDate(today);
      setDateString(format(today, "yyyy-MM-dd"));
    };

    const handleStoreChange = (e) => {
      const value = e.target.value;
      setSelectedStoreId(value);
    };

    const handleExportCSV = () => {
      if (!dailyData?.data?.itemsSold) return;

      if (!isAdmin && !isSuperadmin && !isManager) {
        toast.error("You don't have permission to export data");
        return;
      }

      // Get store label for filename
      let storeLabel = "all-stores";
      const isViewingAllStores = effectiveStoreId === "all";

      if (effectiveStoreId && effectiveStoreId !== "all") {
        const store = stores?.find((s) => s._id === effectiveStoreId);
        storeLabel = store?.code || "store";
      } else if (isViewingAllStores && !isAdmin && !isSuperadmin) {
        storeLabel = primaryStore?.code || "my-store";
      }

      const headers = [
        "Store",
        "Product Name",
        "SKU",
        "Quantity Sold",
        "Buying Price",
        "Selling Price",
        "Revenue",
        "Profit",
        "Profit Margin",
      ];

      const csvData = dailyData.data.itemsSold.map((item) => [
        item.storeName || actualStoreLabel,
        item.productName,
        item.sku,
        item.totalQuantitySold,
        `KSh ${item.buyingPrice?.toLocaleString() || "0"}`,
        `KSh ${item.sellingPrice?.toLocaleString() || "0"}`,
        `KSh ${item.totalRevenue?.toLocaleString() || "0"}`,
        `KSh ${item.totalProfit?.toLocaleString() || "0"}`,
        `${item.profitMargin || 0}%`,
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily-sales-${storeLabel}-${dateString}.csv`;
      a.click();
    };

    const getSelectValue = () => {
      if (selectedStoreId) return selectedStoreId;
      if (primaryStore) return primaryStore._id;
      return accessibleStores.length > 0 ? accessibleStores[0]._id : "all";
    };

    const navigateToAllProducts = () => {
      if (!isAdmin && !isSuperadmin && !isManager) {
        toast.error("You don't have permission to view all products");
        return;
      }
      navigate("/admin/products");
    };

    const getStoreOptions = () => {
      const options = [];

      if (isAdmin || isSuperadmin) {
        options.push({
          value: "all",
          label: "All Stores",
          description: "View all stores",
        });
      } else {
      }

      accessibleStores.forEach((store) => {
        options.push({
          value: store._id,
          label: `${store.name} (${store.code})`,
          description: store.address?.street || "Store",
        });
      });

      return options;
    };

    const isLoading = dailyLoading;
    const isError = dailyError;
    const error = dailyFetchError;

    if (isLoading) {
      return <AdminLoadingSales actualStoreLabel={actualStoreLabel} />;
    }

    if (isError) {
      return <ErrorLoadingSales error={error} refetch={refetch} />;
    }

    const summary = dailyData?.data;
    const itemsSold = summary?.itemsSold || [];
    const storeOptions = getStoreOptions();

    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
          <AdminHeader
            handleDateChange={handleDateChange}
            isAdmin={isAdmin}
            isSuperadmin={isSuperadmin}
            primaryStore={primaryStore}
            storeOptions={storeOptions}
            isViewingAllStores={isViewingAllStores}
            getSelectValue={getSelectValue}
            dateString={dateString}
            handleStoreChange={handleStoreChange}
            handleTodayClick={handleTodayClick}
            itemsSold={itemsSold}
            handleExportCSV={handleExportCSV}
            navigateToInventory={navigateToInventory}
            navigateToAllProducts={navigateToAllProducts}
            selectedDate={selectedDate}
            format={format}
            actualStoreLabel={actualStoreLabel}
            isManager={isManager}
          />
          {!isAdmin && !isSuperadmin && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-sm">
              <div className="flex items-start gap-3">
                <Store className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 dark:text-blue-300 font-medium">
                    Manager Dashboard
                  </p>
                  <p className="text-blue-700 dark:text-blue-300/80 text-sm mt-1">
                    You're viewing data from your assigned store:{" "}
                    <span className="text-gray-900 dark:text-white font-medium">
                      {primaryStore?.name}
                    </span>
                  </p>
                  {isViewingAllStores && (
                    <p className="text-blue-600 dark:text-blue-300/70 text-xs mt-1">
                      <AlertCircle className="inline h-3 w-3 mr-1" />
                      "My Store Data" shows sales from your assigned store only
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <SummaryCards
            summary={summary}
            formatCurrency={formatCurrency}
            itemsSold={itemsSold}
            storeLabel={actualStoreLabel}
          />

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Products Sold Today
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {format(selectedDate, "MMMM d, yyyy")} • {actualStoreLabel}
                    {!isAdmin && !isSuperadmin && (
                      <span className="ml-2 text-blue-600 dark:text-blue-400 text-xs">
                        <Store size={10} className="inline mr-1" />
                        Manager View
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Filter className="h-4 w-4" />
                  <span>{itemsSold.length} items</span>
                  {!isViewingAllStores && (
                    <span className="text-blue-600 dark:text-blue-400">
                      • Store View
                    </span>
                  )}
                </div>
              </div>
            </div>

            {itemsSold.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 dark:text-gray-700 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-1">
                  No sales recorded today
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  No products were sold on {format(selectedDate, "MMMM d, yyyy")}
                  {!isViewingAllStores && ` for ${actualStoreLabel}`}
                </p>
              </div>
            ) : (
              <AdminDailyProducts
                itemsSold={itemsSold}
                formatCurrency={formatCurrency}
                summary={summary}
                dailyItemsRef={dailyItemsRef}
                storeId={effectiveStoreId}
                isManagerView={!isAdmin && !isSuperadmin}
              />
            )}
          </div>

          {itemsSold.length > 0 && (
            <ProfitabilitySummary
              isAdmin={isAdmin}
              isSuperadmin={isSuperadmin}
              itemsSold={itemsSold}
              formatCurrency={formatCurrency}
            />
          )}

          <AdminStoreComparison
            hasMultipleStoresAccess={hasMultipleStoresAccess}
            effectiveStoreId={effectiveStoreId}
            setSelectedStoreId={setSelectedStoreId}
            isAdmin={isAdmin}
            isSuperadmin={isSuperadmin}
          />

          <AdminFooterNote
            actualStoreLabel={actualStoreLabel}
            isAdmin={isAdmin}
            isSuperadmin={isSuperadmin}
            format={format}
            useRole={userRole}
            isViewingAllStores={isViewingAllStores}
          />
        </div>
      </AdminLayout>
    );
  };

  export default AdminDashboard;
