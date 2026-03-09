import StoreCard from "./StoreCard"
const GridView = ({ filteredStores, currentStore, handleViewDetails, handleEditStore, handleDeleteStore, handleToggleStatus, handleStoreSwitch }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-6">
            {filteredStores.map(store => (
                <StoreCard
                    key={store._id}
                    store={store}
                    currentStoreId={currentStore?._id}
                    onViewDetails={() => handleViewDetails(store)}
                    onEdit={() => handleEditStore(store)}
                    onDelete={() => handleDeleteStore(store._id)}
                    onToggleStatus={() => handleToggleStatus(store._id, store.status)}
                    handleStoreSwitch={handleStoreSwitch}
                />
            ))}
        </div>
    )
}

export default GridView