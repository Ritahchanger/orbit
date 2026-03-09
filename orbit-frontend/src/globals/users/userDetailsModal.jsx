import { useEffect, useCallback } from "react";
import {
  X,
  Mail,
  Phone,
  Store,
  Calendar,
  Users,
  Globe,
  Lock,
  CheckCircle,
  Building,
  Eye,
  Zap,
  Crown,
  Award,
  Target,
  Gamepad2,
  Cpu,
  KeyRound,
  Sparkles,
  Ban,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { closeModal } from "../../admin-pages/products/redux/more-user-slice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const UserDetailsModal = () => {
  const dispatch = useDispatch();
  const { isOpen, title, size, position, userData } = useSelector(
    (state) => state.userModal,
  );

  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px"; // Prevent layout shift
    } else {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0";
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "w-96",
    md: "w-[600px]",
    lg: "w-[800px]",
    xl: "w-[980px]",
  };

  const positionClasses = {
    right: "right-0 animate-slideInRight",
    left: "left-0 animate-slideInLeft",
    center: "left-1/2 transform -translate-x-1/2 animate-fadeIn",
  };

  // Theme-aware styles
  const getRoleBadge = (role) => {
    const roleStyles = {
      superadmin: {
        light:
          "bg-gradient-to-r from-red-100 via-red-50 to-red-100 border border-red-200 text-red-700",
        dark: "bg-gradient-to-r from-red-500/20 via-purple-600/20 to-red-500/20 border border-red-500/30 text-red-400",
      },
      admin: {
        light:
          "bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 border border-purple-200 text-purple-700",
        dark: "bg-gradient-to-r from-purple-500/20 via-blue-600/20 to-purple-500/20 border border-purple-500/30 text-purple-400",
      },
      manager: {
        light:
          "bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 border border-blue-200 text-blue-700",
        dark: "bg-gradient-to-r from-blue-500/20 via-cyan-600/20 to-blue-500/20 border border-blue-500/30 text-blue-400",
      },
      staff: {
        light:
          "bg-gradient-to-r from-green-100 via-green-50 to-green-100 border border-green-200 text-green-700",
        dark: "bg-gradient-to-r from-green-500/20 via-emerald-600/20 to-green-500/20 border border-green-500/30 text-green-400",
      },
      default: {
        light: "bg-gray-100 border border-gray-300 text-gray-700",
        dark: "bg-gray-800/30 border border-gray-700 text-gray-400",
      },
    };

    const roleIcons = {
      superadmin: <Crown size={12} className="mr-1.5" />,
      admin: <Award size={12} className="mr-1.5" />,
      manager: <Target size={12} className="mr-1.5" />,
      staff: <Users size={12} className="mr-1.5" />,
    };

    const style = roleStyles[role] || roleStyles.default;
    const themeStyle = document.documentElement.classList.contains("dark")
      ? style.dark
      : style.light;

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${themeStyle}`}
      >
        {roleIcons[role]}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStorePermissionsSummary = (user) => {
    if (!user.storePermissions || user.storePermissions.length === 0) {
      return "No store permissions";
    }

    const permissions = user.storePermissions[0];
    const permissionsList = [];

    if (permissions.canView) permissionsList.push("View");
    if (permissions.canEdit) permissionsList.push("Edit");
    if (permissions.canSell) permissionsList.push("Sell");
    if (permissions.canManage) permissionsList.push("Manage");

    return permissionsList.join(", ") || "View only";
  };

  const hasGlobalAccess = (user) => {
    return user.canAccessAllStores || user.role === "superadmin";
  };

  // Theme-aware helper function
  const getCardClass = () => {
    return "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-5";
  };

  const getTextClass = () => "text-gray-900 dark:text-white";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[9998] animate-fadeIn"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-0 h-full z-[9999] ${positionClasses[position]} w-full md:w-[300px] lg:w-[800px] overflow-hidden`}
      >
        <div className="h-full bg-white dark:bg-gray-800 border-l border-gray-300 dark:border-gray-700 shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                  <Eye size={22} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                  <Sparkles size={8} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {title || "User Details"}
                </h2>
                {userData && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {userData._id?.substring(0, 8)}...
                    </span>
                    <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {userData.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 group"
              aria-label="Close modal"
            >
              <X
                size={20}
                className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6">
            {userData ? (
              <div className="space-y-6 animate-fadeIn">
                {/* User Profile Header */}
                <div
                  className={`${getCardClass()} bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/5 dark:to-blue-600/10 border border-blue-200 dark:border-blue-500/20`}
                >
                  <div className="relative z-10 flex items-center space-x-5">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/20 border-2 border-blue-200 dark:border-blue-500/30 flex items-center justify-center">
                        {userData.profileImage ? (
                          <img
                            src={userData.profileImage}
                            alt={userData.firstName}
                            className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-gray-800"
                          />
                        ) : (
                          <Users
                            size={32}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <Zap size={12} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userData.firstName} {userData.lastName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {getRoleBadge(userData.role)}
                        {hasGlobalAccess(userData) && (
                          <span className="inline-flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold">
                            <Globe size={12} className="mr-1.5" />
                            Global Access
                          </span>
                        )}
                        {userData.newsletter && (
                          <span className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                            <Mail size={12} className="mr-1.5" />
                            Newsletter
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div className={getCardClass()}>
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg mr-3">
                        <Users
                          size={18}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wide">
                        Personal Information
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Mail
                          size={16}
                          className="text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                            Email Address
                          </div>
                          <div className={`text-sm ${getTextClass()}`}>
                            {userData.email}
                          </div>
                        </div>
                      </div>
                      {userData.phoneNo && (
                        <div className="flex items-center">
                          <Phone
                            size={16}
                            className="text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                              Phone Number
                            </div>
                            <div
                              className={`text-sm font-medium ${getTextClass()}`}
                            >
                              {userData.phoneNo}
                            </div>
                          </div>
                        </div>
                      )}
                      {userData.company && (
                        <div className="flex items-center">
                          <Building
                            size={16}
                            className="text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                              Company
                            </div>
                            <div className={`text-sm ${getTextClass()}`}>
                              {userData.company}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Store Access */}
                  <div className={getCardClass()}>
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg mr-3">
                        <Store
                          size={18}
                          className="text-green-600 dark:text-green-400"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wide">
                        Store Access
                      </h4>
                    </div>
                    <div className="space-y-4">
                      {userData.assignedStore ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center mb-3">
                            <Store
                              size={16}
                              className="text-green-600 dark:text-green-400 mr-2"
                            />
                            <span className="font-bold text-gray-900 dark:text-white text-sm">
                              Assigned Store
                            </span>
                          </div>
                          <div className="pl-6">
                            <div className={`font-medium ${getTextClass()}`}>
                              {userData.assignedStore.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ID: {userData.assignedStore._id?.substring(0, 8)}
                              ...
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Store
                            size={24}
                            className="text-gray-400 dark:text-gray-600 mx-auto mb-2"
                          />
                          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            No assigned store
                          </div>
                        </div>
                      )}

                      {userData.storePermissions &&
                        userData.storePermissions.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Store Permissions
                            </div>
                            <div
                              className={`text-sm font-medium ${getTextClass()}`}
                            >
                              {getStorePermissionsSummary(userData)}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className={getCardClass()}>
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-500/10 rounded-lg mr-3">
                        <Cpu
                          size={18}
                          className="text-yellow-600 dark:text-yellow-400"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wide">
                        Account Status
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                          <span className={`text-sm ${getTextClass()}`}>
                            Account Active
                          </span>
                        </div>
                        <CheckCircle size={16} className="text-green-500" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Account Active/Suspended Status */}
                        <div className="flex items-center">
                          {userData.isSuspended ? (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                              <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                Suspended
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span
                                className={`text-xs ${userData.isActive ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
                              >
                                {userData.isActive ? "Active" : "Inactive"}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center">
                          {userData.newsletter ? (
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                          ) : (
                            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
                          )}
                          <span
                            className={`text-xs ${userData.newsletter ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            Newsletter
                          </span>
                        </div>

                        <div className="flex items-center">
                          {userData.profileImage ? (
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          ) : (
                            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
                          )}
                          <span
                            className={`text-xs ${userData.profileImage ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            Profile Photo
                          </span>
                        </div>

                        <div className="flex items-center">
                          {userData.canAccessAllStores ? (
                            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                          ) : (
                            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
                          )}
                          <span
                            className={`text-xs ${userData.canAccessAllStores ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            Global Access
                          </span>
                        </div>

                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
                          <span className="text-xs text-cyan-600 dark:text-cyan-400">
                            Role: {userData.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Suspension Status - Add this after the Status card */}
                  {userData.isSuspended && (
                    <div
                      className={`${getCardClass()} border-l-4 border-l-red-500`}
                    >
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg mr-3">
                          <Ban
                            size={18}
                            className="text-red-600 dark:text-red-400"
                          />
                        </div>
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wide">
                          Suspension Details
                        </h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <AlertTriangle
                            size={16}
                            className="text-red-500 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                              Suspension Reason
                            </div>
                            <div className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20">
                              {userData.suspensionReason ||
                                "No reason provided"}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Suspended At
                            </div>
                            <div className="flex items-center">
                              <Clock
                                size={14}
                                className="text-gray-500 dark:text-gray-400 mr-2"
                              />
                              <div
                                className={`text-sm font-medium ${getTextClass()}`}
                              >
                                {userData.suspendedAt
                                  ? formatDate(userData.suspendedAt)
                                  : "N/A"}
                              </div>
                            </div>
                          </div>

                          {userData.suspendedBy && (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Suspended By
                              </div>
                              <div
                                className={`text-sm font-medium ${getTextClass()}`}
                              >
                                {userData.suspendedBy.firstName || "Unknown"}{" "}
                                {userData.suspendedBy.lastName || ""}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          <div className="inline-flex items-center px-3 py-1.5 bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-full">
                            <span className="text-xs font-bold text-red-700 dark:text-red-400">
                              Account Suspended
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className={getCardClass()}>
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg mr-3">
                        <Calendar
                          size={18}
                          className="text-purple-600 dark:text-purple-400"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wide">
                        Activity Dates
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Account Created
                        </div>
                        <div
                          className={`text-sm font-medium ${getTextClass()}`}
                        >
                          {formatDate(userData.createdAt)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Last Updated
                        </div>
                        <div
                          className={`text-sm font-medium ${getTextClass()}`}
                        >
                          {formatDate(userData.updatedAt)}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Version
                        </div>
                        <div className="text-gray-500 dark:text-gray-500 text-xs">
                          v{userData.__v || "1.0"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className={getCardClass()}>
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg mr-3">
                      <Lock
                        size={18}
                        className="text-red-600 dark:text-red-400"
                      />
                    </div>
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wide">
                      Detailed Permissions
                    </h4>
                  </div>

                  {userData.storePermissions &&
                  userData.storePermissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userData.storePermissions.map((perm, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                        >
                          <div className="flex items-center mb-3">
                            <Gamepad2
                              size={14}
                              className="text-gray-500 dark:text-gray-400 mr-2"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Store {index + 1}
                            </span>
                            <div className="ml-auto flex space-x-1">
                              {perm.canView && (
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              )}
                              {perm.canEdit && (
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              )}
                              {perm.canSell && (
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              )}
                              {perm.canManage && (
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            {perm.canView && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                                  <span className="text-xs text-gray-700 dark:text-gray-300">
                                    View
                                  </span>
                                </div>
                                <CheckCircle
                                  size={12}
                                  className="text-gray-400 dark:text-gray-500"
                                />
                              </div>
                            )}
                            {perm.canEdit && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></div>
                                  <span className="text-xs text-yellow-700 dark:text-yellow-400">
                                    Edit
                                  </span>
                                </div>
                                <CheckCircle
                                  size={12}
                                  className="text-yellow-500 dark:text-yellow-400"
                                />
                              </div>
                            )}
                            {perm.canSell && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                                  <span className="text-xs text-green-700 dark:text-green-400">
                                    Sell
                                  </span>
                                </div>
                                <CheckCircle
                                  size={12}
                                  className="text-green-500 dark:text-green-400"
                                />
                              </div>
                            )}
                            {perm.canManage && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                                  <span className="text-xs text-blue-700 dark:text-blue-400">
                                    Manage
                                  </span>
                                </div>
                                <CheckCircle
                                  size={12}
                                  className="text-blue-500 dark:text-blue-400"
                                />
                              </div>
                            )}
                          </div>

                          {userData.storeRoles?.[index] && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center">
                                <KeyRound
                                  size={12}
                                  className="text-cyan-500 dark:text-cyan-400 mr-2"
                                />
                                <span className="text-xs text-cyan-600 dark:text-cyan-400">
                                  Role: {userData.storeRoles[index].role}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Lock
                        size={32}
                        className="text-gray-400 dark:text-gray-600 mx-auto mb-3"
                      />
                      <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        No store permissions assigned
                      </div>
                      <div className="text-gray-400 dark:text-gray-600 text-xs mt-1">
                        User has access to assigned store only
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="h-20 w-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <div className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                  No user data available
                </div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">
                  Please select a user to view details
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                User Details • Last updated:{" "}
                {userData ? formatDate(userData.updatedAt) : "N/A"}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/admin/settings/${userData._id}`)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-sm transition-colors border border-blue-600 hover:border-blue-700"
                >
                  Update Permissions
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-sm transition-colors border border-gray-300 dark:border-gray-600"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetailsModal;
