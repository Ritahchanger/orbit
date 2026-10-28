import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./ui/Button";

// "Showing 21–40 of 134" with previous / next
const Pagination = ({ page, limit, total, totalPages, onPageChange }) => {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
      <p className="text-[13px] text-zinc-500 tabular-nums dark:text-zinc-400">
        Showing <span className="font-medium text-zinc-900 dark:text-zinc-100">{from}–{to}</span> of{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{total.toLocaleString()}</span>
      </p>
      {totalPages > 1 && (
        <div className="flex gap-2">
          <Button size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </Button>
          <Button size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
