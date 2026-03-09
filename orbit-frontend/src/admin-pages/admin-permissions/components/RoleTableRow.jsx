import { Users, ListChecks, Check, X, Eye, Edit2, Copy, Trash2, Shield } from "lucide-react"

const RoleTableRow = ({
    role,
    isSelected,
    onToggleSelect,
    onViewDetails,
    onEdit,
    onClone,
    onDelete,
    getRoleIcon,
    getRoleBadgeColor,
    getStatusDisplay
}) => {
    const Icon = getRoleIcon(role)
    const status = getStatusDisplay(role)
    const StatusIcon = status.icon

    return (
        <tr className="hover:bg-gray-900/30 border-b border-gray-800 last:border-0">
            <td className="px-4 py-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggleSelect}
                    className="rounded-sm"
                />
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-sm ${getRoleBadgeColor(role).replace('text-', 'bg-').split(' ')[0]}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="font-medium text-white">{role.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                            {role.description || 'No description'}
                        </div>
                    </div>
                    {role.isSystemRole && (
                        <Shield className="h-3 w-3 text-purple-400" title="System Role" />
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className={`px-2 py-1 rounded-sm text-xs font-medium ${getRoleBadgeColor(role)}`}>
                    Level {role.level}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-white font-medium">{role.userCount || 0}</span>
                    <span className="text-xs text-gray-500">users</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-gray-500" />
                    <span className="text-white font-medium">{role.permissions?.length || 0}</span>
                    <span className="text-xs text-gray-500">permissions</span>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className={`px-2 py-1 rounded-sm text-xs font-medium ${status.color} inline-flex items-center gap-1`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.text}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onViewDetails}
                        className="p-1.5 hover:bg-gray-800 rounded-sm transition"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4 text-blue-400" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-1.5 hover:bg-gray-800 rounded-sm transition"
                        title="Edit"
                        disabled={role.isSystemRole}
                    >
                        <Edit2 className={`h-4 w-4 ${role.isSystemRole ? 'text-gray-600' : 'text-blue-400'}`} />
                    </button>
                    <button
                        onClick={onClone}
                        className="p-1.5 hover:bg-gray-800 rounded-sm transition"
                        title="Clone"
                    >
                        <Copy className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-gray-800 rounded-sm transition"
                        title="Delete"
                        disabled={role.isSystemRole}
                    >
                        <Trash2 className={`h-4 w-4 ${role.isSystemRole ? 'text-gray-600' : 'text-red-400'}`} />
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default RoleTableRow