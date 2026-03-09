import { Search } from "lucide-react"

const SearchAndFilters = ({ searchQuery, setSearchQuery, selectedRole, setSelectedRole, viewMode, setViewMode, roles }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-2">
            {/* Search Input */}
            <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-sm md:text-base"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
                {/* Role Filter */}
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-sm md:text-base min-w-[120px]"
                >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>

                {/* View Mode Filter */}
                <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-sm md:text-base min-w-[120px]"
                >
                    <option value="list">List View</option>
                    <option value="grid">Grid View</option>
                </select>
            </div>
        </div>
    )
}

export default SearchAndFilters