// Add this component near your other imports
export const ProductSkeletonLoader = () => {
  return (
    <div className="bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-900/50">
              {[...Array(8)].map((_, i) => (
                <th key={i} className="py-3 px-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t border-gray-200 dark:border-gray-800"
              >
                {[...Array(8)].map((_, cellIndex) => (
                  <td key={cellIndex} className="py-4 px-4">
                    <div className="space-y-2">
                      <div
                        className={`h-4 bg-gray-200 dark:bg-gray-800 rounded ${cellIndex === 0 ? "w-40" : "w-24"}`}
                      ></div>
                      {cellIndex === 0 && (
                        <div className="h-3 bg-gray-300 dark:bg-gray-900 rounded w-28"></div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const StatsSkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
            </div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
          </div>
          <div className="mt-4 h-3 bg-gray-300 dark:bg-gray-900 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
};

// Optional: Add a Chart Skeleton Loader for analytics pages
export const ChartSkeletonLoader = () => {
  return (
    <div className="bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-48"></div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"
          ></div>
        ))}
      </div>
    </div>
  );
};

// Optional: Add a Card Skeleton Loader for product cards
export const CardSkeletonLoader = () => {
  return (
    <div className="bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
