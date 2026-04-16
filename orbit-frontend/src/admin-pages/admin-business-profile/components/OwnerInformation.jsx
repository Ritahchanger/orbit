import { Users } from "lucide-react"
const OwnerInformation = ({business}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700  rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-maroon-50 to-blue-50 dark:from-maroon-900/20 dark:to-blue-900/20">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-maroon-600" />
          Business Owner
        </h2>
      </div>
      <div className="p-6 space-y-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {business.owner?.fullName || "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
          <p className="text-sm text-gray-900 dark:text-white">
            {business.owner?.email || "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
          <p className="text-sm text-gray-900 dark:text-white">
            {business.owner?.phoneNo || "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerInformation;
