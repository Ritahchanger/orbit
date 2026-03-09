import { RefreshCw, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Trash } from "lucide-react";
const PermissionsHeader = ({
  handleRefresh,
  usersLoading,
  permissionsLoading,
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Permissions Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage user permissions and access controls
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
        <button
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            navigate("/admin/trash-items");
          }}
        >
          <Trash className="h-4 w-4 mr-2" />
          Trash
        </button>
        <button
          onClick={() => navigate("/admin/roles/management")}
          className="px-4  py-2 rounded-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          title="View inventory"
        >
          <span>Manage Roles</span>
        </button>

        <button
          onClick={handleRefresh}
          disabled={usersLoading || permissionsLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-sm disabled:opacity-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <RefreshCw
            size={18}
            className={usersLoading || permissionsLoading ? "animate-spin" : ""}
          />
          <span>Refresh</span>
        </button>

        <div className="px-3 py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-sm text-sm">
          <div className="flex items-center space-x-2">
            <Key size={16} className="text-purple-600 dark:text-purple-400" />
            <span className="text-purple-700 dark:text-purple-400 font-medium">
              Access Control
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsHeader;
