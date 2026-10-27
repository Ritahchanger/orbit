import { BarChart3 } from "lucide-react"
import { useStoreContext } from "../../../context/store/StoreContext"

// Shortcut to the "All stores" view, which lives in the store strip
const AdminStoreComparison = ({
    hasMultipleStoresAccess,
    effectiveStoreId,
    isAdmin,
    isSuperadmin
}) => {
    const { selectAllStores } = useStoreContext()

    if (!(isAdmin || isSuperadmin) || !hasMultipleStoresAccess || effectiveStoreId === 'all') {
        return null
    }

    return (
        <div className="text-center">
            <button
                onClick={selectAllStores}
                className="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 
                    text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
                    hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-all 
                    flex items-center gap-2 mx-auto font-medium"
            >
                <BarChart3 className="h-4 w-4" />
                Compare with Other Stores
            </button>
        </div>
    )
}

export default AdminStoreComparison
