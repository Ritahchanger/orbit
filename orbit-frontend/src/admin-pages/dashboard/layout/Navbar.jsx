import { useState, useEffect, useMemo } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { Search, Menu, X, ChevronDown, Plus, ShoppingBag } from "lucide-react";

import { useAuth } from "../../../context/authentication/AuthenticationContext";

import { useStoreContext } from "../../../context/store/StoreContext";

import { getAllowedNavItems, isNavItemActive } from "./data";

import NavItemLink from "./NavItemLink";

import { useDispatch } from "react-redux";

import { toast } from "react-hot-toast";

import { openModal } from "../../products/redux/add-product-modal-slice";

import AdminSearchModal from "../components/AdminSearchModal";

import ShowUserMenu from "../components/ShowUserMenu";

import MobileMenuOpen from "../components/MobileMenuOpen";

import AdminStoresLoading from "../components/AdminStoresLoading";

import Logo from "./Logo";

import CustomerAvatar from "../../customers/CustomerAvatar";

import ThemeButton from "./ThemeButton";

import { openPosModal } from "../../pos/slice/pos-slice";

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, userRole, logout, isAuthenticated } = useAuth();

  // Store context
  const {
    stores,
    currentStore,
    isLoading: storesLoading,
    switchStore,
  } = useStoreContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allowedNavItems = useMemo(
    () => getAllowedNavItems(userRole),
    [userRole],
  );
  const canUsePos = userRole === "superadmin" || userRole === "admin";

  // Escape closes the user menu and the mobile menu
  useEffect(() => {
    if (!showUserMenu && !isMobileMenuOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowUserMenu(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showUserMenu, isMobileMenuOpen]);

  // Handle store switching
  const handleStoreSwitch = (storeId) => {
    switchStore(storeId);
    toast.success("Store switched successfully");
    // Refresh page data based on new store
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", error);
    }
  };

  // Active on the item's page and on pages under it
  const isActive = (path) => isNavItemActive(location.pathname, path);

  // Only show navbar if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 z-40 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Top Navbar Row */}
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left side - Logo and menu */}
            <div className="flex min-w-0 items-center gap-6">
              <Logo />

              <div className="hidden min-w-0 items-center gap-1 overflow-x-auto lg:flex">
                {allowedNavItems.map((item) => (
                  <NavItemLink
                    key={item.path}
                    item={item}
                    active={isActive(item.path)}
                  />
                ))}
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="search-btn rounded-sm p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                title="Search"
                id="admin-search-btn"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <ThemeButton />

              {userRole === "superadmin" && (
                <button
                  type="button"
                  onClick={() => dispatch(openModal())}
                  className="hidden items-center gap-2 rounded-sm border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 md:flex dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4" />
                  Add product
                </button>
              )}

              {canUsePos && (
                <button
                  type="button"
                  onClick={() => dispatch(openPosModal())}
                  className="hidden items-center gap-2 rounded-sm bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 md:flex"
                  title="Open point of sale"
                >
                  <ShoppingBag size={16} />
                  POS
                </button>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-haspopup="menu"
                  aria-expanded={showUserMenu}
                  aria-label="Account menu"
                  className="flex items-center gap-1 rounded-sm p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <CustomerAvatar
                    name={[user?.firstName?.charAt(0), user?.lastName?.charAt(0)]
    .filter(Boolean)
    .join(" ")}
                    size="sm"
                    className="shrink-0"
                  />
                  <ChevronDown
                    className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-gray-400 ${showUserMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {showUserMenu && (
                  <ShowUserMenu
                    setShowUserMenu={setShowUserMenu}
                    user={user}
                    userRole={userRole}
                    handleLogout={handleLogout}
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                className="rounded-sm p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* STORE STRIP - Bottom of Navbar */}
        <AdminStoresLoading
          storesLoading={storesLoading}
          stores={stores}
          currentStore={currentStore}
          handleStoreSwitch={handleStoreSwitch}
          userRole={userRole}
        />

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <MobileMenuOpen
            allowedNavItems={allowedNavItems}
            isActive={isActive}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            currentStore={currentStore}
            stores={stores}
            handleStoreSwitch={handleStoreSwitch}
            userRole={userRole}
            handleLogout={handleLogout}
          />
        )}
      </nav>

      {/* Search Modal - Gaming Theme */}
      {showSearchModal && (
        <AdminSearchModal
          showSearchModal={showSearchModal}
          setShowSearchModal={setShowSearchModal}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
    </>
  );
};

export default AdminNavbar;
