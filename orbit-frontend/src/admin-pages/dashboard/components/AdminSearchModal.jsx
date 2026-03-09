import {
    XCircle,
    Search,
    Package,
    X,
    Loader,
    ExternalLink,
    DollarSign,
    Tag,
    BarChart3,
    Filter,
    TrendingUp,
    Home
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useDebounce } from "../../../globals/hooks/useDebounce"
import { useSearchProducts } from "../../hooks/product.hooks"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/authentication/AuthenticationContext"
import { adminPages } from "./data/AdminPages"
const AdminSearchModal = ({ showSearchModal, setShowSearchModal, searchQuery, setSearchQuery }) => {
    const navigate = useNavigate()
    const modalRef = useRef(null)
    const inputRef = useRef(null)
    const { userRole } = useAuth()

    const debouncedSearch = useDebounce(searchQuery, 300)
    const [activeFilter, setActiveFilter] = useState('all')
    const [activeTab, setActiveTab] = useState('products') // 'products' or 'pages'
    const [showResults, setShowResults] = useState(false)
    const [recentSearches, setRecentSearches] = useState([])

    const isAdminOrSuperadmin = userRole === 'superadmin' || userRole === 'admin'

    // Admin pages data - based on user role


    // Filter pages based on user role
    const filteredPages = adminPages.filter(page =>
        page.roles.includes(userRole)
    )

    // Search hook for products
    const {
        data: productData,
        isLoading: isLoadingProducts,
        isError: isErrorProducts,
        refetch: refetchProducts
    } = useSearchProducts(
        debouncedSearch.trim(),
        1,
        10,
        !!debouncedSearch.trim() && showResults && activeTab === 'products'
    )

    // Load recent searches on mount
    useEffect(() => {
        const savedSearches = JSON.parse(localStorage.getItem('adminRecentSearches') || '[]')
        setRecentSearches(savedSearches)
    }, [])

    // Save to recent searches
    const saveToRecentSearches = (query, type = 'product') => {
        if (!query.trim()) return

        const newSearch = {
            query: query.trim(),
            timestamp: Date.now(),
            type: type
        }

        const updatedSearches = [
            newSearch,
            ...recentSearches.filter(s => s.query.toLowerCase() !== query.trim().toLowerCase())
        ].slice(0, 8)

        setRecentSearches(updatedSearches)
        localStorage.setItem('adminRecentSearches', JSON.stringify(updatedSearches))
    }

    // Close modal on ESC key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCloseModal()
            }
        }

        if (showSearchModal) {
            document.addEventListener('keydown', handleEscape)
            // Focus input when modal opens
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [showSearchModal])

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleCloseModal()
            }
        }

        if (showSearchModal) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showSearchModal])

    // Show results when search query changes
    useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            setShowResults(true)
        } else {
            setShowResults(false)
        }
    }, [searchQuery])

    // Refetch when filter changes
    useEffect(() => {
        if (debouncedSearch.trim() && showResults && activeTab === 'products') {
            refetchProducts()
        }
    }, [activeFilter, activeTab])

    const handleCloseModal = () => {
        setShowSearchModal(false)
        setSearchQuery('')
        setShowResults(false)
        setActiveFilter('all')
        setActiveTab('products')
    }

    const handleClearSearch = () => {
        setSearchQuery('')
        setShowResults(false)
        inputRef.current?.focus()
    }

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            saveToRecentSearches(searchQuery.trim(), activeTab === 'products' ? 'product' : 'page')
            handleCloseModal()

            if (activeTab === 'products') {
                navigate(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`)
            } else {
                // For page search, navigate to first matching page
                const matchingPage = searchPages(searchQuery)[0]
                if (matchingPage) {
                    navigate(matchingPage.path)
                }
            }
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            handleSearchSubmit()
        }
    }

    const handleRecentSearchClick = (query, type = 'product') => {
        setSearchQuery(query)
        if (type === 'page') {
            setActiveTab('pages')
        } else {
            setActiveTab('products')
        }
        setTimeout(() => {
            inputRef.current?.focus()
        }, 10)
    }

    const handleClearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem('adminRecentSearches')
    }

    const handleProductClick = (product) => {
        saveToRecentSearches(searchQuery.trim(), 'product')
        handleCloseModal()
        navigate(`/admin/products/${product._id}`)
    }

    const handlePageClick = (page) => {
        saveToRecentSearches(page.name, 'page')
        handleCloseModal()
        navigate(page.path)
    }

    const handleQuickAction = (action) => {
        handleCloseModal()
        switch (action) {
            case 'low_stock':
                navigate('/admin/products?filter=low_stock')
                break
            case 'out_of_stock':
                navigate('/admin/products?filter=out_of_stock')
                break
            case 'best_sellers':
                navigate('/admin/products?filter=best_sellers')
                break
            case 'needs_restock':
                navigate('/admin/products?filter=needs_restock')
                break
            default:
                break
        }
    }

    // Filter products based on active filter
    const getFilteredProducts = () => {
        if (!productData?.products) return []

        const products = productData.products

        switch (activeFilter) {
            case 'low_stock':
                return products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5))
            case 'out_of_stock':
                return products.filter(p => p.stock === 0)
            case 'in_stock':
                return products.filter(p => p.stock > 0)
            case 'best_sellers':
                return [...products].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
            case 'high_price':
                return [...products].sort((a, b) => (b.price || 0) - (a.price || 0))
            case 'low_price':
                return [...products].sort((a, b) => (a.price || 0) - (b.price || 0))
            default:
                return products
        }
    }

    // Search pages based on query
    const searchPages = (query) => {
        if (!query.trim()) return filteredPages

        const searchTerm = query.toLowerCase().trim()
        return filteredPages.filter(page =>
            page.name.toLowerCase().includes(searchTerm) ||
            page.category.toLowerCase().includes(searchTerm) ||
            page.path.toLowerCase().includes(searchTerm)
        )
    }

    const filteredProducts = activeTab === 'products' ? getFilteredProducts() : []
    const searchedPages = activeTab === 'pages' ? searchPages(searchQuery) : []
    const totalResults = activeTab === 'products' ? (productData?.pagination?.totalProducts || 0) : searchedPages.length

    if (!showSearchModal) return null

    const searchFilters = [
        { id: 'all', name: 'All Products', icon: Package, color: 'primary' },
        { id: 'in_stock', name: 'In Stock', icon: Package, color: 'green' },
        { id: 'low_stock', name: 'Low Stock', icon: Tag, color: 'yellow' },
        { id: 'out_of_stock', name: 'Out of Stock', icon: X, color: 'red' },
        { id: 'best_sellers', name: 'Best Sellers', icon: TrendingUp, color: 'purple' },
        { id: 'high_price', name: 'High Price', icon: DollarSign, color: 'blue' },
    ]

    const quickActions = [
        { id: 'low_stock', name: 'Low Stock Items', icon: Tag, color: 'yellow' },
        { id: 'out_of_stock', name: 'Out of Stock', icon: X, color: 'red' },
        { id: 'best_sellers', name: 'Best Sellers', icon: TrendingUp, color: 'green' },
        { id: 'needs_restock', name: 'Needs Restock', icon: BarChart3, color: 'orange' },
    ]

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(price)
    }

    // Get stock status
    const getStockStatus = (stock, minStock = 5) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/10' }
        if (stock <= minStock) return { text: 'Low Stock', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10' }
        return { text: 'In Stock', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10' }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={handleCloseModal}
            />

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4  h-[85vh] md:h-[80vh]">
                <div className="relative w-full max-w-6xl transform transition-all h-[]" ref={modalRef}>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm shadow-2xl overflow-hidden">
                        {/* Search Header */}
                        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Search</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Search products and admin pages
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Search Tabs */}
                            <div className="flex mb-4 gap-2">
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className={`px-4 py-2 rounded-sm font-medium transition-colors ${activeTab === 'products'
                                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <Package className="h-4 w-4 inline-block mr-2" />
                                    Products
                                </button>

                                {isAdminOrSuperadmin && (
                                    <button
                                        onClick={() => setActiveTab('pages')}
                                        className={`px-4 py-2 rounded-sm font-medium transition-colors ${activeTab === 'pages'
                                            ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        <Home className="h-4 w-4 inline-block mr-2" />
                                        Pages
                                    </button>
                                )}
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={
                                        activeTab === 'products'
                                            ? "Search by product name, SKU, category, or brand..."
                                            : "Search admin pages by name or category..."
                                    }
                                    className="w-full pl-12 pr-24 py-4 text-lg bg-gray-100 dark:bg-gray-900 border-0 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white rounded-sm"
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute inset-y-0 right-20 pr-4 flex items-center hover:text-gray-900 dark:hover:text-white"
                                    >
                                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                )}

                                {isLoadingProducts && activeTab === 'products' && (
                                    <div className="absolute inset-y-0 right-32 flex items-center">
                                        <Loader className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                                    </div>
                                )}

                                <button
                                    onClick={handleSearchSubmit}
                                    disabled={!searchQuery.trim()}
                                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-sm text-sm font-medium transition ${searchQuery.trim()
                                        ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                                        : 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Search
                                </button>
                            </div>

                            {/* Search Filters (only for products tab) */}
                            {showResults && activeTab === 'products' && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Filter by:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {searchFilters.map((filter) => (
                                            <button
                                                key={filter.id}
                                                onClick={() => setActiveFilter(filter.id)}
                                                className={`px-3 py-1.5 rounded-sm text-sm font-medium transition flex items-center gap-2 ${activeFilter === filter.id
                                                    ? `bg-blue-600 dark:bg-blue-500 text-white`
                                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <filter.icon className="h-3.5 w-3.5" />
                                                {filter.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results Section */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {!showResults ? (
                                // Recent Searches / Quick Actions
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Recent Searches */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Searches</h3>
                                            {recentSearches.length > 0 ? (
                                                <div className="space-y-2">
                                                    {recentSearches.slice(0, 5).map((search, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleRecentSearchClick(search.query, search.type)}
                                                            className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm transition-colors text-left group"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    {search.type === 'product' ? (
                                                                        <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                                    ) : (
                                                                        <Home className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                                    )}
                                                                    <span className="text-gray-700 dark:text-gray-300 text-sm group-hover:text-gray-900 dark:group-hover:text-white">
                                                                        {search.query}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {new Date(search.timestamp).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {recentSearches.length > 0 && (
                                                        <button
                                                            onClick={handleClearRecentSearches}
                                                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mt-2"
                                                        >
                                                            Clear all recent searches
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent searches</p>
                                            )}
                                        </div>

                                        {/* Quick Actions (only for products tab) */}
                                        {/* {activeTab === 'products' && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {quickActions.map((action) => (
                                                        <button
                                                            key={action.id}
                                                            onClick={() => handleQuickAction(action.id)}
                                                            className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm transition-colors text-left group"
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <action.icon className={`h-4 w-4 text-${action.color}-600 dark:text-${action.color}-400`} />
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                                                    {action.name}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">View {action.name.toLowerCase()}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )} */}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    {/* Loading State */}
                                    {isLoadingProducts && activeTab === 'products' ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mr-3" />
                                            <span className="text-gray-600 dark:text-gray-400">Searching {activeTab}...</span>
                                        </div>
                                    ) : isErrorProducts && activeTab === 'products' ? (
                                        <div className="text-center py-8">
                                            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-sm flex items-center justify-center mx-auto mb-3">
                                                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                                            </div>
                                            <p className="text-red-600 dark:text-red-400 mb-1">Error searching products</p>
                                            <p className="text-gray-500 dark:text-gray-500 text-sm">
                                                Please try again or check your connection
                                            </p>
                                        </div>
                                    ) : totalResults > 0 ? (
                                        <>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {totalResults} {activeTab === 'products' ? 'Product' : 'Page'}{totalResults !== 1 ? 's' : ''} Found
                                                    {activeTab === 'products' && activeFilter !== 'all' && ` (${filteredProducts.length} filtered)`}
                                                </h3>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Press Enter to view all results
                                                </span>
                                            </div>

                                            {activeTab === 'products' ? (
                                                /* Products Results */
                                                <div className="space-y-3">
                                                    {filteredProducts.slice(0, 8).map((product) => {
                                                        const stockStatus = getStockStatus(product.stock, product.minStock)
                                                        return (
                                                            <button
                                                                key={product._id}
                                                                onClick={() => handleProductClick(product)}
                                                                className="w-full p-4 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500/30 dark:hover:border-blue-500/30 rounded-sm transition group text-left"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-4">
                                                                        {product.primaryImage ? (
                                                                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-sm overflow-hidden">
                                                                                <img
                                                                                    src={product.primaryImage}
                                                                                    alt={product.name}
                                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-sm flex items-center justify-center">
                                                                                <Package className="h-6 w-6 text-gray-500 dark:text-gray-600" />
                                                                            </div>
                                                                        )}

                                                                        <div>
                                                                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                                                                {product.name}
                                                                            </h4>
                                                                            <div className="flex items-center gap-3 mt-1">
                                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                                    SKU: {product.sku || 'N/A'}
                                                                                </span>
                                                                                {product.brand && (
                                                                                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                                                                        {product.brand}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-4 mt-2">
                                                                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                                                    {formatPrice(product.price)}
                                                                                </span>
                                                                                <span className={`text-xs px-2 py-1 rounded-sm ${stockStatus.bg} ${stockStatus.color}`}>
                                                                                    {stockStatus.text}
                                                                                </span>
                                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                                    Stock: {product.stock}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        {product.totalSold > 0 && (
                                                                            <div className="hidden md:flex items-center gap-1 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-sm">
                                                                                <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                                                                <span className="text-xs text-gray-700 dark:text-gray-300">
                                                                                    {product.totalSold} sold
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        <ExternalLink className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                /* Pages Results */
                                                <div className="space-y-3">
                                                    {searchedPages.slice(0, 10).map((page) => {
                                                        const Icon = page.icon
                                                        return (
                                                            <button
                                                                key={page.id}
                                                                onClick={() => handlePageClick(page)}
                                                                className="w-full p-4 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500/30 dark:hover:border-blue-500/30 rounded-sm transition group text-left"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-sm flex items-center justify-center">
                                                                            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                                                                {page.name}
                                                                            </h4>
                                                                            <div className="flex items-center gap-3 mt-1">
                                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                                    {page.path}
                                                                                </span>
                                                                                <span className={`text-xs px-2 py-1 rounded-sm ${page.category === 'System'
                                                                                    ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                                                                                    : page.category === 'Management'
                                                                                        ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-400'
                                                                                    }`}>
                                                                                    {page.category}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <ExternalLink className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}

                                            {/* View All Results Button */}
                                            {totalResults > (activeTab === 'products' ? 8 : 10) && (
                                                <button
                                                    onClick={handleSearchSubmit}
                                                    className="w-full mt-4 p-4 text-center border border-gray-300 dark:border-gray-700 hover:border-blue-500/30 dark:hover:border-blue-500/30 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-900 transition group"
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                            View all {totalResults.toLocaleString()} results
                                                        </span>
                                                        <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition" />
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        Press Enter or click to view complete search results
                                                    </p>
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        /* No Results */
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="h-8 w-8 text-gray-500 dark:text-gray-600" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                No {activeTab} found
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                No {activeTab} match "{searchQuery}"{activeTab === 'products' && ' with the current filter'}
                                            </p>
                                            <div className="flex flex-wrap gap-3 justify-center">
                                                <button
                                                    onClick={handleClearSearch}
                                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-sm transition"
                                                >
                                                    Clear Search
                                                </button>
                                                {activeTab === 'products' && (
                                                    <button
                                                        onClick={() => setActiveFilter('all')}
                                                        className="px-4 py-2 bg-blue-100 dark:bg-blue-500/10 hover:bg-blue-200 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-sm transition"
                                                    >
                                                        Clear Filter
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-300 dark:border-gray-700 p-4 bg-gray-100 dark:bg-gray-900/50">
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-4">
                                    <span>Press <kbd className="px-1.5 py-0.5 bg-gray-300 dark:bg-gray-800 rounded text-xs">Esc</kbd> to close</span>
                                    <span>Press <kbd className="px-1.5 py-0.5 bg-gray-300 dark:bg-gray-800 rounded text-xs">Enter</kbd> to search</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeTab === 'products' ? (
                                        <>
                                            <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            <span>Product Search</span>
                                        </>
                                    ) : (
                                        <>
                                            <Home className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            <span>Page Search</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminSearchModal