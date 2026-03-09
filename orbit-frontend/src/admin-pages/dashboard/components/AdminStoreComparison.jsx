import { BarChart3 } from "lucide-react"

const AdminStoreComparison = ({
    hasMultipleStoresAccess,
    effectiveStoreId,
    setSelectedStoreId,
    isAdmin,
    isSuperadmin
}) => {
    return (
        <>
            {hasMultipleStoresAccess && effectiveStoreId !== 'all' && (
                <div className="mb-2 mt-2 text-center">
                    <button
                        onClick={() => setSelectedStoreId('all')}
                        className="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 
                            text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
                            hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all 
                            flex items-center gap-2 mx-auto font-medium"
                    >
                        <BarChart3 className="h-4 w-4" />
                        {isAdmin || isSuperadmin ? "Compare with Other Stores" : "View All Data"}
                    </button>
                </div>
            )}
        </>
    )
}

export default AdminStoreComparison