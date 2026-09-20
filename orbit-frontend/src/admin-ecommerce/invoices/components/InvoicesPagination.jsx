const InvoicesPagination = ({ pagination, onPageChange }) => {
    if (!pagination) return null;

    const { page = 1, pages = 1, total = 0, limit } = pagination;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {pages || 1} &middot; {total} invoice{total === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    Previous
                </button>
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= (pages || 1)}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default InvoicesPagination;
