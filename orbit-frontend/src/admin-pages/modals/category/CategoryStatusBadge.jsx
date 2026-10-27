const CategoryStatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
      status === "active"
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
    }`}
  >
    {status || "inactive"}
  </span>
);

export default CategoryStatusBadge;
