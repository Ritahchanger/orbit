import { Grid, List } from "lucide-react"

const Toggles = ({ setViewMode, viewMode, setShowInactive, showInactive }) => {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">View</label>
                <div className="flex border border-gray-300 dark:border-gray-700 rounded-sm">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 px-4 py-3 ${viewMode === 'grid' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Grid className="h-4 w-4 mx-auto" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 px-4 py-3 border-l border-gray-300 dark:border-gray-700 ${viewMode === 'list' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <List className="h-4 w-4 mx-auto" />
                    </button>
                </div>
            </div>
            <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        className="sr-only"
                    />
                    <div className={`relative w-11 h-6 rounded-full ${showInactive ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${showInactive ? 'transform translate-x-5' : ''}`} />
                    </div>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">Show Inactive</span>
                </label>
            </div>
        </div>
    )
}

export default Toggles