import { Search, X } from "lucide-react";

const AdminFiltersConsultation = ({
    searchQuery,
    setSearchQuery,
    setSelectedStatus,
    selectedStatus,
    statusOptions,
    setupTypes,
    selectedDate,
    setSelectedDate,
    uniqueDates,
    selectedSetupType,
    setSelectedSetupType
}) => {
    // Clear search function
    const clearSearch = () => setSearchQuery('');

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm p-6 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Search
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, reference..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title="Clear search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                    </label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    >
                        <option value="all" className="text-gray-700 dark:text-gray-300">
                            All Status
                        </option>
                        {statusOptions.map(option => (
                            <option
                                key={option.id}
                                value={option.id}
                                className="text-gray-900 dark:text-white"
                            >
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Setup Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Setup Type
                    </label>
                    <select
                        value={selectedSetupType}
                        onChange={(e) => setSelectedSetupType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    >
                        <option value="all" className="text-gray-700 dark:text-gray-300">
                            All Setup Types
                        </option>
                        {setupTypes.map(type => (
                            <option
                                key={type.id}
                                value={type.id}
                                className="text-gray-900 dark:text-white"
                            >
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date
                    </label>
                    <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    >
                        <option value="all" className="text-gray-700 dark:text-gray-300">
                            All Dates
                        </option>
                        {uniqueDates.map(date => (
                            <option
                                key={date}
                                value={date}
                                className="text-gray-900 dark:text-white"
                            >
                                {new Date(date).toLocaleDateString('en-KE', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default AdminFiltersConsultation;