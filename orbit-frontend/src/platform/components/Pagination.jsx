import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, total, onPageChange }) => {
  if (!totalPages || totalPages <= 1) {
    return <p className="text-xs text-gray-500 dark:text-gray-400">{total} total</p>;
  }

  const button =
    "inline-flex items-center gap-1 px-2.5 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex gap-2">
        <button type="button" className={button} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <button
          type="button"
          className={button}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
