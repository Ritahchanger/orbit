import SkeletonBar from "../../orders/components/OrdersSkeleton";

export const CustomersListSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900/50">
            {[...Array(6)].map((_, i) => (
              <th key={i} className="py-3 px-4">
                <SkeletonBar className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(6)].map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-gray-200 dark:border-gray-700">
              {[...Array(6)].map((_, cellIndex) => (
                <td key={cellIndex} className="py-4 px-4">
                  <SkeletonBar className={cellIndex === 0 ? "h-4 w-28" : "h-4 w-16"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const CustomerDetailSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <SkeletonBar className="h-6 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4 space-y-3"
        >
          <SkeletonBar className="h-4 w-24" />
          <SkeletonBar className="h-4 w-32" />
        </div>
      ))}
    </div>
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-4 space-y-3">
      <SkeletonBar className="h-4 w-32" />
      {[...Array(3)].map((_, i) => (
        <SkeletonBar key={i} className="h-10 w-full" />
      ))}
    </div>
  </div>
);
