const STATUS_STYLES = {
  pending: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600",
  processing: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
  shipped: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20",
  delivered: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20",
  cancelled: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20",
  refunded: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20",
};

const OrderStatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-sm capitalize ${style}`}>
      {status || "unknown"}
    </span>
  );
};

export default OrderStatusBadge;
