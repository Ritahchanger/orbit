import { X, Check, Users, Shield, ListChecks, BarChart3, Clock, Copy, Edit2, EyeOff, Eye, Trash2 } from "lucide-react"

const RoleDetailsModal = ({
    isOpen,
    onClose,
    role,
    onEdit,
    onClone,
    onDelete,
    getRoleIcon,
    getRoleBadgeColor,
    getStatusDisplay,
    getPermissionCountByModule,
    getModuleIcon
}) => {
    if (!isOpen || !role) return null

    const Icon = getRoleIcon(role)
    const status = getStatusDisplay(role)
    const StatusIcon = status.icon
    const permissionCountByModule = getPermissionCountByModule(role.permissions)

    // Group permissions by module for display
    const groupedPermissions = {}
    role.permissions?.forEach(permission => {
        const [module, action] = permission.split('.')
        if (!groupedPermissions[module]) {
            groupedPermissions[module] = []
        }
        groupedPermissions[module].push({ key: permission, action })
    })

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative w-full max-w-4xl transform transition-all">
                    <div className="bg-dark border border-gray-700 rounded-sm shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="border-b border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-sm ${getRoleBadgeColor(role).replace('text-', 'bg-').split(' ')[0]}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{role.name}</h2>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className={`px-2 py-1 rounded-sm text-xs font-medium ${getRoleBadgeColor(role)} inline-flex items-center gap-1`}>
                                                Level {role.level}
                                            </div>
                                            <div className={`px-2 py-1 rounded-sm text-xs font-medium ${status.color} inline-flex items-center gap-1`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {status.text}
                                            </div>
                                            {role.isSystemRole && (
                                                <div className="px-2 py-1 rounded-sm text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                    System Role
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-800 rounded-sm transition"
                                >
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                            <p className="text-gray-300">{role.description}</p>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div>
                                    {/* Quick Stats */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Role Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-800/50 border border-gray-700 rounded-sm p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Users className="h-5 w-5 text-blue-400" />
                                                    <span className="text-sm text-gray-400">Assigned Users</span>
                                                </div>
                                                <div className="text-2xl font-bold text-white">{role.userCount || 0}</div>
                                            </div>

                                            <div className="bg-gray-800/50 border border-gray-700 rounded-sm p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <ListChecks className="h-5 w-5 text-green-400" />
                                                    <span className="text-sm text-gray-400">Total Permissions</span>
                                                </div>
                                                <div className="text-2xl font-bold text-white">{role.permissions?.length || 0}</div>
                                            </div>

                                            <div className="bg-gray-800/50 border border-gray-700 rounded-sm p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Shield className="h-5 w-5 text-yellow-400" />
                                                    <span className="text-sm text-gray-400">Role Level</span>
                                                </div>
                                                <div className="text-2xl font-bold text-white">{role.level}</div>
                                            </div>

                                            <div className="bg-gray-800/50 border border-gray-700 rounded-sm p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <BarChart3 className="h-5 w-5 text-purple-400" />
                                                    <span className="text-sm text-gray-400">Can Assign</span>
                                                </div>
                                                <div className="text-2xl font-bold text-white">
                                                    {role.canAssign ? 'Yes' : 'No'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Module-wise Permission Count */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Permissions by Module</h3>
                                        <div className="space-y-3">
                                            {Object.entries(permissionCountByModule).map(([module, count]) => {
                                                const ModuleIcon = getModuleIcon(module)
                                                return (
                                                    <div key={module} className="flex items-center justify-between bg-gray-800/30 border border-gray-700 rounded-sm p-3">
                                                        <div className="flex items-center gap-3">
                                                            <ModuleIcon className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm text-white capitalize">{module}</span>
                                                        </div>
                                                        <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-sm">
                                                            {count} permission{count !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Permissions List */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">All Permissions</h3>
                                    <div className="bg-gray-800/30 border border-gray-700 rounded-sm p-4 max-h-[400px] overflow-y-auto">
                                        {Object.entries(groupedPermissions).map(([module, perms]) => {
                                            const ModuleIcon = getModuleIcon(module)
                                            return (
                                                <div key={module} className="mb-4 last:mb-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <ModuleIcon className="h-4 w-4 text-gray-400" />
                                                        <h4 className="text-sm font-medium text-white capitalize">{module}</h4>
                                                        <span className="text-xs text-gray-500">({perms.length})</span>
                                                    </div>
                                                    <div className="space-y-2 pl-6">
                                                        {perms.map(({ key, action }) => (
                                                            <div key={key} className="flex items-center justify-between text-sm">
                                                                <span className="text-gray-300">{key}</span>
                                                                <span className={`px-2 py-0.5 rounded-sm text-xs ${action === 'view' ? 'bg-blue-500/20 text-blue-400' :
                                                                    action === 'create' ? 'bg-green-500/20 text-green-400' :
                                                                        action === 'update' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                            action === 'delete' ? 'bg-red-500/20 text-red-400' :
                                                                                action === 'manage' ? 'bg-purple-500/20 text-purple-400' :
                                                                                    'bg-gray-500/20 text-gray-400'
                                                                    }`}>
                                                                    {action}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t border-gray-700 mt-6 pt-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={onEdit}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-sm transition flex items-center gap-2"
                                        disabled={role.isSystemRole}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        Edit Role
                                    </button>
                                    <button
                                        onClick={onClone}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-sm transition flex items-center gap-2"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Clone Role
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Toggle status logic here
                                            console.log('Toggle status')
                                        }}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-sm transition flex items-center gap-2"
                                    >
                                        {role.isActive !== false ? (
                                            <>
                                                <EyeOff className="h-4 w-4" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="h-4 w-4" />
                                                Activate
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={onDelete}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-sm transition flex items-center gap-2"
                                        disabled={role.isSystemRole}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Role
                                    </button>
                                </div>
                                {role.isSystemRole && (
                                    <p className="mt-3 text-sm text-yellow-400">
                                        Note: System roles have restricted editing permissions
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoleDetailsModal