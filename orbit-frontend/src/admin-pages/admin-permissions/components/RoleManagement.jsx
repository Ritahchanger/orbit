import { useState, useEffect } from "react"
import AdminLayout from "../../dashboard/layout/Layout"
import {
    Users,
    Shield,
    Plus,
    Check,
    X,
    BarChart3,

    Key,

    UserPlus,
    Settings,
    AlertCircle,
    ShieldCheck,
    ShieldAlert,
    UserCog,
    Layers,
    Crown,
    Star,
    Zap,
    Building,
    Package,
    MessageSquare,
    CreditCard,
    FileText,
    ShoppingCart
} from "lucide-react"

import {
    useRoles,
    useRole,
    useCreateRole,
    useUpdateRole,
    useDeleteRole,
    useRoleStatistics,
    useAssignableRoles
} from "../../hooks/role.hooks"

import { toast } from "react-hot-toast"
import RoleFormModal from "./RoleFormModal"
import RoleDetailsModal from "./RoleDetailsModal"
import ConfirmModal from "./ConfirmModal"
import BulkActions from "./BulkActions"
import Filters from "./Filters"
import RoleCard from "./RoleCard"
import RoleTableRow from "./RoleTableRow"
import StatisticsCard from "./StatisticsCard"

const RoleManagement = () => {
    // State management
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive'
    const [sortBy, setSortBy] = useState('level') // 'name', 'level', 'users'
    const [sortOrder, setSortOrder] = useState('desc') // 'asc' or 'desc'
    const [selectedRoles, setSelectedRoles] = useState([])
    const [selectedRole, setSelectedRole] = useState(null)

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showCloneModal, setShowCloneModal] = useState(false)
    const [showPermissionsModal, setShowPermissionsModal] = useState(false)

    // Filters state
    const [levelFilter, setLevelFilter] = useState([])
    const [typeFilter, setTypeFilter] = useState('all') // 'all', 'system', 'custom'
    const [assignableFilter, setAssignableFilter] = useState('all') // 'all', 'yes', 'no'

    // Hooks
    const {
        data: rolesData,
        isLoading: rolesLoading,
        error: rolesError,
        refetch: refetchRoles
    } = useRoles({
        includeSystemRoles: true,
        sortBy,
        sortOrder
    })

    const {
        data: statisticsData,
        isLoading: statsLoading,
        refetch: refetchStats
    } = useRoleStatistics()

    const createRoleMutation = useCreateRole()
    const updateRoleMutation = useUpdateRole()
    const deleteRoleMutation = useDeleteRole()

    const roles = rolesData?.data || []
    const statistics = statisticsData?.data || {}

    // Apply filters and search
    const filteredRoles = roles.filter(role => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const matchesSearch =
                role.name?.toLowerCase().includes(query) ||
                role.description?.toLowerCase().includes(query) ||
                role._id?.includes(query)
            if (!matchesSearch) return false
        }

        // Status filter
        if (statusFilter === 'active' && !role.isActive) return false
        if (statusFilter === 'inactive' && role.isActive) return false

        // Type filter
        if (typeFilter === 'system' && !role.isSystemRole) return false
        if (typeFilter === 'custom' && role.isSystemRole) return false

        // Assignable filter
        if (assignableFilter === 'yes' && !role.canAssign) return false
        if (assignableFilter === 'no' && role.canAssign) return false

        // Level filter
        if (levelFilter.length > 0 && !levelFilter.includes(role.level)) return false

        return true
    })

    // Sort roles
    const sortedRoles = [...filteredRoles].sort((a, b) => {
        let valueA, valueB

        switch (sortBy) {
            case 'name':
                valueA = a.name || ''
                valueB = b.name || ''
                break
            case 'level':
                valueA = a.level || 0
                valueB = b.level || 0
                break
            case 'users':
                valueA = a.userCount || 0
                valueB = b.userCount || 0
                break
            case 'permissions':
                valueA = a.permissions?.length || 0
                valueB = b.permissions?.length || 0
                break
            default:
                valueA = a.createdAt || ''
                valueB = b.createdAt || ''
        }

        if (sortOrder === 'asc') {
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
        } else {
            return valueA > valueB ? -1 : valueA < valueB ? 1 : 0
        }
    })

    // Get role icon based on name or level
    const getRoleIcon = (role) => {
        if (role.name === 'superadmin') return Crown
        if (role.name === 'admin') return ShieldCheck
        if (role.name === 'manager') return Building
        if (role.name === 'cashier') return CreditCard
        if (role.name === 'staff') return Users
        if (role.level >= 8) return Shield
        if (role.level >= 5) return Zap
        if (role.level >= 3) return Star
        return UserCog
    }

    // Get role badge color
    const getRoleBadgeColor = (role) => {
        if (role.name === 'superadmin') return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        if (role.name === 'admin') return 'bg-red-500/20 text-red-400 border-red-500/30'
        if (role.name === 'manager') return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        if (role.name === 'cashier') return 'bg-green-500/20 text-green-400 border-green-500/30'
        if (role.name === 'staff') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        if (role.level >= 8) return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
        if (role.level >= 5) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        if (role.level >= 3) return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }

    // Get status display
    const getStatusDisplay = (role) => {
        const isActive = role.isActive !== false
        return {
            text: isActive ? 'Active' : 'Inactive',
            color: isActive
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30',
            icon: isActive ? Check : X
        }
    }

    // Handle create role
    const handleCreateRole = async (roleData) => {
        try {
            await createRoleMutation.mutateAsync(roleData)
            toast.success('Role created successfully')
            setShowCreateModal(false)
            refetchRoles()
            refetchStats()
        } catch (error) {
            toast.error(error.message || 'Failed to create role')
        }
    }

    // Handle update role
    const handleUpdateRole = async (roleId, updates) => {
        try {
            await updateRoleMutation.mutateAsync({ roleId, updates })
            toast.success('Role updated successfully')
            setShowEditModal(false)
            refetchRoles()
            refetchStats()
        } catch (error) {
            toast.error(error.message || 'Failed to update role')
        }
    }

    // Handle delete role
    const handleDeleteRole = async (roleId) => {
        try {
            await deleteRoleMutation.mutateAsync(roleId)
            toast.success('Role deleted successfully')
            setShowDeleteModal(false)
            setSelectedRole(null)
            refetchRoles()
            refetchStats()
        } catch (error) {
            toast.error(error.message || 'Failed to delete role')
        }
    }

    // Handle clone role
    const handleCloneRole = async (roleId, options) => {
        try {
            // Clone logic here - you'll need to add this to your API
            // For now, we'll create a new role with similar data
            const roleToClone = roles.find(r => r._id === roleId)
            if (!roleToClone) throw new Error('Role not found')

            const clonedRole = {
                name: options.name || `${roleToClone.name}-copy`,
                description: options.description || `Copy of ${roleToClone.description}`,
                permissions: [...roleToClone.permissions],
                level: roleToClone.level,
                canAssign: roleToClone.canAssign,
                isSystemRole: false // Cloned roles should not be system roles
            }

            await createRoleMutation.mutateAsync(clonedRole)
            toast.success('Role cloned successfully')
            setShowCloneModal(false)
            refetchRoles()
            refetchStats()
        } catch (error) {
            toast.error(error.message || 'Failed to clone role')
        }
    }

    // Handle toggle selection
    const handleToggleSelect = (roleId) => {
        setSelectedRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        )
    }

    // Handle select all
    const handleSelectAll = () => {
        if (selectedRoles.length === sortedRoles.length) {
            setSelectedRoles([])
        } else {
            setSelectedRoles(sortedRoles.map(role => role._id))
        }
    }

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedRoles.length === 0) return

        try {
            // Delete each selected role
            for (const roleId of selectedRoles) {
                await deleteRoleMutation.mutateAsync(roleId)
            }

            toast.success(`${selectedRoles.length} role(s) deleted successfully`)
            setSelectedRoles([])
            refetchRoles()
            refetchStats()
        } catch (error) {
            toast.error(error.message || 'Failed to delete roles')
        }
    }

    // Handle bulk status change
    const handleBulkStatusChange = async (status) => {
        if (selectedRoles.length === 0) return

        try {
            // Update each selected role
            for (const roleId of selectedRoles) {
                await updateRoleMutation.mutateAsync({
                    roleId,
                    updates: { isActive: status }
                })
            }

            toast.success(`${selectedRoles.length} role(s) updated successfully`)
            setSelectedRoles([])
            refetchRoles()
            refetchStats()
        } catch (error) {
            toast.error(error.message || 'Failed to update roles')
        }
    }

    // Get permission count by module
    const getPermissionCountByModule = (permissions) => {
        const moduleCount = {}
        permissions?.forEach(permission => {
            const module = permission.split('.')[0]
            moduleCount[module] = (moduleCount[module] || 0) + 1
        })
        return moduleCount
    }

    // Get module icon
    const getModuleIcon = (module) => {
        const icons = {
            stores: Building,
            products: Package,
            workers: Users,
            reports: BarChart3,
            consultations: MessageSquare,
            sales: CreditCard,
            invoices: FileText,
            cart: ShoppingCart,
            permissions: Key,
            users: UserPlus,
            settings: Settings
        }
        return icons[module] || Settings
    }

    if (rolesError) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-dark text-white p-4 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                        <h2 className="text-xl font-semibold mb-2">Error Loading Roles</h2>
                        <p className="text-gray-400 mb-4">{rolesError.message}</p>
                        <button
                            onClick={() => refetchRoles()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-sm transition"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-dark text-white p-4 sm:p-6">
                {/* Header */}
                <div className="">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Role Management</h1>
                            <p className="text-gray-400">Manage user roles and permissions across the system</p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-sm transition flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create New Role
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                        <StatisticsCard
                            title="Total Roles"
                            value={statistics.totalRoles || 0}
                            icon={Layers}
                            color="bg-blue-500/20 text-blue-400"
                            loading={statsLoading}
                        />
                        <StatisticsCard
                            title="System Roles"
                            value={statistics.systemRoles || 0}
                            icon={Shield}
                            color="bg-purple-500/20 text-purple-400"
                            loading={statsLoading}
                        />
                        <StatisticsCard
                            title="Custom Roles"
                            value={statistics.customRoles || 0}
                            icon={UserCog}
                            color="bg-green-500/20 text-green-400"
                            loading={statsLoading}
                        />
                        <StatisticsCard
                            title="Total Users"
                            value={statistics.totalUsers || 0}
                            icon={Users}
                            color="bg-yellow-500/20 text-yellow-400"
                            loading={statsLoading}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <Filters
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            typeFilter={typeFilter}
                            setTypeFilter={setTypeFilter}
                            assignableFilter={assignableFilter}
                            setAssignableFilter={setAssignableFilter}
                            levelFilter={levelFilter}
                            setLevelFilter={setLevelFilter}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />

                        {/* Bulk Actions */}
                        {selectedRoles.length > 0 && (
                            <BulkActions
                                selectedCount={selectedRoles.length}
                                onBulkDelete={handleBulkDelete}
                                onBulkActivate={() => handleBulkStatusChange(true)}
                                onBulkDeactivate={() => handleBulkStatusChange(false)}
                                onClearSelection={() => setSelectedRoles([])}
                            />
                        )}
                    </div>

                    {/* Roles List */}
                    <div className="lg:col-span-3">
                        {/* Actions Bar */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-gray-400">
                                Showing {sortedRoles.length} of {roles.length} roles
                                {selectedRoles.length > 0 && (
                                    <span className="ml-2 text-blue-400">
                                        ({selectedRoles.length} selected)
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => refetchRoles()}
                                    className="p-2 hover:bg-gray-800 rounded-sm transition"
                                    title="Refresh"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {rolesLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-sm p-4 animate-pulse">
                                        <div className="h-6 bg-gray-700 rounded mb-3"></div>
                                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-700 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : sortedRoles.length === 0 ? (
                            <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-sm">
                                <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-semibold mb-2">No Roles Found</h3>
                                <p className="text-gray-400 mb-4">
                                    {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first role'}
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-sm transition"
                                >
                                    Create Role
                                </button>
                            </div>
                        ) : viewMode === 'grid' ? (
                            // Grid View
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {sortedRoles.map(role => (
                                    <RoleCard
                                        key={role._id}
                                        role={role}
                                        isSelected={selectedRoles.includes(role._id)}
                                        onToggleSelect={() => handleToggleSelect(role._id)}
                                        onViewDetails={() => {
                                            setSelectedRole(role)
                                            setShowDetailsModal(true)
                                        }}
                                        onEdit={() => {
                                            setSelectedRole(role)
                                            setShowEditModal(true)
                                        }}
                                        onClone={() => {
                                            setSelectedRole(role)
                                            setShowCloneModal(true)
                                        }}
                                        onDelete={() => {
                                            setSelectedRole(role)
                                            setShowDeleteModal(true)
                                        }}
                                        getRoleIcon={getRoleIcon}
                                        getRoleBadgeColor={getRoleBadgeColor}
                                        getStatusDisplay={getStatusDisplay}
                                        getPermissionCountByModule={getPermissionCountByModule}
                                        getModuleIcon={getModuleIcon}
                                    />
                                ))}
                            </div>
                        ) : (
                            // Table View
                            <div className="overflow-x-auto bg-gray-800/30 border border-gray-700 rounded-sm">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoles.length === sortedRoles.length && sortedRoles.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="rounded-sm"
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                                Role
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                                Level
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                                Users
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                                Permissions
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedRoles.map(role => (
                                            <RoleTableRow
                                                key={role._id}
                                                role={role}
                                                isSelected={selectedRoles.includes(role._id)}
                                                onToggleSelect={() => handleToggleSelect(role._id)}
                                                onViewDetails={() => {
                                                    setSelectedRole(role)
                                                    setShowDetailsModal(true)
                                                }}
                                                onEdit={() => {
                                                    setSelectedRole(role)
                                                    setShowEditModal(true)
                                                }}
                                                onClone={() => {
                                                    setSelectedRole(role)
                                                    setShowCloneModal(true)
                                                }}
                                                onDelete={() => {
                                                    setSelectedRole(role)
                                                    setShowDeleteModal(true)
                                                }}
                                                getRoleIcon={getRoleIcon}
                                                getRoleBadgeColor={getRoleBadgeColor}
                                                getStatusDisplay={getStatusDisplay}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modals */}
                {showCreateModal && (
                    <RoleFormModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onSubmit={handleCreateRole}
                        title="Create New Role"
                        submitText="Create Role"
                        isLoading={createRoleMutation.isLoading}
                    />
                )}

                {showEditModal && selectedRole && (
                    <RoleFormModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        onSubmit={(updates) => handleUpdateRole(selectedRole._id, updates)}
                        title={`Edit Role: ${selectedRole.name}`}
                        submitText="Update Role"
                        initialData={selectedRole}
                        isLoading={updateRoleMutation.isLoading}
                        isEditing={true}
                    />
                )}

                {showCloneModal && selectedRole && (
                    <RoleFormModal
                        isOpen={showCloneModal}
                        onClose={() => setShowCloneModal(false)}
                        onSubmit={(options) => handleCloneRole(selectedRole._id, options)}
                        title={`Clone Role: ${selectedRole.name}`}
                        submitText="Clone Role"
                        initialData={{
                            name: `${selectedRole.name}-copy`,
                            description: `Copy of ${selectedRole.description}`,
                            permissions: [...selectedRole.permissions],
                            level: selectedRole.level,
                            canAssign: selectedRole.canAssign,
                            isSystemRole: false
                        }}
                        isLoading={createRoleMutation.isLoading}
                        isCloning={true}
                    />
                )}

                {showDetailsModal && selectedRole && (
                    <RoleDetailsModal
                        isOpen={showDetailsModal}
                        onClose={() => setShowDetailsModal(false)}
                        role={selectedRole}
                        onEdit={() => {
                            setShowDetailsModal(false)
                            setShowEditModal(true)
                        }}
                        onClone={() => {
                            setShowDetailsModal(false)
                            setShowCloneModal(true)
                        }}
                        onDelete={() => {
                            setShowDetailsModal(false)
                            setShowDeleteModal(true)
                        }}
                        getRoleIcon={getRoleIcon}
                        getRoleBadgeColor={getRoleBadgeColor}
                        getStatusDisplay={getStatusDisplay}
                        getPermissionCountByModule={getPermissionCountByModule}
                        getModuleIcon={getModuleIcon}
                    />
                )}

                {showDeleteModal && selectedRole && (
                    <ConfirmModal
                        isOpen={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={() => handleDeleteRole(selectedRole._id)}
                        title="Delete Role"
                        message={`Are you sure you want to delete the role "${selectedRole.name}"? This action cannot be undone.`}
                        confirmText="Delete"
                        cancelText="Cancel"
                        variant="danger"
                        isLoading={deleteRoleMutation.isLoading}
                    />
                )}
            </div>
        </AdminLayout>
    )
}

// Add missing RefreshCw icon
const RefreshCw = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
)

export default RoleManagement