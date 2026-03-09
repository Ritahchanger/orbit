import { useState, useEffect } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Search,
  Menu,
  X,
  ChevronDown,
  Plus,
  ShoppingBag,
  FileText,
  Shield,
} from "lucide-react";

import { useAuth } from "../../../context/authentication/AuthenticationContext";

import { useStoreContext } from "../../../context/store/StoreContext";

import { getAllowedNavItems } from "./data";

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
  const [showStoresMenu, setShowStoresMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allowedNavItems, setAllowedNavItems] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Toggle specific dropdown
  const toggleDropdown = (dropdownName) => {
    if (openDropdown === dropdownName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdownName);
      setShowNotifications(false);
      setShowUserMenu(false);
      setShowStoresMenu(false);
    }
  };

  // Toggle stores menu
  const toggleStoresMenu = () => {
    setShowStoresMenu(!showStoresMenu);
    setShowUserMenu(false);
    setShowNotifications(false);
  };

  // Handle store switching
  const handleStoreSwitch = (storeId) => {
    switchStore(storeId);
    setShowStoresMenu(false);
    toast.success("Store switched successfully");
    // Refresh page data based on new store
  };

  // Filter navigation items based on user role
  useEffect(() => {
    if (userRole) {
      const filteredItems = getAllowedNavItems(userRole);
      setAllowedNavItems(filteredItems);
    }
  }, [userRole]);

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

  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Only show navbar if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Admin Navbar - Fixed theming */}
      <nav className="fixed top-0 z-40 w-full bg-linear-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        {/* Top Navbar Row */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo */}
            <div className="flex items-center space-x-6 md:ml-[0.35rem]">
              <Logo />

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-1">
                {allowedNavItems.map((item) => {
                  const Icon = item.icon;

                  if (item.type === "link") {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`px-4 py-2.5 rounded-sm flex items-center space-x-2 transition-all duration-200 text-sm ${
                          active
                            ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-gray-800/50 hover:shadow-md"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-semibold text-sm">
                          {item.name}
                        </span>
                        {item.requiredRole && userRole !== "superadmin" && (
                          <Shield className="h-3 w-3 text-yellow-500" />
                        )}
                      </Link>
                    );
                  }
                  if (item.type === "dropdown") {
                    const dropdownKey = item.name
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                    const isDropdownOpen = openDropdown === dropdownKey;
                    const hasActiveChild = item.items.some((subItem) =>
                      isActive(subItem.path),
                    );

                    return (
                      <div key={item.name} className="relative">
                        <button
                          onClick={() => toggleDropdown(dropdownKey)}
                          className={`px-4 py-2.5 rounded-sm flex items-center space-x-2 transition-all duration-200 ${
                            hasActiveChild || isDropdownOpen
                              ? "bg-linear-to-r from-blue-600/20 to-indigo-600/20 text-blue-600 dark:text-white border border-blue-300 dark:border-blue-500/30"
                              : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-semibold text-sm">
                            {item.name}
                          </span>
                          <ChevronDown
                            className={`h-3 w-3 transition-transform duration-200 ${
                              isDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm shadow-2xl backdrop-blur-xl z-50 overflow-hidden">
                              {item.items
                                .filter(
                                  (subItem) =>
                                    !subItem.requiredRole ||
                                    userRole === "superadmin" ||
                                    userRole === "admin",
                                )
                                .map((subItem) => {
                                  const SubIcon = subItem.icon;
                                  const active = isActive(subItem.path);
                                  return (
                                    <Link
                                      key={subItem.name}
                                      to={subItem.path}
                                      className={`flex items-center px-4 py-3 text-sm transition-colors duration-150 ${
                                        active
                                          ? "bg-linear-to-r from-blue-50 to-blue-100 dark:from-blue-600/20 dark:to-indigo-600/20 text-blue-600 dark:text-white border-l-2 border-blue-500"
                                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                                      }`}
                                      onClick={() => setOpenDropdown(null)}
                                    >
                                      <SubIcon className="h-4 w-4 mr-3" />
                                      {subItem.name}
                                      {subItem.requiredRole &&
                                        userRole !== "superadmin" && (
                                          <Shield className="h-3 w-3 ml-auto text-yellow-500" />
                                        )}
                                    </Link>
                                  );
                                })}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="search-btn p-2.5 rounded-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                title="Search"
                id="admin-search-btn"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <ThemeButton />

              {/* Add Product Button - Only for superadmin */}
              {userRole === "superadmin" && (
                <button
                  onClick={() => dispatch(openModal())}
                  className="hidden px-4 py-2.5 rounded-sm bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 md:flex items-center space-x-2 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-semibold text-sm">Add Product</span>
                </button>
              )}

              {/* Reports Link - Only for superadmin and admin */}
              {(userRole === "superadmin" || userRole === "admin") && (
                <Link
                  to="/admin/ecommerce"
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-sm bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
                  title="Switch to POS"
                >
                  <ShoppingBag size={16} />
                  <span className="font-semibold text-sm hidden xl:inline">
                    Ecommerce
                  </span>
                </Link>
              )}
              {(userRole === "superadmin" || userRole === "admin") && (
                <Link
                  to="/admin/reports"
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-sm bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
                >
                  <FileText size={16} />
                  <span className="font-semibold text-sm">Reports</span>
                </Link>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-all duration-200 mr-[-1rem] rounded-sm"
                >
                  <CustomerAvatar
                    name={`${user?.firstName.charAt(0) || ""} ${user?.lastName.charAt(0) || ""}`.trim()}
                    size="sm"
                    className="shrink-0 mr-[-0.5rem]"
                  />
                  <div className="hidden lg:block text-left"></div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {showUserMenu && (
                  <ShowUserMenu
                    setShowUserMenu={setShowUserMenu}
                    user={user}
                    userRole={userRole}
                    handleLogout={handleLogout}
                  />
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mr-[-0.93rem] lg:hidden p-2.5 rounded-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-gray-800/50 transition-all duration-200"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
          toggleStoresMenu={toggleStoresMenu}
          showStoresMenu={showStoresMenu}
          setShowStoresMenu={setShowStoresMenu}
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
