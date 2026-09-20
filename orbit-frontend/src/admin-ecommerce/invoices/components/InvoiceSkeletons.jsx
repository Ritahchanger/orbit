export const InvoiceListSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
        <div className="animate-pulse divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4">
                    <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            ))}
        </div>
    </div>
);

export const InvoiceDetailSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 space-y-3">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
        </div>
    </div>
);
