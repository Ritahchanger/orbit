import { useState } from "react";
import AdminLayout from "../../dashboard/layout/Layout";
import { toast } from "react-hot-toast";
import { useStoreContext } from "../../../context/store/StoreContext";
import {
  Users,
  Shield,
  Mail,
  Building,
  Crown,
  User as UserIcon,
} from "lucide-react";
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
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
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

const AdminWorkers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAssignStoreModal, setShowAssignStoreModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const { hasPermission, hasAnyPermission } = usePermissionCheck();
  const { userRole } = useSimpleRolePermissionCheck();

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

  const {
    stores = [],
    isLoading: storesLoading,
    isError: storesError,
  } = useStoreContext();

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
    const printContent = document.querySelector(
      ".bg-gray-50.dark\\:bg-gray-900",
    );
    if (!printContent) {
      toast.error("Cannot find content to print");
      return;
    }

    const originalContents = document.body.innerHTML;
    const printContents = printContent.innerHTML;

    document.body.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Users Report - ${new Date().toLocaleDateString()}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        background: white; 
                        color: black;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 20px 0;
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left;
                    }
                    th { 
                        background-color: #f2f2f2; 
                        font-weight: bold;
                    }
                    tr:nth-child(even) { 
                        background-color: #f9f9f9;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 10px;
                    }
                    .print-header h1 {
                        margin: 0;
                        color: #333;
                    }
                    .print-header p {
                        margin: 5px 0;
                        color: #666;
                    }
                    .print-summary {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        padding: 10px;
                        background: #f5f5f5;
                        border-radius: 4px;
                    }
                    @media print {
                        @page { 
                            margin: 0.5in;
                            size: landscape;
                        }
                        body { 
                            margin: 0;
                        }
                        .no-print { 
                            display: none !important;
                        }
                        .print-break { 
                            page-break-before: always;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Users Report</h1>
                    <p>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                    <p>Total Users: ${filteredUsers.length}</p>
                </div>
                ${printContents}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            document.body.innerHTML = \`${originalContents}\`;
                            window.location.reload();
                        }, 1000);
                    }
                </script>
            </body>
            </html>
        `;
  };

  const handleExportAllUsers = async (format = "csv") => {
    setExportLoading(true);
    try {
      // You'll need to implement fetchAllUsers function
      const allUsersResponse = await fetchAllUsersData();
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

  const {
    deleteUserMutation,
    updateUserRoleMutation,
    changeUserPasswordMutation,
    assignStoreToUserMutation,
  } = useUserMutations();

  // Get users data
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useGetAllUsers({
    page,
    limit,
    search: debouncedSearchQuery.trim() ? debouncedSearchQuery : undefined,
    role: selectedRole !== "all" ? selectedRole : undefined,
  });

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

  // Filter users based on active tab
  const filteredUsers = users.filter((user) => {
    if (activeTab === "all") return true;
    return user.role === activeTab;
  });

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
        className={`inline-flex items-center px-3 py-1 rounded-full ${roleConfig?.color || "bg-gray-500/10 text-gray-400 border-gray-500/20"} border`}
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

  // Newsletter badge
  const NewsletterBadge = ({ subscribed }) =>
    subscribed ? (
      <span className="inline-flex items-center px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-sm">
        <Mail size={10} className="mr-1" />
        Subscribed
      </span>
    ) : null;

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

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-2">
          {tabs.map((tab) => {
            const Icon = tab?.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm md:text-base">{tab.name}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id
                      ? "bg-white/20"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          viewMode={viewMode}
          setViewMode={setViewMode}
          roles={roles}
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
              suspendUserMutation.isLoading || unsuspendUserMutation.isLoading
            }
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
              suspendUserMutation.isLoading || unsuspendUserMutation.isLoading
            }
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
      {showDeleteModal && selectedUser && (
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
          roles={roles}
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
