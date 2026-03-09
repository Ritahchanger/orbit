import { useDispatch } from "react-redux";
import { openPosModal } from "../../pos/slice/pos-slice";
import { useStoreContext } from "../../../context/store/StoreContext";
import { openModal } from "../../products/redux/add-product-modal-slice";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Keyboard, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { keyboardShortcuts, getAccessibleShortcuts } from "./data";
import { usePermissionCheck } from "../../../context/RolePermissionContext";
import { useRoleContext } from "../../../context/RolePermissionContext";
const ShortcutsOverlay = () => {
  const dispatch = useDispatch();
  const { currentStore } = useStoreContext();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [recentShortcuts, setRecentShortcuts] = useState([]);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Permission hooks
  const { hasPermission } = usePermissionCheck();
  const { userRoleName, userPermissions } = useRoleContext();

  // Get accessible shortcuts based on user role and permissions
  const accessibleShortcuts = getAccessibleShortcuts(
    userRoleName,
    userPermissions,
  );

  const handleShortcutAction = (action) => {
    // Find the shortcut to check permissions
    const shortcut = keyboardShortcuts.find((s) => s.action === action);

    // Check if user has permission to use this shortcut
    if (shortcut) {
      // Superadmin always has access
      if (userRoleName !== "superadmin") {
        // Check role-based access
        if (shortcut.roles && !shortcut.roles.includes(userRoleName)) {
          toast.error("You don't have permission to use this shortcut");
          return;
        }

        // Check permission-based access
        if (shortcut.permission && !hasPermission(shortcut.permission)) {
          toast.error("You don't have permission to use this shortcut");
          return;
        }
      }
    }

    // Add to recent shortcuts
    setRecentShortcuts((prev) => {
      const updated = [action, ...prev.filter((a) => a !== action)].slice(0, 4);
      return updated;
    });

    switch (action) {
      case "posModal":
        if (!currentStore) {
          toast.error("Please select a store first");
          return;
        }
        dispatch(openPosModal());
        toast.success("POS opened");
        break;
      case "focusSearch":
        const searchInput = document.querySelector(
          'input[type="search"], input[placeholder*="search" i], input[placeholder*="Search"], [aria-label*="search" i]',
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
          toast.success("Search focused");
        } else {
          toast.error("No search input found");
        }
        break;
      case "calculator":
        const calculatorBtn = document.querySelector(
          '[aria-label*="calculator" i], [title*="calculator" i], button:has(svg[aria-label*="Calculator"])',
        );
        if (calculatorBtn) {
          calculatorBtn.click();
          toast.success("Calculator opened");
        } else {
          toast.error("Calculator button not found");
        }
        break;
      case "scrollTop":
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.success("Scrolled to top");
        break;
      case "searchModal":
        const searchButton = document.querySelector(
          '.search-btn, [aria-label*="search"], [title*="search"], #admin-search-btn, button:has(svg[aria-label*="Search"])',
        );
        if (searchButton) {
          searchButton.click();
          toast.success("Search opened");
        } else {
          toast.error("Search button not found");
        }
        break;
      case "scrollBottom":
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
        toast.success("Scrolled to bottom");
        break;
      case "dashboard":
        navigate("/admin/dashboard");
        toast.success("Navigated to Dashboard");
        break;
      case "transactions":
        navigate("/admin/transactions");
        toast.success("Navigated to Transactions");
        break;
      case "refresh":
        window.location.reload();
        break;
      case "helpModal":
        window.dispatchEvent(new CustomEvent("open-help-modal"));
        toast.success("Help modal opened");
        break;
      case "productModal":
        dispatch(openModal());
        toast.success("Add product modal opened");
        break;
      case "users":
        navigate("/admin/workers");
        toast.success("Navigated to Users");
        break;
      case "stores":
        navigate("/admin/stores");
        toast.success("Navigated to Stores");
        break;
      case "settings":
        navigate("/admin/settings/permissions");
        toast.success("Navigated to Settings");
        break;
      case "roles":
        navigate("/admin/settings/permissions");
        toast.success("Navigated to Roles & Permissions");
        break;
      case "toggleShortcuts":
        setShowShortcuts(!showShortcuts);
        if (!showShortcuts) {
          toast.success("Keyboard shortcuts opened");
        }
        break;
      case "close":
        setShowShortcuts(false);
        toast.success("Shortcuts closed");
        break;
      default:
        break;
    }
  };

  // Handle keyboard shortcuts with permission checks
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "p":
            e.preventDefault();
            handleShortcutAction("posModal");
            break;
          case "b":
            e.preventDefault();
            handleShortcutAction("focusSearch");
            break;
          case "c":
            e.preventDefault();
            handleShortcutAction("calculator");
            break;
          case "n":
            e.preventDefault();
            handleShortcutAction("productModal");
            break;
          case "t":
            e.preventDefault();
            handleShortcutAction("scrollTop");
            break;
          case "l":
            e.preventDefault();
            handleShortcutAction("scrollBottom");
            break;
          case "h":
            e.preventDefault();
            handleShortcutAction("dashboard");
            break;
          case "k":
            e.preventDefault();
            handleShortcutAction("searchModal");
            break;
          case "?":
            e.preventDefault();
            handleShortcutAction("helpModal");
            break;
          case "r":
            e.preventDefault();
            handleShortcutAction("refresh");
            break;
          case "/":
            e.preventDefault();
            handleShortcutAction("toggleShortcuts");
            break;
          case "u":
            e.preventDefault();
            handleShortcutAction("users");
            break;
          case "m":
            e.preventDefault();
            handleShortcutAction("stores");
            break;
        }
      } else if (e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case "t":
            e.preventDefault();
            handleShortcutAction("transactions");
            break;
          case "s":
            e.preventDefault();
            handleShortcutAction("settings");
            break;
          case "r":
            e.preventDefault();
            handleShortcutAction("roles");
            break;
         
        }
      } else if (e.key === "Escape") {
        handleShortcutAction("close");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStore, userRoleName]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Hide overlay on scroll
  useEffect(() => {
    let lastScrollTop = 0;
    let scrollTimeout;

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTop && scrollTop > 100) {
        setIsVisible(false);
      } else if (scrollTop < lastScrollTop) {
        setIsVisible(true);
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Auto-hide shortcuts after 10 seconds
  useEffect(() => {
    let timeout;
    if (showShortcuts) {
      timeout = setTimeout(() => {
        setShowShortcuts(false);
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [showShortcuts]);

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isVisible && !showShortcuts) return null;

  // Group shortcuts by category for better organization
  const groupedShortcuts = accessibleShortcuts.reduce((acc, shortcut) => {
    const category = shortcut.permission?.split(".")[0] || "general";
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {});

  return (
    <>
      {/* Keyboard Shortcuts Toggle Button */}
      <button
        onClick={() => setShowShortcuts(!showShortcuts)}
        className="fixed bottom-4 right-16 z-[30] p-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-blue-500/20 dark:shadow-blue-500/30 transition-all duration-300 hover:scale-110 group border border-white/10 dark:border-white/20"
        aria-label="Keyboard shortcuts"
        title="Toggle keyboard shortcuts (Ctrl + /)"
      >
        <Keyboard size={18} />
        <span className="absolute top-0 right-full mr-2 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-gray-200 dark:border-gray-700 shadow-sm">
          Shortcuts (Ctrl + /)
        </span>
      </button>

      {/* Keyboard Shortcuts Overlay */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[40] transition-all duration-300 ease-in-out ${
          showShortcuts
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-gray-900/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="py-3 sm:py-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Keyboard
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      Keyboard Shortcuts
                    </h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Press shortcuts or click to activate
                      </p>
                      <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                        {userRoleName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Time and Close */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {formatTime(currentTime)}
                  </div>
                  <button
                    onClick={() => setShowShortcuts(false)}
                    className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                    aria-label="Close shortcuts"
                  >
                    <X
                      size={18}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    />
                  </button>
                </div>
              </div>

              {/* Recent Shortcuts */}
              {recentShortcuts.length > 0 && (
                <div className="mb-3 sm:mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recently Used:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentShortcuts.map((action, index) => {
                      const shortcut = keyboardShortcuts.find(
                        (s) => s.action === action,
                      );
                      return shortcut ? (
                        <button
                          key={index}
                          onClick={() => handleShortcutAction(shortcut.action)}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-700 transition-colors group"
                        >
                          <shortcut.icon
                            size={14}
                            className={`${shortcut.color} group-hover:scale-110 transition-transform`}
                          />
                          <div>
                            <kbd className="text-xs font-mono bg-gray-100 dark:bg-gray-900 px-1.5 py-1 rounded text-gray-700 dark:text-gray-300">
                              {shortcut.key}
                            </kbd>
                            <span className="ml-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                              {shortcut.description}
                            </span>
                          </div>
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Main Shortcuts Grid - Only show accessible shortcuts */}
              <div className="space-y-4">
                {Object.entries(groupedShortcuts).map(
                  ([category, shortcuts]) => (
                    <div key={category}>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                        {shortcuts.map((shortcut, index) => {
                          const Icon = shortcut.icon;
                          return (
                            <button
                              key={index}
                              onClick={() =>
                                handleShortcutAction(shortcut.action)
                              }
                              className="group flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-[1.02] hover:border-gray-300 dark:hover:border-gray-600"
                              title={`${shortcut.description} (${shortcut.key})`}
                            >
                              <div
                                className={`p-1.5 sm:p-2 rounded-md bg-white dark:bg-gray-800 ${shortcut.color} group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors`}
                              >
                                <Icon size={16} className="sm:w-5 sm:h-5" />
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors truncate">
                                  {shortcut.description}
                                </div>
                                <kbd className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-1.5 py-1 rounded mt-1 inline-block">
                                  {shortcut.key}
                                </kbd>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Store Indicator */}
              {currentStore && (
                <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Active Store:
                        </span>
                        <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-white">
                          {currentStore.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Quick access:{" "}
                      <kbd className="px-1.5 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300 ml-1">
                        Ctrl + P
                      </kbd>{" "}
                      for POS
                    </div>
                  </div>
                </div>
              )}

              {/* Permission Info */}
              {userRoleName !== "superadmin" && (
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Some shortcuts may be hidden based on your permissions
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Helper - Shows when shortcuts are hidden */}
      {!showShortcuts && isVisible && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[9999] animate-pulse">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center space-x-2">
              <Keyboard
                size={14}
                className="text-blue-600 dark:text-blue-400"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Press{" "}
                <kbd className="px-1.5 py-1 bg-gray-100 dark:bg-gray-900 rounded text-gray-700 dark:text-gray-300 mx-1">
                  Ctrl + /
                </kbd>{" "}
                for shortcuts
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShortcutsOverlay;
