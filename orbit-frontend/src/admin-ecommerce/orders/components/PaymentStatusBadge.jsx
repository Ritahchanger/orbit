const PAYMENT_STATUS_STYLES = {
  pending: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
  paid: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20",
  failed: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20",
  refunded: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600",
};

const PaymentStatusBadge = ({ status }) => {
  const style = PAYMENT_STATUS_STYLES[status] || PAYMENT_STATUS_STYLES.pending;

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-sm capitalize ${style}`}>
      {status || "unknown"}
    </span>
  );
};

export default PaymentStatusBadge;
