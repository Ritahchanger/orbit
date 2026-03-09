import { useState, useEffect } from 'react';

import AdminLayout from "../../dashboard/layout/Layout";

import { useGetAllPermissions, useGetUserPermissions } from '../../hooks/usePermissionMutations';

import usePermissionMutations from '../../hooks/usePermissionMutations';

import { useGetAllUsers } from '../../hooks/users.hook';

import { toast } from 'react-hot-toast';

import {
    Key,
    Users,
    Search,
    Filter,
    BarChart3,
    Building,
    Settings,
    Package,
    MessageSquare
} from 'lucide-react';
import SelectedUserInfo from '../components/SelectedUserInfo';
import AssignPermissionModal from '../components/AssignPermissionModal';
import RevokePermissionModal from '../components/RevokePermissionModal';
import StatsOverview from '../components/StatsOverview';
import FilteredUsers from '../components/FilteredUsers';
import PermissionsHeader from '../components/PermissionsHeader';

import PermissionSkeletonLoader from '../preloaders/Preloader';

import { useDebounce } from '../../../globals/hooks/useDebounce';

import { useParams } from 'react-router-dom';

import { closeModal } from '../../products/redux/more-user-slice';

import { useDispatch } from 'react-redux';
import AdminUserPermission from '../components/AdminUserPermission';

