export const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700  rounded-sm p-4">
    <div className="flex items-start gap-2">
      <div className="p-2 rounded-md bg-maroon-50 dark:bg-maroon-900/20">
        <Icon className="w-5 h-5 text-maroon-600 dark:text-maroon-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {value || "—"}
        </p>
      </div>
    </div>
  </div>
);
