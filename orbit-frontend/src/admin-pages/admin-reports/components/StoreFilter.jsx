import { Store } from "lucide-react"
const StoreFilter = ({ stores, selectedStore, setSelectedStore }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
                <Store className="inline h-4 w-4 mr-2" />
                Store Filter
            </label>
            <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
                {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                ))}
            </select>
        </div>
    )
}

export default StoreFilter