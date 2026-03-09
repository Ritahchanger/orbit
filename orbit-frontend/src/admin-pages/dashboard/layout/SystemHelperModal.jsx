// SystemHelperModal.jsx
import { useState, useEffect } from "react";
import {
  HelpCircle,
  X,
  ExternalLink,
  Bell,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  Shield,
  FileText,
  Package,
  CreditCard,
  Building,
  Database,
  Search,
  TrendingUp,
  Store,
  UserCog,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { useRoleContext } from "../../../context/RolePermissionContext";
import { usePermissionCheck } from "../../../context/RolePermissionContext";

const SystemHelperModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("quicktips");

  // Permission hooks
  const { userRoleName, userPermissions } = useRoleContext();
  const { hasPermission } = usePermissionCheck();

  // Check if user can see profit-related tips
  const canViewProfit =
    hasPermission("reports.profit.view") ||
    hasPermission("transactions.profit.view") ||
    userRoleName === "superadmin";

  // Check if user can see user management
  const canViewUsers =
    hasPermission("users.view") ||
    userRoleName === "superadmin" ||
    userRoleName === "admin";

  // Check if user can see stores
  const canViewStores =
    hasPermission("stores.view") ||
    userRoleName === "superadmin" ||
    userRoleName === "admin";

  // Check if user can see reports
  const canViewReports =
    hasPermission("reports.view") ||
    userRoleName === "superadmin" ||
    userRoleName === "admin" ||
    userRoleName === "manager";

  // Dynamic quick tips based on user role
  const getQuickTips = () => {
    const tips = [
      {
        title: "Quick Search",
        description: "Use Ctrl + B to instantly focus the search bar",
        icon: Search,
        roles: ["superadmin", "admin", "manager", "cashier", "staff"],
      },
      {
        title: "POS Shortcut",
        description: "Press Ctrl + P to quickly open the POS system",
        icon: ShoppingBag,
        roles: ["superadmin", "admin", "manager", "cashier"],
      },
      {
        title: "Navigate Fast",
        description: "Shift + T takes you directly to Transactions",
        icon: Receipt,
        roles: ["superadmin", "admin", "manager", "cashier"],
      },
      {
        title: "Calculator Access",
        description: "Click the calculator icon or use Ctrl + C",
        icon: Bell,
        roles: ["superadmin", "admin", "manager", "cashier", "staff"],
      },
      {
        title: "Keyboard Shortcuts",
        description: "Press Ctrl + / to toggle all available shortcuts",
        icon: Settings,
        roles: ["superadmin", "admin", "manager", "cashier", "staff"],
      },
      {
        title: "Store Switching",
        description: "Click the store name in the navbar to switch stores",
        icon: Building,
        roles: ["superadmin", "admin", "manager"],
      },
    ];

    // Add role-specific tips
    if (canViewUsers) {
      tips.push({
        title: "User Management",
        description: "Manage employees and their access levels",
        icon: Users,
        roles: ["superadmin", "admin"],
      });
    }

    if (canViewStores) {
      tips.push({
        title: "Store Management",
        description: "Add or edit store locations",
        icon: Store,
        roles: ["superadmin", "admin"],
      });
    }

    if (canViewProfit) {
      tips.push({
        title: "Profit Reports",
        description: "View detailed profit analytics with Ctrl + Shift + P",
        icon: TrendingUp,
        roles: ["superadmin", "admin"],
      });
    }

    if (canViewReports) {
      tips.push({
        title: "Export Reports",
        description: "Generate and download sales reports",
        icon: FileText,
        roles: ["superadmin", "admin", "manager"],
      });
    }

    // Filter tips based on user role
    return tips.filter((tip) => tip.roles.includes(userRoleName));
  };

  // Dynamic features based on user role
  const getMainFeatures = () => {
    const features = [
      {
        category: "Inventory Management",
        items: [
          {
            name: "Global Stock Updates",
            status: "active",
            icon: Package,
            roles: ["superadmin", "admin", "manager"],
          },
          {
            name: "Low Stock Alerts",
            status: "active",
            icon: Bell,
            roles: ["superadmin", "admin", "manager", "cashier"],
          },
          {
            name: "Product Categories",
            status: "active",
            icon: FileText,
            roles: ["superadmin", "admin", "manager"],
          },
        ].filter((item) => item.roles.includes(userRoleName)),
      },
      {
        category: "Sales & Transactions",
        items: [
          {
            name: "POS System",
            status: "active",
            icon: ShoppingBag,
            roles: ["superadmin", "admin", "manager", "cashier"],
          },
          {
            name: "Transaction History",
            status: "active",
            icon: CreditCard,
            roles: ["superadmin", "admin", "manager", "cashier"],
          },
          {
            name: "Sales Reports",
            status: "active",
            icon: BarChart3,
            roles: ["superadmin", "admin", "manager"],
          },
        ].filter((item) => item.roles.includes(userRoleName)),
      },
    ];

    // Add Store Management section if user has permission
    if (canViewStores) {
      features.push({
        category: "Store Management",
        items: [
          {
            name: "Multi-Store Support",
            status: "active",
            icon: Building,
            roles: ["superadmin", "admin"],
          },
          {
            name: "Employee Management",
            status: "active",
            icon: Users,
            roles: ["superadmin", "admin"],
          },
          {
            name: "Role Permissions",
            status: "active",
            icon: Shield,
            roles: ["superadmin"],
          },
        ].filter((item) => item.roles.includes(userRoleName)),
      });
    }

    // Add Profit section if user has permission
    if (canViewProfit) {
      features.push({
        category: "Financial Analytics",
        items: [
          {
            name: "Profit Reports",
            status: "active",
            icon: TrendingUp,
            roles: ["superadmin", "admin"],
          },
          {
            name: "Revenue Tracking",
            status: "active",
            icon: BarChart3,
            roles: ["superadmin", "admin"],
          },
          {
            name: "Cost Analysis",
            status: "active",
            icon: Database,
            roles: ["superadmin", "admin"],
          },
        ].filter((item) => item.roles.includes(userRoleName)),
      });
    }

    // Filter out empty categories
    return features.filter((section) => section.items.length > 0);
  };

  const quickTips = getQuickTips();
  const mainFeatures = getMainFeatures();

  const supportLinks = [
    {
      title: "Documentation",
      url: "#",
      icon: FileText,
      roles: ["superadmin", "admin", "manager", "cashier", "staff"],
    },
    {
      title: "Video Tutorials",
      url: "#",
      icon: Bell,
      roles: ["superadmin", "admin", "manager", "cashier", "staff"],
    },
    {
      title: "System Status",
      url: "#",
      icon: Database,
      roles: ["superadmin", "admin"],
    },
    {
      title: "Contact Support",
      url: "#",
      icon: Users,
      roles: ["superadmin", "admin", "manager"],
    },
    {
      title: "Feature Requests",
      url: "#",
      icon: Settings,
      roles: ["superadmin", "admin", "manager"],
    },
    {
      title: "Report Issue",
      url: "#",
      icon: AlertTriangle,
      roles: ["superadmin", "admin", "manager", "cashier", "staff"],
    },
  ].filter((link) => link.roles.includes(userRoleName));

  // Keyboard shortcut to open modal AND listen for custom event
  useEffect(() => {
    // Handler for custom event
    const handleOpenHelpModal = () => {
      setIsOpen(true);
    };

    // Handler for keyboard shortcut
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "?") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    // Add event listeners
    window.addEventListener("open-help-modal", handleOpenHelpModal);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // Clean up event listeners
      window.removeEventListener("open-help-modal", handleOpenHelpModal);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && e.target.closest(".modal-content") === null) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Modal Content */}
      <div className="modal-content relative min-h-full flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-sm bg-gradient-to-r from-purple-500 to-pink-500">
                  <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    System Helper
                  </h2>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Tips, features, and support
                    </p>
                    <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full capitalize">
                      {userRoleName || "User"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors"
                aria-label="Close help"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <nav className="flex space-x-4 sm:space-x-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab("quicktips")}
                className={`py-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === "quicktips"
                    ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                Quick Tips
              </button>
              <button
                onClick={() => setActiveTab("features")}
                className={`py-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === "features"
                    ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab("support")}
                className={`py-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === "support"
                    ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                Support
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {activeTab === "quicktips" && (
              <div className="space-y-4">
                {quickTips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {quickTips.map((tip, index) => {
                      const Icon = tip.icon;
                      return (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-900 rounded-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 sm:p-2 rounded-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {tip.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {tip.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No quick tips available for your role
                    </p>
                  </div>
                )}

                {/* Pro Tip - Only show for certain roles */}
                {userRoleName !== "staff" && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-sm p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Pro Tip
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Bookmark frequently used pages for quick access. Use
                          the store switcher to manage multiple locations.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-4 sm:space-y-6">
                {mainFeatures.length > 0 ? (
                  mainFeatures.map((section, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 rounded-sm p-3 sm:p-4"
                    >
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
                        {section.category}
                      </h3>
                      <div className="space-y-2">
                        {section.items.map((item, itemIndex) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={itemIndex}
                              className="flex items-center justify-between p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                  {item.name}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {item.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No features available for your role
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "support" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {supportLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={index}
                        href={link.url}
                        className="group flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {link.title}
                          </span>
                        </div>
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                      </a>
                    );
                  })}
                </div>

                {/* Contact Support - Available to all roles */}
                <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-sm p-3 sm:p-4 border border-green-200 dark:border-green-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Need Immediate Help?
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Contact our support team for urgent assistance.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-sm text-xs sm:text-sm font-medium transition-colors">
                      Live Chat
                    </button>
                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-sm text-xs sm:text-sm font-medium transition-colors">
                      Email Support
                    </button>
                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-xs sm:text-sm font-medium transition-colors">
                      Call Support
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                Press{" "}
                <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 text-xs">
                  Esc
                </kbd>{" "}
                to close
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                v2.1.0 • Mega Gamers Inventory System
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHelperModal;
