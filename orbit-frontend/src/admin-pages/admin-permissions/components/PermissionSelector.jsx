import { useState } from "react"
import { Search, Check, ChevronDown, ChevronUp, X } from "lucide-react"

const PermissionSelector = ({ selectedPermissions, onChange }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedModules, setExpandedModules] = useState([])

    // Sample permission data - replace with your actual permissions
    const permissionsByModule = {
        products: [
            'products.view',
            'products.create',
            'products.update',
            'products.delete',
            'products.manage'
        ],
        sales: [
            'sales.view',
            'sales.create',
            'sales.update',
            'sales.delete',
            'sales.void',
            'sales.refund',
            'sales.discount',
            'sales.manage'
        ],
        users: [
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.manage'
        ],
        // Add more modules as needed
    }

    const toggleModule = (module) => {
        setExpandedModules(prev =>
            prev.includes(module)
                ? prev.filter(m => m !== module)
                : [...prev, module]
        )
    }

    const togglePermission = (permission) => {
        const newPermissions = selectedPermissions.includes(permission)
            ? selectedPermissions.filter(p => p !== permission)
            : [...selectedPermissions, permission]
        onChange(newPermissions)
    }

    const selectAllInModule = (module) => {
        const modulePermissions = permissionsByModule[module] || []
        const newPermissions = [...selectedPermissions]
        modulePermissions.forEach(perm => {
            if (!newPermissions.includes(perm)) {
                newPermissions.push(perm)
            }
        })
        onChange(newPermissions)
    }

    const deselectAllInModule = (module) => {
        const modulePermissions = permissionsByModule[module] || []
        const newPermissions = selectedPermissions.filter(
            perm => !modulePermissions.includes(perm)
        )
        onChange(newPermissions)
    }

    // Filter modules and permissions based on search
    const filteredModules = Object.keys(permissionsByModule).filter(module => {
        if (!searchQuery) return true
        const moduleMatches = module.toLowerCase().includes(searchQuery.toLowerCase())
        const permissionMatches = permissionsByModule[module].some(perm =>
            perm.toLowerCase().includes(searchQuery.toLowerCase())
        )
        return moduleMatches || permissionMatches
    })

    return (
        <div className="border border-gray-700 rounded-sm">
            {/* Header */}
            <div className="p-3 border-b border-gray-700 bg-gray-800/50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search permissions..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-sm text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Permissions List */}
            <div className="max-h-64 overflow-y-auto">
                {filteredModules.map(module => {
                    const isExpanded = expandedModules.includes(module)
                    const modulePermissions = permissionsByModule[module] || []
                    const selectedInModule = modulePermissions.filter(perm =>
                        selectedPermissions.includes(perm)
                    ).length
                    const allSelected = selectedInModule === modulePermissions.length

                    return (
                        <div key={module} className="border-b border-gray-800 last:border-0">
                            {/* Module Header */}
                            <div className="flex items-center justify-between p-3 hover:bg-gray-800/30 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleModule(module)}
                                        className="p-1 hover:bg-gray-700 rounded-sm"
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                    <span className="text-sm font-medium text-white capitalize">
                                        {module} ({modulePermissions.length})
                                    </span>
                                    <span className="text-xs text-blue-400">
                                        {selectedInModule} selected
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (allSelected) {
                                                deselectAllInModule(module)
                                            } else {
                                                selectAllInModule(module)
                                            }
                                        }}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        {allSelected ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            </div>

                            {/* Permissions List */}
                            {isExpanded && (
                                <div className="bg-gray-900/50 p-3 space-y-2">
                                    {modulePermissions.map(permission => {
                                        const isSelected = selectedPermissions.includes(permission)
                                        const action = permission.split('.')[1]

                                        return (
                                            <label
                                                key={permission}
                                                className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-sm cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => togglePermission(permission)}
                                                    className="rounded-sm"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-300">{permission}</div>
                                                    <div className={`text-xs px-1.5 py-0.5 rounded-sm inline-block mt-1 ${action === 'view' ? 'bg-blue-500/20 text-blue-400' :
                                                            action === 'create' ? 'bg-green-500/20 text-green-400' :
                                                                action === 'update' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    action === 'delete' ? 'bg-red-500/20 text-red-400' :
                                                                        action === 'manage' ? 'bg-purple-500/20 text-purple-400' :
                                                                            'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {action}
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <Check className="h-4 w-4 text-green-400" />
                                                )}
                                            </label>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-700 bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                        {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                        onClick={() => onChange([])}
                        className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                        <X className="h-3 w-3" />
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PermissionSelector