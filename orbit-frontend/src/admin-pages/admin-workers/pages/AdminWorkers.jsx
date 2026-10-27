import { useState } from "react";
import AdminLayout from "../../dashboard/layout/Layout";
import { toast } from "react-hot-toast";
import { useStoreContext } from "../../../context/store/StoreContext";
import {
  Users,
  Shield,
  Building,
  Crown,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../../../context/authentication/AuthenticationContext";
import UserApi from "../../services/user-api";
// Import hooks
import { useUserMutations } from "../../hooks/users.hook";
import { useGetAllUsers, useGetUserStats } from "../../hooks/users.hook";
// Import skeleton loaders
import { UserSkeletonLoader } from "../preloaders/UsersPreloader";
import { useDispatch } from "react-redux";
import { openRegistrationModal } from "../../slices/userRegistrationSlice";
import ListView from "../components/ListView";
import GridView from "../components/GridView";
import ShowRoleModal from "../components/ShowRoleModal";
import { exportToCSV, exportToPDF, printUsers } from "../utils/exportUtils";
import { useDebounce } from "../../../globals/hooks/useDebounce";
import StatsOverview from "../components/StatsOverview";
import ExportMenu from "../components/ExportMenu";
import WorkersPagination from "../components/WorkersPagination";
import DeleteModal from "../components/DeleteModal";
import AssignStoreModal from "../components/AssignStoreModal";
import SearchAndFilters from "../components/SearchAndFilters";
import InformationBar from "../components/InformationBar";

import { roles } from "../data";

import {
  useSimpleRolePermissionCheck,
  usePermissionCheck,
} from "../../../context/RolePermissionContext";
import Header from "../components/Header";
import RoleTabs from "../components/RoleTabs";

// Roles an admin may give out; superadmins may assign any role (matches the API)
const ADMIN_ASSIGNABLE_ROLES = ["manager", "cashier", "staff"];
const PRIVILEGED_ROLES = ["admin", "superadmin"];

const AdminWorkers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAssignStoreModal, setShowAssignStoreModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const { hasPermission, hasAnyPermission } = usePermissionCheck();
  const { userRole } = useSimpleRolePermissionCheck();
  const { user: currentUser } = useAuth();
  const isSuperadmin = userRole === "superadmin";

  const { suspendUserMutation, unsuspendUserMutation } = useUserMutations();

  const dispatch = useDispatch();

  const handleSuspendUser = async (data) => {
    try {
      await suspendUserMutation.mutateAsync({
        userId: data.userId,
        reason: data.reason,
      });
      toast.success("User suspended successfully");
      handleRefresh();
    } catch (error) {
      toast.error(error.message || "Failed to suspend user");
    }
  };

  const handleUnsuspendUser = async (userId) => {
    try {
      await unsuspendUserMutation.mutateAsync(userId);
      toast.success("User unsuspended successfully");
      handleRefresh();
    } catch (error) {
      toast.error(error.message || "Failed to unsuspend user");
    }
  };

  const canViewUsers =
    hasPermission("users.view") ||
    hasAnyPermission(["users.manage", "users.list"]);
  const canManageUsers = hasAnyPermission([
    "users.create",
    "users.update",
    "users.delete",
    "users.manage",
  ]);
  const canExportUsers =
    hasPermission("users.export") || hasAnyPermission(["users.manage"]);
  const canChangeRoles =
    hasPermission("users.change_role") || hasAnyPermission(["users.manage"]);
  const canAssignStores =
    hasPermission("users.assign_store") || hasAnyPermission(["users.manage"]);
  const canDeleteUsers =
    hasPermission("users.delete") || hasAnyPermission(["users.manage"]);

  // Which actions to offer for a user. Mirrors the API: users can't act on
  // themselves, and only superadmins can act on admins and superadmins.
  const getAllowedActions = (target) => {
    const isSelf =
      currentUser?._id && String(target._id) === String(currentUser._id);
    const canTouch =
      isSuperadmin || !PRIVILEGED_ROLES.includes(target.role);
    return {
      changeRole: canChangeRoles && canTouch && !isSelf,
      assignStore: canAssignStores && canTouch,
      suspend:
        canManageUsers && canTouch && !isSelf && target.role !== "superadmin",
      delete: canDeleteUsers && canTouch && !isSelf,
    };
  };

  const [storeData, setStoreData] = useState({
    storeId: "",
    permissions: {
      canView: true,
      canEdit: false,
      canSell: false,
      canManage: false,
    },
  });

  const [page, setPage] = useState(1);
  const limit = 10;
  const [viewMode, setViewMode] = useState("list");
  const [activeTab, setActiveTab] = useState("all");

  // Any change to the filters starts again from the first page
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
  };
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const listFilters = {
    search: debouncedSearchQuery.trim() || undefined,
    role: activeTab !== "all" ? activeTab : undefined,
  };

  const { stores = [] } = useStoreContext();

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      toast.error("No users to export");
      return;
    }

    setExportLoading(true);
    try {
      const success = exportToCSV(
        filteredUsers,
        `users-export-${new Date().toISOString().split("T")[0]}.csv`,
      );
      if (success) {
        toast.success(`Exported ${filteredUsers.length} users to CSV`);
      }
    } catch (error) {
      toast.error("Failed to export CSV");
      console.error("Export error:", error);
    } finally {
      setExportLoading(false);
      setShowExportMenu(false);
    }
  };

  const handleExportPDF = () => {
    if (filteredUsers.length === 0) {
      toast.error("No users to export");
      return;
    }

    setExportLoading(true);
    try {
      const success = exportToPDF(
        filteredUsers,
        `users-export-${new Date().toISOString().split("T")[0]}.pdf`,
      );
      if (success) {
        toast.success(`Exported ${filteredUsers.length} users to PDF`);
      }
    } catch (error) {
      toast.error("Failed to export PDF");
      console.error("Export error:", error);
    } finally {
      setExportLoading(false);
      setShowExportMenu(false);
    }
  };

  const handlePrintView = () => {
    if (filteredUsers.length === 0) {
      toast.error("No users to print");
      return;
    }
    if (!printUsers(filteredUsers)) {
      toast.error("Allow pop-ups for this site to print");
    }
    setShowExportMenu(false);
  };

  const handleExportAllUsers = async (format = "csv") => {
    setExportLoading(true);
    try {
      // Every user matching the current search and role tab, not just this page
      const allUsersResponse = await UserApi.getAllUsers({
        ...listFilters,
        page: 1,
        limit: Math.max(pagination.totalUsers || 0, 1),
      });
      const allUsers = allUsersResponse?.data?.users || [];

      if (allUsers.length === 0) {
        toast.error("No users to export");
        return;
      }

      let success = false;
      switch (format) {
        case "csv":
          success = exportToCSV(
            allUsers,
            `all-users-${new Date().toISOString().split("T")[0]}.csv`,
          );
          break;
        case "pdf":
          success = exportToPDF(
            allUsers,
            `all-users-${new Date().toISOString().split("T")[0]}.pdf`,
          );
          break;
        default:
          success = exportToCSV(allUsers);
      }

      if (success) {
        toast.success(`Exported all ${allUsers.length} users`);
      }
    } catch (error) {
      toast.error("Failed to export all users");
      console.error("Export error:", error);
    } finally {
      setExportLoading(false);
      setShowExportMenu(false);
    }
  };

  const { deleteUserMutation, updateUserRoleMutation, assignStoreToUserMutation } =
    useUserMutations();

  // Get users data
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useGetAllUsers({ page, limit, ...listFilters });

  // Get user stats
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetUserStats();

  // Access data with proper structure
  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10,
  };

  // Access stats with proper structure
  const stats = statsData?.data || {
    totalUsers: 0,
    adminUsers: 0,
    superAdminUsers: 0,
    normalUsers: 0,
    managerUsers: 0,
    newsletterSubscribers: 0,
    recentUsers: 0,
    usersWithStores: 0,
  };

  // Handle refresh data
  const handleRefresh = () => {
    refetchUsers();
    refetchStats();
    toast.success("Data refreshed successfully");
  };

  // Role options with complete list

  // Tabs for user filtering
  const tabs = [
    { id: "all", name: "All Users", icon: Users, count: stats.totalUsers || 0 },
    {
      id: "superadmin",
      name: "Super Admins",
      icon: Crown,
      count: stats.superAdminUsers || 0,
    },
    { id: "admin", name: "Admins", icon: Shield, count: stats.adminUsers || 0 },
    {
      id: "manager",
      name: "Managers",
      icon: Building,
      count: stats.managerUsers || 0,
    },
    {
      id: "cashier",
      name: "Cashiers",
      icon: UserIcon,
      count: stats.cashiers || 0,
    },
    { id: "staff", name: "Staffs", icon: UserIcon, count: stats.staffs || 0 },
  ];

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUserMutation.mutateAsync(selectedUser._id);
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      setSelectedUser(null);
      handleRefresh(); // Refresh data after deletion
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  // Handle update role
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await updateUserRoleMutation.mutateAsync({
        id: selectedUser._id,
        role: newRole,
      });
      toast.success(`Role updated to ${newRole}`);
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole("");
      handleRefresh(); // Refresh data after role update
    } catch (error) {
      toast.error(error.message || "Failed to update role");
    }
  };

  // Handle assign store
  const handleAssignStore = async () => {
    if (!selectedUser || !storeData.storeId) return;

    try {
      await assignStoreToUserMutation.mutateAsync({
        userId: selectedUser._id,
        storeData,
      });
      toast.success("Store assigned successfully");
      setShowAssignStoreModal(false);
      setSelectedUser(null);
      setStoreData({
        storeId: "",
        permissions: {
          canView: true,
          canEdit: false,
          canSell: false,
          canManage: false,
        },
      });
      handleRefresh(); // Refresh data after store assignment
    } catch (error) {
      toast.error(error.message || "Failed to assign store");
    }
  };

  // The role tab is applied by the API, so this is already the filtered list
  const filteredUsers = users;

  // Get role badge - FIXED WITH SAFETY CHECKS
  const getRoleBadge = (role) => {
    // Ensure role is a string
    const roleId = String(role || "user").toLowerCase();

    // Find role config
    const roleConfig = roles.find((r) => r.id === roleId) || roles[3]; // Fallback to 'user'

    // Safe icon handling
    const Icon = roleConfig?.icon || UserIcon;

    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full ${roleConfig?.color || "bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30"} border`}
      >
        <Icon size={14} className="mr-2" />
        <span className="text-sm font-medium">
          {roleConfig?.name || "User"}
        </span>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  if (!canViewUsers && !canManageUsers && userRole !== "superadmin") {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto text-gray-600 dark:text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              You don't have permission to view or manage users. Please contact
              your administrator for access.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
        {/* Header */}

        <Header
          canExportUsers={canExportUsers}
          exportLoading={exportLoading}
          showExportMenu={showExportMenu}
          setShowExportMenu={setShowExportMenu}
          filteredUsers={filteredUsers}
          handleExportCSV={handleExportCSV}
          handlePrintView={handlePrintView}
          canManageUsers={canManageUsers}
          handleRefresh={handleRefresh}
          usersLoading={usersLoading}
          statsLoading={statsLoading}
          handleExportAllUsers={handleExportAllUsers}
          handleExportPDF={handleExportPDF}
        />

        {/* Stats Overview */}
        <StatsOverview statsLoading={statsLoading} stats={stats} />

        <RoleTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        {/* Search and Filters */}
        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Users Table/Grid */}
        {usersLoading ? (
          <UserSkeletonLoader count={limit} />
        ) : usersError ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-sm p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">
              Error loading users. Please try again.
            </p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-sm transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Users Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery.trim()
                ? "No users match your search criteria"
                : "No users available in this category"}
            </p>
            <button
              onClick={() => {
                dispatch(openRegistrationModal());
              }}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-sm transition-colors"
            >
              Add First User
            </button>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <GridView
            filteredUsers={filteredUsers}
            formatDate={formatDate}
            setSelectedUser={setSelectedUser}
            setShowRoleModal={setShowRoleModal}
            setShowDeleteModal={setShowDeleteModal}
            setShowAssignStoreModal={setShowAssignStoreModal}
            getRoleBadge={getRoleBadge}
            stores={stores}
            onSuspendUser={handleSuspendUser}
            onUnsuspendUser={handleUnsuspendUser}
            isSuspending={
              suspendUserMutation.isPending || unsuspendUserMutation.isPending
            }
            getAllowedActions={getAllowedActions}
          />
        ) : (
          // List View (Table)
          <ListView
            filteredUsers={filteredUsers}
            getRoleBadge={getRoleBadge}
            formatDate={formatDate}
            setSelectedUser={setSelectedUser}
            setShowRoleModal={setShowRoleModal}
            setShowDeleteModal={setShowDeleteModal}
            setShowAssignStoreModal={setShowAssignStoreModal}
            stores={stores}
            onSuspendUser={handleSuspendUser}
            onUnsuspendUser={handleUnsuspendUser}
            isSuspending={
              suspendUserMutation.isPending || unsuspendUserMutation.isPending
            }
            getAllowedActions={getAllowedActions}
          />
        )}

        {/* Pagination */}
        {!usersLoading && filteredUsers.length > 0 && (
          <WorkersPagination
            pagination={pagination}
            setPage={setPage}
            page={page}
          />
        )}

        {/* Info Bar */}
        <InformationBar
          usersLoading={usersLoading}
          filteredUsers={filteredUsers}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {canDeleteUsers && showDeleteModal && selectedUser && (
        <DeleteModal
          setShowDeleteModal={setShowDeleteModal}
          selectedUser={selectedUser}
          handleDeleteUser={handleDeleteUser}
          deleteUserMutation={deleteUserMutation}
        />
      )}

      {/* Change Role Modal */}
      {canChangeRoles && showRoleModal && selectedUser && (
        <ShowRoleModal
          selectedUser={selectedUser}
          setShowRoleModal={setShowRoleModal}
          setNewRole={setNewRole}
          handleUpdateRole={handleUpdateRole}
          newRole={newRole}
          updateUserRoleMutation={updateUserRoleMutation}
          roles={
            isSuperadmin
              ? roles
              : roles.filter((r) => ADMIN_ASSIGNABLE_ROLES.includes(r.id))
          }
        />
      )}

      {/* Assign Store Modal */}
      {canAssignStores && showAssignStoreModal && selectedUser && (
        <AssignStoreModal
          selectedUser={selectedUser}
          storeData={storeData}
          setStoreData={setStoreData}
          setShowAssignStoreModal={setShowAssignStoreModal}
          handleAssignStore={handleAssignStore}
          assignStoreToUserMutation={assignStoreToUserMutation}
        />
      )}
    </AdminLayout>
  );
};

export default AdminWorkers;
