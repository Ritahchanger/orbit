// One label/value line in the user details drawer
const DetailRow = ({ label, children }) => (
  <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
      {label}
    </dt>
    <dd className="text-sm text-gray-900 sm:text-right dark:text-white">
      {children}
    </dd>
  </div>
);

export default DetailRow;
