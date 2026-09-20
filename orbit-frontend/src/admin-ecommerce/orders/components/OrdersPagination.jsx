const OrdersPagination = ({ pagination, onPageChange, itemLabel = "order" }) => {
  if (!pagination) return null;

  const { page = 1, pages = 1, total = 0 } = pagination;
  const hasPrev = page > 1;
  const hasNext = page < pages;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Page {page} of {pages} &middot; {total} {itemLabel}
        {total === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="px-3 py-1.5 text-sm rounded-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="px-3 py-1.5 text-sm rounded-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrdersPagination;
