import {
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

const Filters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  assignableFilter,
  setAssignableFilter,
  levelFilter,
  setLevelFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    status: false,
    type: false,
    assignable: false,
    level: false,
    sort: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLevelToggle = (level) => {
    if (levelFilter.includes(level)) {
      setLevelFilter(levelFilter.filter((l) => l !== level));
    } else {
      setLevelFilter([...levelFilter, level]);
    }
  };

  const clearLevelFilter = () => {
    setLevelFilter([]);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setAssignableFilter("all");
    setLevelFilter([]);
    setSortBy("level");
    setSortOrder("desc");
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters & Sort
        </h3>
        <button
          onClick={clearAllFilters}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-sm text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex border border-gray-300 dark:border-gray-700 rounded-sm mb-4">
        <button
          onClick={() => setViewMode("grid")}
          className={`flex-1 py-2 flex items-center justify-center gap-2 transition-colors ${
            viewMode === "grid"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Grid className="h-4 w-4" />
          Grid
        </button>
        <button
          onClick={() => setViewMode("table")}
          className={`flex-1 py-2 flex items-center justify-center gap-2 transition-colors ${
            viewMode === "table"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <List className="h-4 w-4" />
          Table
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-3 border-b border-gray-200 dark:border-gray-700 pb-3">
        <button
          onClick={() => toggleSection("status")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-900 dark:text-white mb-2"
        >
          <span>Status</span>
          {expandedSections.status ? (
            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        {expandedSections.status && (
          <div className="space-y-2">
            {[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={statusFilter === option.value}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-sm text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Type Filter */}
      <div className="mb-3 border-b border-gray-200 dark:border-gray-700 pb-3">
        <button
          onClick={() => toggleSection("type")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-900 dark:text-white mb-2"
        >
          <span>Role Type</span>
          {expandedSections.type ? (
            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        {expandedSections.type && (
          <div className="space-y-2">
            {[
              { value: "all", label: "All Types" },
              { value: "system", label: "System Roles" },
              { value: "custom", label: "Custom Roles" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={typeFilter === option.value}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-sm text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Assignable Filter */}
      <div className="mb-3 border-b border-gray-200 dark:border-gray-700 pb-3">
        <button
          onClick={() => toggleSection("assignable")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-900 dark:text-white mb-2"
        >
          <span>Can Assign</span>
          {expandedSections.assignable ? (
            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        {expandedSections.assignable && (
          <div className="space-y-2">
            {[
              { value: "all", label: "All" },
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={assignableFilter === option.value}
                  onChange={(e) => setAssignableFilter(e.target.value)}
                  className="rounded-sm text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Level Filter */}
      <div className="mb-3 border-b border-gray-200 dark:border-gray-700 pb-3">
        <button
          onClick={() => toggleSection("level")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-900 dark:text-white mb-2"
        >
          <span>Level ({levelFilter.length} selected)</span>
          {expandedSections.level ? (
            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        {expandedSections.level && (
          <div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <label
                  key={level}
                  className={`flex items-center justify-center p-2 rounded-sm border cursor-pointer transition-colors ${
                    levelFilter.includes(level)
                      ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={levelFilter.includes(level)}
                    onChange={() => handleLevelToggle(level)}
                    className="sr-only"
                  />
                  <span className="text-sm">Level {level}</span>
                </label>
              ))}
            </div>
            {levelFilter.length > 0 && (
              <button
                onClick={clearLevelFilter}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Clear levels
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sort Options */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection("sort")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-900 dark:text-white mb-2"
        >
          <span>
            Sort By: {sortBy} ({sortOrder})
          </span>
          {expandedSections.sort ? (
            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        {expandedSections.sort && (
          <div className="space-y-2">
            {[
              { field: "name", label: "Name" },
              { field: "level", label: "Level" },
              { field: "users", label: "User Count" },
              { field: "permissions", label: "Permissions" },
              { field: "createdAt", label: "Created Date" },
            ].map((option) => (
              <button
                key={option.field}
                onClick={() => handleSort(option.field)}
                className={`w-full text-left px-2 py-1.5 rounded-sm text-sm transition-colors ${
                  sortBy === option.field
                    ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {sortBy === option.field && (
                    <span className="text-xs font-medium">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {(searchQuery ||
        statusFilter !== "all" ||
        typeFilter !== "all" ||
        assignableFilter !== "all" ||
        levelFilter.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Active Filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs rounded-sm border border-blue-200 dark:border-blue-800">
                Search: "{searchQuery}"
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs rounded-sm border border-green-200 dark:border-green-800">
                Status: {statusFilter}
              </span>
            )}
            {typeFilter !== "all" && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs rounded-sm border border-purple-200 dark:border-purple-800">
                Type: {typeFilter}
              </span>
            )}
            {assignableFilter !== "all" && (
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-sm border border-yellow-200 dark:border-yellow-800">
                Assignable: {assignableFilter}
              </span>
            )}
            {levelFilter.map((level) => (
              <span
                key={level}
                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs rounded-sm border border-indigo-200 dark:border-indigo-800"
              >
                Level {level}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
