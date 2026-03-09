// components/SearchableSelect.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  labelKey = "name",
  valueKey = "_id",
  searchPlaceholder = "Search...",
  disabled = false,
  loading = false,
  hasMore = false,
  onLoadMore = () => {},
  onSearch = null,
  searchDebounce = 300,
  renderOption = null,
  className = "",
  error = false,
  helperText = "",
  icon: Icon = null,
  selectedLabel = null,
  onFetchById = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsRef = useRef([]);
  const debounceRef = useRef(null);
  const fetchedIdsRef = useRef(new Set());

  // Normalize to string to avoid ObjectId vs string mismatches
  const normalizeId = (id) => (id ? String(id) : "");

  // Find selected option using normalized comparison
  const selectedOption = options.find(
    (opt) => normalizeId(opt[valueKey]) === normalizeId(value),
  );

  // Use loaded option name, or fallback selectedLabel, or nothing
  const displayLabel = selectedOption
    ? selectedOption[labelKey]
    : selectedLabel || null;

  // Always client-side filter since we're using filteredItems directly
  const filteredOptions = options.filter((opt) =>
    String(opt[labelKey]).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // When value is set but not found in loaded options, fetch it by ID
  useEffect(() => {
    const normalizedValue = normalizeId(value);
    if (
      normalizedValue &&
      !selectedOption &&
      onFetchById &&
      !loading &&
      !fetchedIdsRef.current.has(normalizedValue)
    ) {
      fetchedIdsRef.current.add(normalizedValue);
      onFetchById(normalizedValue);
    }
  }, [value, selectedOption, onFetchById, loading]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        if (onSearch) onSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onSearch]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced backend search (only used if onSearch is provided)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setHighlightedIndex(-1);

    if (!onSearch) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(val);
    }, searchDebounce);
  };

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex][valueKey]);
          setIsOpen(false);
          setSearchTerm("");
          if (onSearch) onSearch("");
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        if (onSearch) onSearch("");
        break;
      default:
        break;
    }
  };

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (
        scrollHeight - scrollTop <= clientHeight + 50 &&
        hasMore &&
        !loading
      ) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore],
  );

  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setIsOpen(false);
    setSearchTerm("");
    if (onSearch) onSearch("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Select Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border rounded-sm cursor-pointer transition-all duration-200 flex items-center justify-between ${
          error
            ? "border-red-500 dark:border-red-500"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : "bg-white dark:bg-gray-800"}`}
      >
        <div className="flex items-center space-x-2 truncate">
          {Icon && <Icon className="h-5 w-5 text-gray-400" />}
          <span
            className={`truncate ${
              !displayLabel
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {displayLabel || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {/* Helper Text */}
      {helperText && (
        <p
          className={`mt-1 text-sm ${
            error
              ? "text-red-600 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {helperText}
        </p>
      )}

      {/* Dropdown Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top:
                containerRef.current?.getBoundingClientRect().bottom +
                window.scrollY +
                4,
              left: containerRef.current?.getBoundingClientRect().left,
              width: containerRef.current?.offsetWidth,
              zIndex: 99999,
            }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      if (onSearch) onSearch("");
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div
              className="max-h-60 overflow-y-auto"
              onScroll={handleScroll}
              ref={(el) => {
                optionsRef.current = el;
              }}
            >
              {loading && filteredOptions.length === 0 ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading...
                  </p>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? `No results for "${searchTerm}"`
                      : "No options found"}
                  </p>
                </div>
              ) : (
                <>
                  {filteredOptions.map((option, index) => (
                    <div
                      key={option[valueKey]}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`px-4 py-2.5 cursor-pointer transition-colors ${
                        normalizeId(value) === normalizeId(option[valueKey])
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : highlightedIndex === index
                            ? "bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      }`}
                    >
                      {renderOption ? (
                        renderOption(option)
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{option[labelKey]}</span>
                          {option.code && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                              {option.code}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && hasMore && (
                    <div className="p-2 text-center">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600 mx-auto" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer with count */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredOptions.length} option
                {filteredOptions.length !== 1 ? "s" : ""}
                {filteredOptions.length < options.length &&
                  ` (filtered from ${options.length})`}
              </p>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SearchableSelect;
