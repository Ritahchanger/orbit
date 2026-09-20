const TYPE_STYLES = {
    order: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
    sale: "bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400",
    standalone: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
};

const TYPE_LABELS = {
    order: "Order",
    sale: "Sale",
    standalone: "Standalone",
};

const InvoiceTypeBadge = ({ type }) => {
    const style = TYPE_STYLES[type] || "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm ${style}`}>
            {TYPE_LABELS[type] || type || "—"}
        </span>
    );
};

export default InvoiceTypeBadge;