const AdminPermissions = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const [userPermissions, setUserPermissions] = useState([]); // Add state for user permissions
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [moduleFilter, setModuleFilter] = useState('all');

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const { userId } = useParams()

    const dispatch = useDispatch();

    const [permissionData, setPermissionData] = useState({
        permission: '',
        scope: 'global',
        storeId: ''
    });

    // Get all users
    const {
        data: usersData,
        isLoading: usersLoading,
        refetch: refetchUsers
    } = useGetAllUsers({
        page: 1,
        limit: 100,
        search: debouncedSearchQuery.trim() ? debouncedSearchQuery : undefined
    });

    // Get all available permissions
    const {
        data: allPermissionsData,
        isLoading: permissionsLoading,
        refetch: refetchPermissions
    } = useGetAllPermissions();

    // Get user permissions when a user is selected - ADD THIS
    const {
        data: userPermissionsData,
        isLoading: userPermissionsLoading,
        refetch: refetchUserPermissions
    } = useGetUserPermissions(selectedUser?._id);

    // Update user permissions when data is fetched
    useEffect(() => {
        if (userPermissionsData?.success) {
            const permissionsArray = userPermissionsData.data?.permissions || [];
            setUserPermissions(permissionsArray);
        } else {
            setUserPermissions([]);
        }
    }, [userPermissionsData]);


    // Auto-select user from URL params when component loads

    // Get mutations from default export
    const {
        useOptimisticAssignPermission,
        useOptimisticRevokePermission
    } = usePermissionMutations;

    // Initialize mutations only when user is selected
    const assignMutation = useOptimisticAssignPermission(selectedUser?._id || '');
    const revokeMutation = useOptimisticRevokePermission(selectedUser?._id || '');

    const users = usersData?.data?.users || [];
    const allPermissions = allPermissionsData?.data || [];

    // Filter permissions by module
    const filteredPermissions = moduleFilter === 'all'
        ? allPermissions
        : allPermissions.filter(perm => perm.module === moduleFilter);

    // Get unique modules for filter
    const modules = ['all', ...new Set(allPermissions.map(p => p.module))];

    const handleAssignPermission = async () => {
        if (!selectedUser || !permissionData.permission) {
            toast.error('Please select a user and permission');
            return;
        }

        try {
            await assignMutation.mutateAsync(permissionData);
            toast.success('Permission assigned successfully');
            setShowAssignModal(false);
            setPermissionData({
                permission: '',
                scope: 'global',
                storeId: ''
            });
            // Refresh user permissions after assigning
            refetchUserPermissions();
        } catch (error) {
            toast.error(error.message || 'Failed to assign permission');
        }
    };

    const handleRevokePermission = async (permission) => {
        if (!selectedUser) return;
        try {
            await revokeMutation.mutateAsync({
                permission: permission.permission,
                scope: permission.scope,
                storeId: permission.store?._id || permission.store
            });
            toast.success('Permission revoked successfully');
            // Refresh user permissions after revoking
            refetchUserPermissions();
        } catch (error) {
            toast.error(error.message || 'Failed to revoke permission');
        }
    };

    // Get permission badge color
    const getPermissionBadgeColor = (permissionKey) => {
        const action = permissionKey.split('.')[1];
        switch (action) {
            case 'view': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'create': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'update': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'delete': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'manage': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'generate': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    // Get module icon
    const getModuleIcon = (module) => {
        const icons = {
            stores: Building,
            products: Package,
            workers: Users,
            reports: BarChart3,
            consultations: MessageSquare
        };
        return icons[module] || Settings;
    };

    // Refresh all data
    const handleRefresh = () => {
        refetchUsers();
        refetchPermissions();
        if (selectedUser) {
            refetchUserPermissions();
        }
        toast.success('Data refreshed');
    };

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

    // Update user stats to check actual permissions
    const userStats = {
        total: users.length,
        withPermissions: 0, // We'll need a different approach for this
        superAdmins: users.filter(u => u.role === 'superadmin').length,
        admins: users.filter(u => u.role === 'admin').length
    };

    // Update AvailablePermissions component to pass userPermissions
    const updateAvailablePermissionsProps = {
        filteredPermissions,
        userPermissions, // Pass user permissions
        getModuleIcon,
        getPermissionBadgeColor,
        setPermissionData,
        setShowAssignModal
    };

    useEffect(() => {
        if (userId && users.length > 0) {
            dispatch(closeModal())
            const foundUser = users.find(u => u._id === userId);
            if (foundUser) {
                setSelectedUser(foundUser);
                // Don't reset userPermissions here - let the useGetUserPermissions hook handle it
            } else {
                toast.error('User not found in the list');
            }
        }
    }, [userId, users]);

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6">
                <PermissionsHeader handleRefresh={handleRefresh} usersLoading={usersLoading} permissionsLoading={permissionsLoading} />

                <StatsOverview userStats={userStats} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* Left Column - Users List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select User</h2>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {filteredUsers.length} users
                                </div>
                            </div>

                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                                />
                            </div>

                            <FilteredUsers
                                usersLoading={usersLoading}
                                filteredUsers={filteredUsers}
                                setSelectedUser={(user) => {
                                    setSelectedUser(user);
                                    // Reset user permissions when selecting a new user
                                    setUserPermissions([]);
                                }}
                                selectedUser={selectedUser}
                            />
                        </div>

                        {/* Selected User Info */}
                        {selectedUser && (
                            <SelectedUserInfo
                                selectedUser={selectedUser}
                                userPermissions={userPermissions} // Pass user permissions
                                setShowAssignModal={setShowAssignModal}
                            />
                        )}
                    </div>

                    {/* Right Column - Permissions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-0">
                                    {selectedUser ? `${selectedUser.firstName}'s Permissions` : 'Available Permissions'}
                                </h2>

                                <div className="flex items-center gap-2">
                                    <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                                    <select
                                        value={moduleFilter}
                                        onChange={(e) => setModuleFilter(e.target.value)}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    >
                                        {modules.map(module => (
                                            <option key={module} value={module}>
                                                {module === 'all' ? 'All Modules' : module.charAt(0).toUpperCase() + module.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {permissionsLoading || userPermissionsLoading ? (
                                <PermissionSkeletonLoader />
                            ) : !selectedUser ? (
                                <div className="text-center py-12">
                                    <Key className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a User</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        Select a user from the list to view and manage their permissions
                                    </p>
                                </div>
                            ) : (
                                <AdminUserPermission userPermissions={userPermissions} updateAvailablePermissionsProps={updateAvailablePermissionsProps} handleRevokePermission={handleRevokePermission} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Assign Permission Modal */}
                {showAssignModal && selectedUser && (
                    <AssignPermissionModal
                        setShowAssignModal={setShowAssignModal}
                        selectedUser={selectedUser}
                        permissionData={permissionData}
                        setPermissionData={setPermissionData}
                        allPermissions={allPermissions}
                        handleAssignPermission={handleAssignPermission}
                        assignMutation={assignMutation}
                    />
                )}

                {/* Revoke Permission Modal */}
                {showRevokeModal && selectedUser && selectedPermission && (
                    <RevokePermissionModal
                        setShowRevokeModal={setShowRevokeModal}
                        setSelectedPermission={setSelectedPermission}
                        handleRevokePermission={handleRevokePermission}
                        revokeMutation={revokeMutation}
                    />
                )}
            </div>
        </AdminLayout>
    );

};

export default AdminPermissions;