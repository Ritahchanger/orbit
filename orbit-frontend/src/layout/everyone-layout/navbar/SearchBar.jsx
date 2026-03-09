import { Search, Clock, ChevronDown, TrendingUp, X, Loader, Star } from "lucide-react"


import { useState, useEffect, useCallback } from "react"



import { useSearchProducts } from "../../../admin-pages/hooks/product.hooks"



import { useDebounce } from "../../../globals/hooks/useDebounce"



import { useNavigate } from "react-router-dom"


const SearchBar = ({
    searchInput,
    handleSearchChange,
    handleKeyPress,
    handleSearchSubmit,
    showSuggestions,
    recentSearches = [],
    clearRecentSearches,
    setSearchInput,
    searchRef,
    handleSuggestionClick,
    onSearchSubmit,
    placeholder = "Search for gaming products, setups, or accessories...",
    autoFocus = true,
    maxSuggestions = 5,
}) => {
    const [localSearchInput, setLocalSearchInput] = useState(searchInput)
    const [trendingSearches] = useState([
        'PS5', 'Gaming PC', 'Headset', 'Keyboard', 'Chair',
        'Monitor', 'Mouse', 'Console', 'Laptop', 'Controller'
    ])
    const navigate = useNavigate()

    // Use the debounce hook
    const debouncedSearch = useDebounce(localSearchInput, 300)

    // Use the search products hook with debounced value
    const {
        data: searchData,
        isLoading: isSearching,
        isError,
        error,
    } = useSearchProducts(
        debouncedSearch.trim(),
        1,
        maxSuggestions,
        !!debouncedSearch.trim()
    )

    // Extract suggestions from search data
    const searchSuggestions = searchData?.products || []
    const totalResults = searchData?.pagination?.totalProducts || 0
    const hasMoreResults = totalResults > maxSuggestions

    // Sync local state with prop
    useEffect(() => {
        setLocalSearchInput(searchInput)
    }, [searchInput])

    // Save recent searches to localStorage
    useEffect(() => {
        const saveToRecentSearches = (query) => {
            if (!query.trim()) return

            const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]')
            const newSearch = {
                query: query.trim(),
                timestamp: Date.now(),
                date: new Date().toISOString()
            }

            // Remove duplicates and keep only last 10
            const updatedSearches = [
                newSearch,
                ...searches.filter(s => s.query.toLowerCase() !== query.trim().toLowerCase())
            ].slice(0, 10)

            localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
        }

        // Load recent searches on mount
        if (recentSearches.length === 0) {
            const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]')
            // You might want to pass this to parent via callback
        }
    }, [recentSearches])

    const handleLocalSearchChange = (e) => {
        const value = e.target.value
        setLocalSearchInput(value)
        handleSearchChange?.(e)
    }

    const handleLocalSearchSubmit = useCallback(() => {
        const trimmedInput = localSearchInput.trim()
        if (!trimmedInput) return

        // Save to recent searches
        const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]')
        const newSearch = {
            query: trimmedInput,
            timestamp: Date.now(),
            date: new Date().toISOString()
        }

        const updatedSearches = [
            newSearch,
            ...searches.filter(s => s.query.toLowerCase() !== trimmedInput.toLowerCase())
        ].slice(0, 10)

        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))

        handleSearchSubmit?.(trimmedInput)
        onSearchSubmit?.(trimmedInput)
    }, [localSearchInput, handleSearchSubmit, onSearchSubmit])

    const handleLocalKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLocalSearchSubmit()
        }
        handleKeyPress?.(e)
    }

    const handleSuggestionClickLocal = (product) => {
        if (handleSuggestionClick) {
            handleSuggestionClick(product)
        } else {
            navigate(`/products/${product._id || product.id}`)
            // Close suggestions
            if (searchRef?.current?.contains(document.activeElement)) {
                document.activeElement?.blur()
            }
        }
    }

    const handleTrendingClick = (trend) => {
        setSearchInput(trend)
        setLocalSearchInput(trend)
        // Small delay to ensure state update before submit
        setTimeout(() => {
            handleLocalSearchSubmit()
        }, 10)
    }

    const handleRecentSearchClick = (search) => {
        setSearchInput(search.query)
        setLocalSearchInput(search.query)
        setTimeout(() => {
            handleLocalSearchSubmit()
        }, 10)
    }

    const handleClearInput = () => {
        setLocalSearchInput('')
        setSearchInput?.('')
    }

    const getCategoryIcon = (category) => {
        const categoryIcons = {
            'gaming-pcs': '🖥️',
            'gaming-laptops': '💻',
            'mechanical-keyboards': '⌨️',
            'gaming-mice': '🖱️',
            'storage': '💾',
            'headsets': '🎧',
            'monitors': '📺',
            'chairs': '💺',
            'controllers': '🎮',
            'consoles': '🎯'
        }
        return categoryIcons[category] || '🎮'
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(price)
    }

    const getStockStatusColor = (stock, minStock) => {
        if (stock === 0) return 'text-red-400'
        if (stock <= minStock) return 'text-yellow-400'
        return 'text-green-400'
    }

    const getStockStatusText = (stock, minStock) => {
        if (stock === 0) return 'Out of Stock'
        if (stock <= minStock) return 'Low Stock'
        return 'In Stock'
    }

    const filteredTrending = trendingSearches.filter(trend =>
        trend.toLowerCase().includes(localSearchInput.toLowerCase())
    )

    const showLoading = isSearching && debouncedSearch.trim().length > 0

    return (
        <div className="py-4 border-t border-gray-800" ref={searchRef}>
            <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />

                <input
                    type="text"
                    value={localSearchInput}
                    onChange={handleLocalSearchChange}
                    onKeyDown={handleLocalKeyPress}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-24 py-3 bg-gray-900 border border-gray-700 rounded-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                    autoFocus={autoFocus}
                />

                {localSearchInput && (
                    <button
                        onClick={handleClearInput}
                        className="absolute right-24 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-300 transition"
                        title="Clear search"
                    >
                        <X size={18} />
                    </button>
                )}

                {showLoading && (
                    <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
                        <Loader size={18} className="text-primary animate-spin" />
                    </div>
                )}

                <button
                    onClick={handleLocalSearchSubmit}
                    disabled={!localSearchInput.trim() || showLoading}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 rounded-sm text-sm transition ${localSearchInput.trim() && !showLoading
                            ? 'bg-primary text-white hover:bg-blue-600'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {showLoading ? 'Searching...' : 'Search'}
                </button>

                {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-dark-light border border-gray-700 rounded-sm shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
                        {recentSearches.length > 0 && !localSearchInput && (
                            <div className="p-3 border-b border-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-400" />
                                        <h3 className="text-sm font-semibold text-gray-300">Recent Searches</h3>
                                    </div>
                                    <button
                                        onClick={clearRecentSearches}
                                        className="text-xs text-gray-500 hover:text-gray-300 transition"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {recentSearches.slice(0, 5).map((search, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleRecentSearchClick(search)}
                                            className="w-full text-left p-2 hover:bg-gray-800 rounded flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Search size={14} className="text-gray-500 group-hover:text-primary transition" />
                                                <span className="text-gray-300 group-hover:text-white transition">
                                                    {search.query}
                                                </span>
                                            </div>
                                            <Clock size={14} className="text-gray-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {filteredTrending.length > 0 && localSearchInput.length < 3 && (
                            <div className="p-3 border-b border-gray-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={16} className="text-primary" />
                                    <h3 className="text-sm font-semibold text-gray-300">
                                        {localSearchInput ? 'Related Searches' : 'Trending Now'}
                                    </h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {filteredTrending.slice(0, 8).map((trend, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleTrendingClick(trend)}
                                            className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-sm hover:bg-primary/20 transition"
                                        >
                                            {trend}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {localSearchInput.trim() !== '' && (
                            <div className="p-3">
                                {showLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader size={24} className="text-primary animate-spin mr-3" />
                                        <span className="text-gray-400">Searching products...</span>
                                    </div>
                                ) : isError ? (
                                    <div className="text-center py-6">
                                        <div className="w-12 h-12 bg-red-500/10 rounded-sm flex items-center justify-center mx-auto mb-3">
                                            <X size={24} className="text-red-500" />
                                        </div>
                                        <p className="text-red-400 mb-1">Error searching</p>
                                        <p className="text-gray-500 text-sm">
                                            {error?.message || 'Please try again'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-semibold text-gray-300 mb-4">
                                            {searchSuggestions.length > 0
                                                ? `${totalResults} result${totalResults > 1 ? 's' : ''} found for "${localSearchInput}"`
                                                : 'No results found'
                                            }
                                        </h3>

                                        {searchSuggestions.length > 0 ? (
                                            <>
                                                <div className="space-y-3">
                                                    {searchSuggestions.map((product) => (
                                                        <button
                                                            key={product._id || product.id}
                                                            onClick={() => handleSuggestionClickLocal(product)}
                                                            className="w-full p-4 hover:bg-gray-800 rounded-sm flex items-center justify-between group transition border border-gray-800 hover:border-primary/30"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative">
                                                                    {product.primaryImage || (product.images?.[0]?.url) ? (
                                                                        <div className="w-14 h-14 bg-gray-900 rounded-sm overflow-hidden">
                                                                            <img
                                                                                src={product.primaryImage || product.images[0].url}
                                                                                alt={product.name}
                                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                                loading="lazy"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-14 h-14 bg-gray-900 rounded-sm flex items-center justify-center group-hover:bg-primary/10 transition">
                                                                            <span className="text-2xl">
                                                                                {getCategoryIcon(product.category)}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    <div
                                                                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-sm border-2 border-dark-light ${getStockStatusColor(product.stock, product.minStock).replace('text-', 'bg-')
                                                                            }`}
                                                                    />
                                                                </div>

                                                                <div className="text-left max-w-[240px]">
                                                                    <p className="text-white font-medium group-hover:text-primary transition truncate">
                                                                        {product.name}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 mt-1.5">
                                                                        <span className="text-xs text-gray-400 capitalize">
                                                                            {product.category?.replace(/-/g, ' ')}
                                                                        </span>
                                                                        {product.brand && (
                                                                            <span className="text-xs text-primary font-medium">
                                                                                {product.brand}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-3 mt-2">
                                                                        <span className="text-sm font-bold text-white">
                                                                            {formatPrice(product.price || product.sellingPrice)}
                                                                        </span>
                                                                        <span className={`text-xs ${getStockStatusColor(product.stock, product.minStock)
                                                                            }`}>
                                                                            {getStockStatusText(product.stock, product.minStock)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                {product.totalSold > 0 && (
                                                                    <div className="hidden sm:flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-sm">
                                                                        <TrendingUp size={12} className="text-green-400" />
                                                                        <span className="text-xs text-gray-300">
                                                                            {product.totalSold.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {product.isFeatured && (
                                                                    <div className="hidden sm:flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-sm">
                                                                        <Star size={12} className="text-yellow-400" />
                                                                        <span className="text-xs text-primary">Featured</span>
                                                                    </div>
                                                                )}

                                                                <ChevronDown size={16} className="text-gray-500 transform -rotate-90" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>

                                                {hasMoreResults && (
                                                    <button
                                                        onClick={handleLocalSearchSubmit}
                                                        className="w-full mt-4 p-3 text-center text-primary hover:text-[#00D4FF] text-sm font-medium border border-gray-800 rounded-sm hover:bg-gray-800 transition flex items-center justify-center gap-2"
                                                    >
                                                        <Search size={16} />
                                                        View All {totalResults.toLocaleString()} Results
                                                        <ChevronDown size={16} className="transform -rotate-90" />
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-gray-900 rounded-sm flex items-center justify-center mx-auto mb-4">
                                                    <Search size={24} className="text-gray-600" />
                                                </div>
                                                <p className="text-gray-400 mb-2">
                                                    No results found for "{localSearchInput}"
                                                </p>
                                                <p className="text-gray-500 text-sm mb-4">
                                                    Try different keywords or check spelling
                                                </p>
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    <button
                                                        onClick={handleClearInput}
                                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-sm text-sm transition"
                                                    >
                                                        Clear Search
                                                    </button>
                                                    <button
                                                        onClick={() => handleTrendingClick('PS5')}
                                                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-sm text-sm transition"
                                                    >
                                                        Try "PS5"
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchBar