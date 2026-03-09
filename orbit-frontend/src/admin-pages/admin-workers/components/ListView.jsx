import {
  Phone,
  Mail,
  Shield,
  Trash2,
  Store,
  Users,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
  AlertCircle,
  Unlock,
  Eye,
} from "lucide-react";
import { useRole } from "../../../context/authentication/RoleContext";
import { useUserModal } from "../../../globals/hooks/useUserModal";
import CustomerAvatar from "../../customers/CustomerAvatar";
import SuspendUserModal from "./SuspendUserModal";
import { useState } from "react";
const ListView = ({
  filteredUsers = [],
  getRoleBadge,
  formatDate,
  setSelectedUser,
  setShowRoleModal,
  setShowDeleteModal,
  setShowAssignStoreModal,
  stores = [],
  // Add these new props
  onSuspendUser,
  onUnsuspendUser,
  isSuspending = false,
}) => {
  const { isAdmin, isSuperadmin } = useRole();

  const { openModal } = useUserModal();

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedSuspensionUser, setSelectedSuspensionUser] = useState(null);
  const [isSuspensionAction, setIsSuspensionAction] = useState(true);

  // Add these handler functions
  const handleSuspendClick = (user) => {
    setSelectedSuspensionUser(user);
    setIsSuspensionAction(true);
    setShowSuspendModal(true);
  };

  const handleUnsuspendClick = (user) => {
    setSelectedSuspensionUser(user);
    setIsSuspensionAction(false);
    setShowSuspendModal(true);
  };

  const handleSuspensionConfirm = async (data) => {
    if (data.isSuspending) {
      await onSuspendUser(data);
    } else {
      await onUnsuspendUser(data.userId);
    }
    setShowSuspendModal(false);
    setSelectedSuspensionUser(null);
  };

  const handleViewUser = (user) => {
    if (!user) return;

    openModal({
      title: `${user.firstName || ""} ${user.lastName || ""}`,
      size: "md",
      position: "right",
      userData: user,
    });
  };

  // Helper to get store name by ID
  const getStoreName = (storeId) => {
    if (!storeId || !Array.isArray(stores) || stores.length === 0)
      return "No store";
    const store = stores.find((s) => s?._id === storeId);
    return store
      ? `${store.name || "Unnamed"} (${store.code || "No code"})`
      : "Unknown store";
  };

  // Helper to get store permissions summary
  const getStorePermissionsSummary = (user) => {
    if (
      !user?.storePermissions ||
      !Array.isArray(user.storePermissions) ||
      user.storePermissions.length === 0
    ) {
      return "No store permissions";
    }

    const permissions = user.storePermissions[0];
    if (!permissions) return "View only";

    const permissionsList = [];

    if (permissions.canView) permissionsList.push("View");
    if (permissions.canEdit) permissionsList.push("Edit");
    if (permissions.canSell) permissionsList.push("Sell");
    if (permissions.canManage) permissionsList.push("Manage");

    return permissionsList.join(", ") || "View only";
  };

  // Check if user can access all stores
  const hasGlobalAccess = (user) => {
    return user?.canAccessAllStores || user?.role === "superadmin";
  };

  const NewsletterBadge = ({ subscribed }) =>
    subscribed ? (
      <span className="inline-flex items-center px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-sm">
        <Mail size={10} className="mr-1" />
        Subscribed
      </span>
    ) : null;

  // Safely render getRoleBadge
  const renderRoleBadge = (role) => {
    if (typeof getRoleBadge !== "function") {
      console.warn("getRoleBadge is not a function");
      return (
        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
          {role || "Unknown"}
        </span>
      );
    }

    try {
      return getRoleBadge(role);
    } catch (error) {
      console.error("Error rendering role badge:", error);
      return (
        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
          {role || "Unknown"}
        </span>
      );
    }
  };

  // Add this badge component
  const SuspensionBadge = ({ user }) => {
    if (user?.isSuspended) {
      return (
        <span
          className="inline-flex items-center px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-sm"
          title={user.suspensionReason || "User suspended"}
        >
          <Lock size={10} className="mr-1" />
          Suspended
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                User
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Store Access
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Permissions
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Joined
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredUsers) &&
              filteredUsers.map((user, index) => {
                if (!user || typeof user !== "object") {
                  console.warn("Invalid user data at index", index, user);
                  return null;
                }

                return (
                  <tr
                    key={user._id || index}
                    className={`border-t border-gray-200 dark:border-gray-700 ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/30" : ""}`}
                  >
                    {/* User Info */}
                    <td className="py-3 px-4">
                      <div className="w-[140px] min-w-0">
                        <div className="flex items-start gap-3">
                          <CustomerAvatar
                            name={`${user.firstName?.charAt(0) || ""} ${user.lastName?.charAt(0) || ""}`.trim()}
                            size="sm"
                            className="shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm md:text-base inline-flex items-center gap-2 flex-wrap text-gray-900 dark:text-white">
                              {user.firstName || ""} {user.lastName || ""}
                              {hasGlobalAccess(user) && (
                                <span className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded whitespace-nowrap">
                                  <Globe size={10} />
                                  Global
                                </span>
                              )}
                            </div>
                            <div
                              className="text-sm text-gray-600 dark:text-gray-400 truncate"
                              title={user.email}
                            >
                              {user.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">{renderRoleBadge(user?.role)}</td>

                    {/* Store Access */}
                    <td className="py-3 px-4">
                      <div className="space-y-2">
                        {user.assignedStore ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Store
                              size={12}
                              className="text-blue-600 dark:text-blue-400"
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {typeof user.assignedStore === "object"
                                  ? user.assignedStore.name ||
                                    getStoreName(user.assignedStore._id)
                                  : getStoreName(user.assignedStore)}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Assigned Store
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Store size={12} />
                            <span>No assigned store</span>
                          </div>
                        )}

                        {/* Additional Stores from Permissions */}
                        {user.storePermissions &&
                          user.storePermissions.length > 1 && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              +{user.storePermissions.length - 1} more stores
                            </div>
                          )}
                      </div>
                    </td>

                    {/* Permissions */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {hasGlobalAccess(user) ? (
                          <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                            <Globe size={10} />
                            <span>Access to all stores</span>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <div className="text-gray-700 dark:text-gray-300 mb-1">
                              {getStorePermissionsSummary(user)}
                            </div>
                            {user.storeRoles &&
                              user.storeRoles.length > 0 &&
                              user.storeRoles[0]?.role && (
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <Users size={10} />
                                  <span>{user.storeRoles[0].role} role</span>
                                </div>
                              )}
                          </div>
                        )}

                        {/* Quick permission indicators */}
                        {user.storePermissions && user.storePermissions[0] && (
                          <div className="flex gap-1 mt-1">
                            {user.storePermissions[0].canManage && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded">
                                M
                              </span>
                            )}
                            {user.storePermissions[0].canSell && (
                              <span className="text-[10px] bg-green-500/20 text-green-600 dark:text-green-400 px-1 py-0.5 rounded">
                                S
                              </span>
                            )}
                            {user.storePermissions[0].canEdit && (
                              <span className="text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1 py-0.5 rounded">
                                E
                              </span>
                            )}
                            {user.storePermissions[0].canView && (
                              <span className="text-[10px] bg-gray-500/20 text-gray-600 dark:text-gray-400 px-1 py-0.5 rounded">
                                V
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="text-sm flex items-center gap-1">
                          <Phone
                            size={12}
                            className="text-gray-500 dark:text-gray-400"
                          />
                          <span
                            className={
                              user.phoneNo
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-500 dark:text-gray-500"
                            }
                          >
                            {user.phoneNo || "No phone"}
                          </span>
                        </div>
                        {user.company && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Company: {user.company}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {/* Add Suspension Badge here */}
                        <SuspensionBadge user={user} />

                        {/* Show suspension reason if suspended */}
                        {user.isSuspended && user.suspensionReason && (
                          <div
                            className="text-xs text-red-600 dark:text-red-400 max-w-[150px]"
                            title={user.suspensionReason}
                          >
                            <div className="flex items-start gap-1">
                              <AlertCircle
                                size={10}
                                className="flex-shrink-0 mt-0.5"
                              />
                              <span className="truncate">
                                {user.suspensionReason}
                              </span>
                            </div>
                          </div>
                        )}

                        <NewsletterBadge subscribed={user.newsletter} />
                        <div className="text-xs flex items-center gap-1">
                          {user.profileImage ? (
                            <>
                              <CheckCircle
                                size={10}
                                className="text-green-600 dark:text-green-400"
                              />
                              <span className="text-green-600 dark:text-green-400">
                                Has photo
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle size={10} className="text-gray-500" />
                              <span className="text-gray-500 dark:text-gray-400">
                                No photo
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3 px-4">
                      <div className="w-[100px]">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate ? formatDate(user.createdAt) : "N/A"}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Updated:{" "}
                          {formatDate ? formatDate(user.updatedAt) : "N/A"}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded transition-all hover:scale-110 duration-200 group relative"
                          title="View Details"
                        >
                          <Eye
                            size={16}
                            className="text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                          />
                          <span className="absolute -top-2 -right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse group-hover:animate-none"></span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal?.(true);
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Change Role"
                        >
                          <Shield
                            size={16}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        </button>

                        {/* Store Assignment Button - only for admins/managers */}
                        {(isAdmin || isSuperadmin) && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowAssignStoreModal?.(true);
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title={
                              user.assignedStore
                                ? "Change Store Assignment"
                                : "Assign Store"
                            }
                          >
                            <Store
                              size={16}
                              className={
                                user.assignedStore
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }
                            />
                          </button>
                        )}

                        {/* ADD THESE SUSPEND/UNSUSPEND BUTTONS HERE */}
                        {/* Suspend/Unsuspend Button - only for admins */}
                        {(isAdmin || isSuperadmin) &&
                          (user.isSuspended ? (
                            <button
                              onClick={() => handleUnsuspendClick(user)}
                              className="p-1.5 hover:bg-green-100 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded transition-colors"
                              title="Unsuspend User"
                            >
                              <Unlock size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspendClick(user)}
                              className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded transition-colors"
                              title="Suspend User"
                            >
                              <Lock size={16} />
                            </button>
                          ))}

                        {/* Delete Button - only for admins/superadmins */}
                        {(isAdmin || isSuperadmin) && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal?.(true);
                            }}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {showSuspendModal && selectedSuspensionUser && (
          <SuspendUserModal
            user={selectedSuspensionUser}
            onClose={() => {
              setShowSuspendModal(false);
              setSelectedSuspensionUser(null);
            }}
            onConfirm={handleSuspensionConfirm}
            isSuspending={isSuspensionAction}
            isLoading={isSuspending}
          />
        )}
      </div>

      {/* Empty State */}
      {(!Array.isArray(filteredUsers) || filteredUsers.length === 0) && (
        <div className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-1">
            No users found
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default ListView;
