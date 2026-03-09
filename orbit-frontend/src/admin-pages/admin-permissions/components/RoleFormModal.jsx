import { useState, useEffect } from "react"
import { X, HelpCircle } from "lucide-react"
import PermissionSelector from "./PermissionSelector"

const RoleFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    submitText,
    initialData,
    isLoading,
    isEditing = false,
    isCloning = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        level: 4,
        permissions: [],
        canAssign: false,
        isActive: true,
        ...initialData
    })

    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }))
        }
    }, [initialData])

    const validateForm = () => {
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Role name is required'
        } else if (formData.name.length < 3) {
            newErrors.name = 'Role name must be at least 3 characters'
        }

        if (formData.level < 1 || formData.level > 10) {
            newErrors.level = 'Level must be between 1 and 10'
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description cannot exceed 500 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            onSubmit(formData)
        }
    }

    const handlePermissionChange = (permissions) => {
        setFormData(prev => ({ ...prev, permissions }))
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative w-full max-w-2xl transform transition-all">
                    <div className="bg-dark border border-gray-700 rounded-sm shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="border-b border-gray-700 p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-gray-800 rounded-sm transition"
                                >
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Role Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className={`w-full px-3 py-2 bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="e.g., Operations Manager"
                                        disabled={isEditing && initialData.isSystemRole}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                                    )}
                                    {isEditing && initialData.isSystemRole && (
                                        <p className="mt-1 text-sm text-yellow-400 flex items-center gap-1">
                                            <HelpCircle className="h-3 w-3" />
                                            System roles cannot be renamed
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className={`w-full px-3 py-2 bg-gray-800 border ${errors.description ? 'border-red-500' : 'border-gray-700'} rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Describe the role's purpose and responsibilities..."
                                        rows="3"
                                    />
                                    <div className="flex justify-between mt-1">
                                        {errors.description && (
                                            <p className="text-sm text-red-400">{errors.description}</p>
                                        )}
                                        <p className={`text-xs ${formData.description.length > 500 ? 'text-red-400' : 'text-gray-400'}`}>
                                            {formData.description.length}/500
                                        </p>
                                    </div>
                                </div>

                                {/* Level and Assignable */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Level */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Level (1-10) *
                                        </label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                                            className={`w-full px-3 py-2 bg-gray-800 border ${errors.level ? 'border-red-500' : 'border-gray-700'} rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>
                                                    Level {num} {num === 10 ? '(Highest)' : num === 1 ? '(Lowest)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.level && (
                                            <p className="mt-1 text-sm text-red-400">{errors.level}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-400">
                                            Higher level roles can manage lower level roles
                                        </p>
                                    </div>

                                    {/* Can Assign */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Permissions
                                        </label>
                                        <div className="flex items-center gap-3 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.canAssign}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, canAssign: e.target.checked }))}
                                                    className="rounded-sm"
                                                />
                                                <span className="text-sm text-gray-300">Can assign other roles</span>
                                            </label>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">
                                            Allows role to assign roles at or below its level
                                        </p>
                                    </div>
                                </div>

                                {/* Status (only for editing) */}
                                {isEditing && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Status
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive !== false}
                                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                className="rounded-sm"
                                            />
                                            <span className="text-sm text-gray-300">
                                                {formData.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </label>
                                    </div>
                                )}

                                {/* Permission Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Permissions ({formData.permissions.length})
                                    </label>
                                    <PermissionSelector
                                        selectedPermissions={formData.permissions}
                                        onChange={handlePermissionChange}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-sm transition"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : submitText}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoleFormModal