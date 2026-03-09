// GridView.jsx (updated)
import {
  Phone,
  Calendar,
  Trash2,
  Mail,
  Shield,
  Store,
  Users,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useRole } from "../../../context/authentication/RoleContext";
import { useUserModal } from "../../../globals/hooks/useUserModal";
import { useState } from "react";

import SuspendUserModal from "./SuspendUserModal";

const GridView = ({
  filteredUsers,
  formatDate,
  setSelectedUser,
  setShowRoleModal,
  setShowDeleteModal,
  setShowAssignStoreModal,
  getRoleBadge,
  stores,
  onSuspendUser, // New prop
  onUnsuspendUser, // New prop
  isSuspending = false, // New prop for loading state
}) => {
  const { isAdmin, isSuperadmin } = useRole();
  const { openModal } = useUserModal();

  // New state for suspension modal
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedSuspensionUser, setSelectedSuspensionUser] = useState(null);
  const [isSuspensionAction, setIsSuspensionAction] = useState(true);

  const handleViewUser = (user) => {
    openModal({
      title: `${user.firstName} ${user.lastName}`,
      size: "md",
      position: "right",
      userData: user,
    });
  };

  // Handle suspend click
  const handleSuspendClick = (user) => {
    setSelectedSuspensionUser(user);
    setIsSuspensionAction(true);
    setShowSuspendModal(true);
  };

  // Handle unsuspend click
  const handleUnsuspendClick = (user) => {
    setSelectedSuspensionUser(user);
    setIsSuspensionAction(false);
    setShowSuspendModal(true);
  };

  // Handle suspension confirmation
  const handleSuspensionConfirm = async (data) => {
    if (data.isSuspending) {
      await onSuspendUser(data);
    } else {
      await onUnsuspendUser(data.userId);
    }
    setShowSuspendModal(false);
    setSelectedSuspensionUser(null);
  };

  // Newsletter badge
  const NewsletterBadge = ({ subscribed }) =>
    subscribed ? (
      <span className="inline-flex items-center px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-sm">
        <Mail size={10} className="mr-1" />
        Subscribed
      </span>
    ) : null;

  // Suspension Status Badge
  const SuspensionBadge = ({ user }) => {
    if (user.isSuspended) {
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

  // Helper to get store name by ID
  const getStoreName = (storeId) => {
    if (!storeId || !stores) return "No store";
    const store = stores.find((s) => s._id === storeId);
    return store ? `${store.name} (${store.code})` : "Unknown store";
  };

  // Helper to get store permissions summary
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

  // Check if user can access all stores
  const hasGlobalAccess = (user) => {
    return user.canAccessAllStores || user.role === "superadmin";
  };

  // Get store role for display
  const getStoreRole = (user) => {
    if (user.storeRoles && user.storeRoles.length > 0) {
      return user.storeRoles[0].role;
    }
    return user.role === "manager" ? "Manager" : "Staff";
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className={`bg-white dark:bg-gray-800 border rounded-sm p-4 transition-colors ${
              user.isSuspended
                ? "border-red-300 dark:border-red-700 bg-red-50/30 dark:bg-red-900/10"
                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </h3>
                  {hasGlobalAccess(user) && (
                    <span className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Globe size={10} />
                      Global
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                  {user.email}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {getRoleBadge(user.role)}
                <div className="flex gap-1">
                  <NewsletterBadge subscribed={user.newsletter} />
                  <SuspensionBadge user={user} />
                </div>
              </div>
            </div>

            {/* Suspension Info (if suspended) */}
            {user.isSuspended && (
              <div className="mb-3 p-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={14}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <div className="text-xs">
                    <p className="text-red-700 dark:text-red-400 font-medium">
                      Suspended
                    </p>
                    {user.suspensionReason && (
                      <p className="text-red-600 dark:text-red-400 mt-1">
                        {user.suspensionReason}
                      </p>
                    )}
                    {user.suspendedAt && (
                      <p className="text-red-500 dark:text-red-500 mt-1">
                        Since: {formatDate(user.suspendedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Store Information */}
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Store
                    size={14}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.assignedStore
                        ? user.assignedStore.name ||
                          getStoreName(
                            user.assignedStore._id || user.assignedStore,
                          )
                        : "No assigned store"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {user.assignedStore ? "Assigned Store" : "Unassigned"}
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                  {getStoreRole(user)}
                </span>
              </div>

              {/* Permissions */}
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <Lock
                    size={12}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {hasGlobalAccess(user)
                      ? "Full access to all stores"
                      : getStorePermissionsSummary(user)}
                  </span>
                </div>

                {/* Permission indicators */}
                {user.storePermissions &&
                  user.storePermissions[0] &&
                  !hasGlobalAccess(user) && (
                    <div className="flex gap-1 mt-1">
                      {user.storePermissions[0].canManage && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded">
                          Manage
                        </span>
                      )}
                      {user.storePermissions[0].canSell && (
                        <span className="text-[10px] bg-green-500/20 text-green-600 dark:text-green-400 px-1 py-0.5 rounded">
                          Sell
                        </span>
                      )}
                      {user.storePermissions[0].canEdit && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1 py-0.5 rounded">
                          Edit
                        </span>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
              <div className="flex items-center">
                <Phone
                  size={14}
                  className="mr-2 text-gray-500 dark:text-gray-400"
                />
                <span
                  className={
                    user.phoneNo
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-500"
                  }
                >
                  {user.phoneNo || "No phone number"}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar
                  size={14}
                  className="mr-2 text-gray-500 dark:text-gray-400"
                />
                <span>Joined: {formatDate(user.createdAt)}</span>
              </div>
              {user.company && (
                <div className="flex items-center">
                  <Users
                    size={14}
                    className="mr-2 text-gray-500 dark:text-gray-400"
                  />
                  <span>Company: {user.company}</span>
                </div>
              )}
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1 text-xs">
                {user.profileImage ? (
                  <>
                    <CheckCircle
                      size={10}
                      className="text-green-600 dark:text-green-400"
                    />
                    <span className="text-green-600 dark:text-green-400">
                      Photo
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
              {user.storePermissions && user.storePermissions.length > 1 && (
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  +{user.storePermissions.length - 1} more stores
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-gray-300 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div
                  className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]"
                  title={user._id}
                >
                  ID: {user._id.substring(0, 8)}...
                </div>
                <div className="flex space-x-1">
                  {/* View Details Button */}
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

                  {/* Role Change Button */}
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowRoleModal(true);
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Change Role"
                  >
                    <Shield
                      size={16}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </button>

                  {/* Store Assignment Button - only for admins */}
                  {(isAdmin || isSuperadmin) && (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowAssignStoreModal(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title={
                        user.assignedStore ? "Change Store" : "Assign Store"
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
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="col-span-full p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              No users found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Suspension Modal */}
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
    </>
  );
};

export default GridView;
