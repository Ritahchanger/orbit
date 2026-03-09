import { Users, ListChecks, Check, X, Eye, Edit2, Copy, Trash2, ChevronRight } from "lucide-react"

const RoleCard = ({
    role,
    isSelected,
    onToggleSelect,
    onViewDetails,
    onEdit,
    onClone,
    onDelete,
    getRoleIcon,
    getRoleBadgeColor,
    getStatusDisplay,
    getPermissionCountByModule,
    getModuleIcon
}) => {
    const Icon = getRoleIcon(role)
    const status = getStatusDisplay(role)
    const StatusIcon = status.icon
    const permissionCountByModule = getPermissionCountByModule(role.permissions)

    return (
        <div className={`bg-gray-800/50 border ${isSelected ? 'border-blue-500' : 'border-gray-700'} rounded-sm p-4 hover:border-gray-600 transition-all duration-200`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onToggleSelect}
                        className="rounded-sm mt-1"
                    />
                    <div className={`p-2 rounded-sm ${getRoleBadgeColor(role).replace('text-', 'bg-').split(' ')[0]}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">{role.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`px-1.5 py-0.5 rounded-sm text-xs font-medium ${getRoleBadgeColor(role)}`}>
                                Level {role.level}
                            </div>
                            <div className={`px-1.5 py-0.5 rounded-sm text-xs font-medium ${status.color} inline-flex items-center gap-1`}>
                                <StatusIcon className="h-3 w-3" />
                                {status.text}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {role.isSystemRole && (
                        <span className="text-xs text-purple-400" title="System Role">⚙️</span>
                    )}
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {role.description || 'No description provided'}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-900/50 rounded-sm">
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <Users className="h-3 w-3" />
                        Users
                    </div>
                    <div className="text-sm font-medium text-white">{role.userCount || 0}</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded-sm">
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <ListChecks className="h-3 w-3" />
                        Permissions
                    </div>
                    <div className="text-sm font-medium text-white">{role.permissions?.length || 0}</div>
                </div>
                <div className="text-center p-2 bg-gray-900/50 rounded-sm">
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <span className="text-xs">👑</span>
                        Assign
                    </div>
                    <div className="text-sm font-medium text-white">
                        {role.canAssign ? 'Yes' : 'No'}
                    </div>
                </div>
            </div>

            {/* Module Permissions */}
            {Object.keys(permissionCountByModule).length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Top Modules</span>
                        <ChevronRight className="h-3 w-3 text-gray-500" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(permissionCountByModule)
                            .slice(0, 3)
                            .map(([module, count]) => {
                                const ModuleIcon = getModuleIcon(module)
                                return (
                                    <div
                                        key={module}
                                        className="flex items-center gap-1 px-2 py-1 bg-gray-900/50 rounded-sm"
                                        title={`${count} permissions in ${module}`}
                                    >
                                        <ModuleIcon className="h-3 w-3 text-gray-400" />
                                        <span className="text-xs text-gray-300 capitalize">{module}</span>
                                        <span className="text-xs text-blue-400 font-medium">{count}</span>
                                    </div>
                                )
                            })}
                        {Object.keys(permissionCountByModule).length > 3 && (
                            <div className="px-2 py-1 bg-gray-900/50 rounded-sm">
                                <span className="text-xs text-gray-400">
                                    +{Object.keys(permissionCountByModule).length - 3}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onViewDetails}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                    Details
                    <Eye className="h-3 w-3" />
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onEdit}
                        className="p-1.5 hover:bg-gray-800 rounded-sm transition"
                        title="Edit"
                        disabled={role.isSystemRole}
                    >
                        <Edit2 className={`h-3.5 w-3.5 ${role.isSystemRole ? 'text-gray-600' : 'text-blue-400'}`} />
                    </button>
                    <button
                        onClick={onClone}
                        className="p-1.5 hover:bg-gray-800 rounded-sm transition"
                        title="Clone"
                    >
                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-gray-800 rounded-sm transition"
                        title="Delete"
                        disabled={role.isSystemRole}
                    >
                        <Trash2 className={`h-3.5 w-3.5 ${role.isSystemRole ? 'text-gray-600' : 'text-red-400'}`} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RoleCard