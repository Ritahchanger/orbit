// Role badge component
import { User, Settings, LogOut, Home, HelpCircle, BookOpen } from "lucide-react";

import { useAuth } from "../../../context/authentication/AuthenticationContext";

import { Link } from "react-router-dom";

const RoleBadge = ({ role }) => {
  const roleColors = {
    superadmin:
      "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30",
    admin: "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30",
    user: "bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30",
  };
  const roleIcons = {
    superadmin: "👑",
    admin: "🛡️",
    user: "👤",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium border ${roleColors[role] || roleColors.user}`}
    >
      {roleIcons[role] || roleIcons.user} {role?.toUpperCase()}
    </span>
  );
};

const ShowUserMenu = ({ setShowUserMenu, handleLogout }) => {
  const { user, userRole } = useAuth();

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email;
    }
    return "Admin User";
  };

  const userDisplayName = getUserDisplayName();

  const handleHelpClick = () => {
    // Dispatch the same event that Ctrl + ? dispatches
    window.dispatchEvent(new CustomEvent("open-help-modal"));

    // Close the user menu
    setShowUserMenu(false);

    // You can add toast notification here if you want
    // Make sure to import toast from 'react-hot-toast' at the top
    // and uncomment the line below:
    // toast.success("Help modal opened");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => setShowUserMenu(false)}
      />

      {/* User Menu */}
      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-xl py-1 z-50">
        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {userDisplayName}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {user?.email || "admin@megagamers.com"}
          </p>
          <div className="mt-1">
            <RoleBadge role={userRole} />
          </div>
        </div>

        {/* Menu Items */}
        <Link
          to="/admin/profile"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <User className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
          My Profile
        </Link>

        <Link
          to="/"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <Home className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
          Home
        </Link>

        <Link
          to="/admin/logs"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <BookOpen className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
          Logs
        </Link>

        <Link
          to="/admin/settings/permissions"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <Settings className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
          Settings
        </Link>

        {/* Help Button - Updated with icon and keyboard shortcut */}
        <button
          onClick={handleHelpClick}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <HelpCircle className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
          Help & Support
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            Ctrl + ?
          </span>
        </button>

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-700 my-1" />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </button>
      </div>
    </>
  );
};

export default ShowUserMenu;
