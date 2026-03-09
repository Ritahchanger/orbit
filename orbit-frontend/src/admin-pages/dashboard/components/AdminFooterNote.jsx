const AdminFooterNote = ({ actualStoreLabel, isAdmin, isSuperadmin, primaryStore, format, isViewingAllStores, userRole }) => {
    return (
        <div className="mb-2 pt-4 border-t border-gray-300 dark:border-gray-800 text-center text-gray-600 dark:text-gray-500 text-xs">
            <p>Data last updated: {format(new Date(), "MMM d, yyyy 'at' h:mm a")}</p>
            <p className="mt-1">
                Viewing: {actualStoreLabel} •
                {isViewingAllStores
                    ? (isAdmin || isSuperadmin ? ' All Stores Aggregated' : ' Your Store Data')
                    : ' Store-specific Data'
                }
            </p>
            <p className="mt-1 text-gray-500 dark:text-gray-600">
                Role: {userRole} •
                {primaryStore ? ` Assigned Store: ${primaryStore.name}` : ' No assigned store'}
            </p>
        </div>
    )
}

export default AdminFooterNote