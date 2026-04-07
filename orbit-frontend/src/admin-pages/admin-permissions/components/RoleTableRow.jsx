import {
  Users,
  ListChecks,
  Check,
  X,
  Eye,
  Edit2,
  Copy,
  Trash2,
  Shield,
} from "lucide-react";

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
  getStatusDisplay,
  theme = "dark", // Add theme prop with default
}) => {
  const Icon = getRoleIcon(role);
  const status = getStatusDisplay(role);
  const StatusIcon = status.icon;

  // Theme-based styles
  const themeStyles = {
    dark: {
      row: "hover:bg-gray-900/30 border-gray-800",
      text: {
        primary: "text-white",
        secondary: "text-gray-500",
        muted: "text-gray-600",
      },
      icon: {
        default: "text-gray-500",
        action: "text-gray-400",
        disabled: "text-gray-600",
      },
      badge: {
        default: "bg-gray-800",
        success: "bg-green-900/50 text-green-400",
        warning: "bg-yellow-900/50 text-yellow-400",
        danger: "bg-red-900/50 text-red-400",
      },
      input: "rounded-sm bg-gray-900 border-gray-700",
      button: "hover:bg-gray-800",
    },
    light: {
      row: "hover:bg-gray-50 border-gray-200",
      text: {
        primary: "text-black",
        secondary: "text-black",
        muted: "text-gray-400",
      },
      icon: {
        default: "text-gray-400",
        action: "text-gray-600",
        disabled: "text-gray-300",
      },
      badge: {
        default: "bg-gray-100",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        danger: "bg-red-100 text-red-700",
      },
      input: "rounded-sm bg-white border-gray-300",
      button: "hover:bg-gray-100",
    },
  };

  const currentTheme = themeStyles[theme];

  // Helper function to get badge color based on role level
  const getLevelBadgeColor = (level) => {
    if (level >= 80) return currentTheme.badge.danger;
    if (level >= 50) return currentTheme.badge.warning;
    return currentTheme.badge.success;
  };

  // Get icon background color based on role type
  const getIconBgColor = () => {
    if (role.isSystemRole) return "bg-purple-900/20";
    if (role.level >= 80) return "bg-red-900/20";
    if (role.level >= 50) return "bg-yellow-900/20";
    return "bg-blue-900/20";
  };

  return (
    <tr
      className={`hover:${currentTheme.row} border-b border-neutral-300 ${currentTheme.row} last:border-0 transition-colors duration-150`}
    >
      {/* Checkbox */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className={`${currentTheme.input} focus:ring-2 focus:ring-blue-500`}
        />
      </td>

      {/* Role Name & Description */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-sm ${getIconBgColor()}`}>
            <Icon
              className={`h-4 w-4 ${
                role.isSystemRole
                  ? "text-purple-400"
                  : currentTheme.icon.default
              }`}
            />
          </div>
          <div>
            <div
              className={`font-medium ${currentTheme.text.primary} flex items-center gap-2`}
            >
              {role.name}
              {role.isSystemRole && (
                <Shield
                  className="h-3 w-3 text-purple-400"
                  title="System Role"
                />
              )}
            </div>
            <div
              className={`text-xs ${currentTheme.text.secondary} truncate max-w-xs`}
            >
              {role.description || "No description"}
            </div>
          </div>
        </div>
      </td>

      {/* Level */}
      <td className="px-4 py-3">
        <div
          className={`px-2 py-1 rounded-sm text-xs font-medium inline-block ${getLevelBadgeColor(role.level)}`}
        >
          Level {role.level}
        </div>
      </td>

      {/* User Count */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Users className={`h-4 w-4 ${currentTheme.icon.default}`} />
          <span className={`font-medium ${currentTheme.text.primary}`}>
            {role.userCount || 0}
          </span>
          <span className={`text-xs ${currentTheme.text.secondary}`}>
            users
          </span>
        </div>
      </td>

      {/* Permissions Count */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <ListChecks className={`h-4 w-4 ${currentTheme.icon.default}`} />
          <span className={`font-medium ${currentTheme.text.primary}`}>
            {role.permissions?.length || 0}
          </span>
          <span className={`text-xs ${currentTheme.text.secondary}`}>
            permissions
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <div
          className={`px-2 py-1 rounded-sm text-xs font-medium inline-flex items-center gap-1 ${status.color || currentTheme.badge.success}`}
        >
          <StatusIcon className="h-3 w-3" />
          {status.text}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className={`p-1.5 ${currentTheme.button} rounded-sm transition-colors`}
            title="View Details"
          >
            <Eye className="h-4 w-4 text-blue-400" />
          </button>

          <button
            onClick={onEdit}
            className={`p-1.5 ${currentTheme.button} rounded-sm transition-colors ${
              role.isSystemRole ? "cursor-not-allowed opacity-50" : ""
            }`}
            title={role.isSystemRole ? "System roles cannot be edited" : "Edit"}
            disabled={role.isSystemRole}
          >
            <Edit2
              className={`h-4 w-4 ${
                role.isSystemRole ? currentTheme.icon.disabled : "text-blue-400"
              }`}
            />
          </button>

          <button
            onClick={onClone}
            className={`p-1.5 ${currentTheme.button} rounded-sm transition-colors`}
            title="Clone"
          >
            <Copy className={`h-4 w-4 ${currentTheme.icon.action}`} />
          </button>

          <button
            onClick={onDelete}
            className={`p-1.5 ${currentTheme.button} rounded-sm transition-colors ${
              role.isSystemRole ? "cursor-not-allowed opacity-50" : ""
            }`}
            title={
              role.isSystemRole ? "System roles cannot be deleted" : "Delete"
            }
            disabled={role.isSystemRole}
          >
            <Trash2
              className={`h-4 w-4 ${
                role.isSystemRole ? currentTheme.icon.disabled : "text-red-400"
              }`}
            />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default RoleTableRow;
