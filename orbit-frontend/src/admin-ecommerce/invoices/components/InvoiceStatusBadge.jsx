const STATUS_STYLES = {
    draft: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
    issued: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    paid: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    overdue: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    cancelled: "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500",
    void: "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500",
};

const InvoiceStatusBadge = ({ status }) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.draft;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm capitalize ${style}`}>
            {status || "draft"}
        </span>
    );
};

export default InvoiceStatusBadge;
