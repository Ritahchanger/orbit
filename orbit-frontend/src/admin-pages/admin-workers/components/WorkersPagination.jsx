const WorkersPagination = ({ pagination, setPage, page }) => {
    const showingFrom = (pagination.currentPage - 1) * pagination.limit + 1;
    const showingTo = Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-300 dark:border-gray-700 gap-4">
            {/* Showing text */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{showingFrom}</span> to <span className="font-medium text-gray-900 dark:text-white">{showingTo}</span> of <span className="font-medium text-gray-900 dark:text-white">{pagination.totalUsers}</span> users
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-2">
                {/* Previous button */}
                <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrev || page === 1}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm transition-colors text-sm font-medium"
                >
                    Previous
                </button>

                {/* Current page indicator */}
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-sm text-sm font-medium">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </div>

                {/* Next button */}
                <button
                    onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={!pagination.hasNext || page === pagination.totalPages}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm transition-colors text-sm font-medium"
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default WorkersPagination