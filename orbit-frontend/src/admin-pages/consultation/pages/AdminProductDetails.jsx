import AdminLayout from "../../dashboard/layout/Layout"
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

import { toast } from "react-hot-toast"
import {
    ArrowLeft,
    Package,
    DollarSign,
    BarChart3,
    Tag,
    Eye,
    Edit,
    Trash2,
    TrendingUp,
    Calendar,
    Star,
    CheckCircle,
    XCircle,
    ShoppingCart,
    Layers,
    Award,
    Shield,
    Clock,
    Hash,
    Grid,
    List,
    Image,
    ChevronLeft,
    ChevronRight,
    Share2,
    Download,
    Printer,
    Copy,
    ExternalLink,
    AlertCircle,
    Loader2
} from "lucide-react"
import { useAuth } from "../../../context/authentication/AuthenticationContext"
import { openSellModal } from "../redux/sell-modal-slice"
import { useDispatch } from "react-redux"

const AdminProductDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userRole } = useAuth()

    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [selectedTab, setSelectedTab] = useState('overview')

    // Fetch product data
    const {
        data: productData,
        isLoading,
        isError,
        error,
        refetch
    } = useProductById(id)

    const product = productData?.data || {}

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(price || 0)
    }

    // Calculate profit
    const calculateProfit = () => {
        if (!product.price || !product.costPrice) return 0
        return product.price - product.costPrice
    }

    // Calculate profit percentage
    const calculateProfitPercentage = () => {
        if (!product.price || !product.costPrice || product.costPrice === 0) return 0
        return ((product.price - product.costPrice) / product.costPrice * 100).toFixed(1)
    }

    // Get stock status
    const getStockStatus = () => {
        if (product.stock === 0) return {
            text: 'Out of Stock',
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            icon: XCircle
        }
        if (product.stock <= (product.minStock || 5)) return {
            text: 'Low Stock',
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
            icon: AlertCircle
        }
        return {
            text: 'In Stock',
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            icon: CheckCircle
        }
    }

    // Handle sell click
    const handleSellClick = () => {
        dispatch(openSellModal({ product }))
    }

    // Handle edit click
    const handleEditClick = () => {
        navigate(`/admin/products/edit/${id}`)
    }

    // Handle delete click
    const handleDeleteClick = () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            // Implement delete logic here
            toast.success('Product deleted successfully')
            navigate('/admin/products')
        }
    }

    // Navigate to previous/next image
    const handlePrevImage = () => {
        setActiveImageIndex(prev =>
            prev === 0 ? (product.images?.length || 1) - 1 : prev - 1
        )
    }

    const handleNextImage = () => {
        setActiveImageIndex(prev =>
            prev === (product.images?.length || 1) - 1 ? 0 : prev + 1
        )
    }

    // Copy product link
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Product link copied to clipboard')
    }

    // Export product data
    const handleExportData = () => {
        const data = {
            'Product Name': product.name,
            'SKU': product.sku,
            'Category': product.category,
            'Brand': product.brand,
            'Price': formatPrice(product.price),
            'Cost Price': formatPrice(product.costPrice),
            'Stock': product.stock,
            'Min Stock': product.minStock,
            'Status': product.status,
            'Total Sold': product.totalSold,
            'Total Revenue': formatPrice(product.totalRevenue),
            'Created Date': new Date(product.createdAt).toLocaleDateString(),
            'Last Updated': new Date(product.updatedAt).toLocaleDateString(),
        }

        const csvContent = [
            Object.keys(data).join(','),
            Object.values(data).map(value => `"${value}"`).join(',')
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `product-${product.sku}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        toast.success('Product data exported')
    }

    // Handle go back
    const handleGoBack = () => {
        navigate(-1)
    }

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading product details...</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    if (isError) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Failed to load product</h3>
                    <p className="text-gray-400 mb-6">{error?.message || 'Product not found'}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleGoBack}
                            className="px-4 py-2 bg-gray-800 text-white rounded-sm hover:bg-gray-700"
                        >
                            <ArrowLeft className="h-4 w-4 inline mr-2" />
                            Go Back
                        </button>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    if (!product || !product._id) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <Package className="h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Product Not Found</h3>
                    <p className="text-gray-400 mb-6">The product you're looking for doesn't exist</p>
                    <button
                        onClick={handleGoBack}
                        className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-blue-600"
                    >
                        <ArrowLeft className="h-4 w-4 inline mr-2" />
                        Back to Products
                    </button>
                </div>
            </AdminLayout>
        )
    }

    const stockStatus = getStockStatus()
    const StockStatusIcon = stockStatus.icon
    const profit = calculateProfit()
    const profitPercentage = calculateProfitPercentage()
    const images = product.images || []

    return (
        <AdminLayout>
            <div className="min-h-screen bg-dark text-white p-4 md:p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <button
                                onClick={handleGoBack}
                                className="flex items-center text-gray-400 hover:text-white mb-3"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Products
                            </button>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{product.name}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-sm text-gray-400">SKU: {product.sku}</span>
                                <span className={`text-xs px-2 py-1 rounded-sm ${stockStatus.bg} ${stockStatus.color}`}>
                                    <StockStatusIcon className="h-3 w-3 inline mr-1" />
                                    {stockStatus.text}
                                </span>
                                {product.isFeatured && (
                                    <span className="text-xs px-2 py-1 rounded-sm bg-purple-500/20 text-purple-400">
                                        <Star className="h-3 w-3 inline mr-1" />
                                        Featured
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCopyLink}
                                className="p-2 hover:bg-gray-800 rounded-sm"
                                title="Copy link"
                            >
                                <Copy className="h-5 w-5 text-gray-400" />
                            </button>
                            <button
                                onClick={handleExportData}
                                className="p-2 hover:bg-gray-800 rounded-sm"
                                title="Export data"
                            >
                                <Download className="h-5 w-5 text-gray-400" />
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="p-2 hover:bg-gray-800 rounded-sm"
                                title="Print"
                            >
                                <Printer className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4">
                            <div className="flex items-center justify-between">
                                <DollarSign className="h-6 w-6 text-green-500" />
                                <span className="text-sm text-gray-400">Price</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-2">{formatPrice(product.price)}</h3>
                            <div className="text-xs text-gray-500 mt-1">Selling Price</div>
                        </div>

                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4">
                            <div className="flex items-center justify-between">
                                <Tag className="h-6 w-6 text-blue-500" />
                                <span className="text-sm text-gray-400">Cost</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-2">{formatPrice(product.costPrice)}</h3>
                            <div className="text-xs text-gray-500 mt-1">Buying Price</div>
                        </div>

                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4">
                            <div className="flex items-center justify-between">
                                <BarChart3 className="h-6 w-6 text-purple-500" />
                                <span className="text-sm text-gray-400">Profit</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-2">
                                {formatPrice(profit)} ({profitPercentage}%)
                            </h3>
                            <div className="text-xs text-gray-500 mt-1">Per Unit</div>
                        </div>

                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4">
                            <div className="flex items-center justify-between">
                                <Layers className="h-6 w-6 text-yellow-500" />
                                <span className="text-sm text-gray-400">Stock</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mt-2">{product.stock} units</h3>
                            <div className="text-xs text-gray-500 mt-1">
                                Min: {product.minStock || 5} units
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Images & Basic Info */}
                    <div className="lg:col-span-2">
                        {/* Images Gallery */}
                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Product Images</h3>
                                <span className="text-sm text-gray-400">
                                    {images.length} image{images.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Main Image */}
                            <div className="relative mb-4">
                                <div className="aspect-square bg-gray-900 rounded-sm overflow-hidden">
                                    {images.length > 0 ? (
                                        <img
                                            src={images[activeImageIndex]?.url || product.primaryImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Image className="h-16 w-16 text-gray-700" />
                                            <span className="text-gray-600 ml-2">No image</span>
                                        </div>
                                    )}
                                </div>

                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full"
                                        >
                                            <ChevronLeft className="h-5 w-5 text-white" />
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full"
                                        >
                                            <ChevronRight className="h-5 w-5 text-white" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`aspect-square rounded-sm overflow-hidden border-2 ${index === activeImageIndex ? 'border-primary' : 'border-transparent'}`}
                                        >
                                            <img
                                                src={image.url}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover hover:scale-110 transition-transform"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="bg-dark-light border border-gray-800 rounded-sm mb-6">
                            <div className="border-b border-gray-800">
                                <div className="flex">
                                    <button
                                        onClick={() => setSelectedTab('overview')}
                                        className={`px-6 py-3 text-sm font-medium ${selectedTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        onClick={() => setSelectedTab('details')}
                                        className={`px-6 py-3 text-sm font-medium ${selectedTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => setSelectedTab('sales')}
                                        className={`px-6 py-3 text-sm font-medium ${selectedTab === 'sales' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Sales History
                                    </button>
                                    <button
                                        onClick={() => setSelectedTab('activity')}
                                        className={`px-6 py-3 text-sm font-medium ${selectedTab === 'activity' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Activity
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {selectedTab === 'overview' && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-white mb-4">Product Overview</h4>
                                        <p className="text-gray-300 mb-6">{product.description}</p>

                                        {product.features && product.features.length > 0 && (
                                            <div className="mb-6">
                                                <h5 className="font-medium text-white mb-3">Key Features</h5>
                                                <ul className="space-y-2">
                                                    {product.features.map((feature, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-300">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {product.specifications && product.specifications.length > 0 && (
                                            <div>
                                                <h5 className="font-medium text-white mb-3">Specifications</h5>
                                                <ul className="space-y-2">
                                                    {product.specifications.map((spec, index) => (
                                                        <li key={index} className="flex items-center text-gray-300">
                                                            <Hash className="h-3 w-3 text-gray-500 mr-2" />
                                                            {spec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedTab === 'details' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h5 className="font-medium text-white mb-3">Basic Information</h5>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-sm text-gray-500">Brand</div>
                                                    <div className="text-white">{product.brand || 'Not specified'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Category</div>
                                                    <div className="text-white">{product.category || 'Not specified'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Warranty</div>
                                                    <div className="text-white">{product.warranty || 'Not specified'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Product Type</div>
                                                    <div className="text-white">{product.productType || 'Not specified'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {product.weight && (
                                            <div>
                                                <h5 className="font-medium text-white mb-3">Physical Attributes</h5>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-sm text-gray-500">Weight</div>
                                                        <div className="text-white">{product.weight}</div>
                                                    </div>
                                                    {product.dimensions && (
                                                        <div>
                                                            <div className="text-sm text-gray-500">Dimensions</div>
                                                            <div className="text-white">{product.dimensions}</div>
                                                        </div>
                                                    )}
                                                    {product.color && (
                                                        <div>
                                                            <div className="text-sm text-gray-500">Color</div>
                                                            <div className="text-white">{product.color}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h5 className="font-medium text-white mb-3">Inventory Information</h5>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-sm text-gray-500">Current Stock</div>
                                                    <div className="text-white">{product.stock} units</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Minimum Stock</div>
                                                    <div className="text-white">{product.minStock || 5} units</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Last Restock</div>
                                                    <div className="text-white">
                                                        {product.lastRestock ? new Date(product.lastRestock).toLocaleDateString() : 'Never'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Created On</div>
                                                    <div className="text-white">
                                                        {new Date(product.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedTab === 'sales' && (
                                    <div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-gray-900/50 p-4 rounded-sm">
                                                <div className="text-sm text-gray-400">Total Sold</div>
                                                <div className="text-2xl font-bold text-white">{product.totalSold || 0}</div>
                                            </div>
                                            <div className="bg-gray-900/50 p-4 rounded-sm">
                                                <div className="text-sm text-gray-400">Total Revenue</div>
                                                <div className="text-2xl font-bold text-white">{formatPrice(product.totalRevenue || 0)}</div>
                                            </div>
                                            <div className="bg-gray-900/50 p-4 rounded-sm">
                                                <div className="text-sm text-gray-400">Avg. Price</div>
                                                <div className="text-2xl font-bold text-white">{formatPrice(product.price || 0)}</div>
                                            </div>
                                            <div className="bg-gray-900/50 p-4 rounded-sm">
                                                <div className="text-sm text-gray-400">Profit Margin</div>
                                                <div className="text-2xl font-bold text-white">{profitPercentage}%</div>
                                            </div>
                                        </div>

                                        {product.totalSold === 0 ? (
                                            <div className="text-center py-8">
                                                <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-400">No sales recorded yet</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-400">Sales chart would appear here</p>
                                                <p className="text-sm text-gray-500 mt-2">Implement sales history chart</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedTab === 'activity' && (
                                    <div>
                                        <h5 className="font-medium text-white mb-4">Recent Activity</h5>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-sm">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                                                    <div>
                                                        <div className="text-white">Product Created</div>
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(product.createdAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-sm">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-gray-500 mr-3" />
                                                    <div>
                                                        <div className="text-white">Last Updated</div>
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(product.updatedAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions & Stats */}
                    <div>
                        {/* Actions Card */}
                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4 mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleSellClick}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white rounded-sm hover:bg-blue-600"
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Sell Product
                                </button>

                                {userRole === 'superadmin' && (
                                    <>
                                        <button
                                            onClick={handleEditClick}
                                            className="w-full flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-sm hover:bg-yellow-700"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Product
                                        </button>

                                        <button
                                            onClick={handleDeleteClick}
                                            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-sm hover:bg-red-700"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Product
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={handleCopyLink}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-gray-800 text-white rounded-sm hover:bg-gray-700"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Link
                                </button>

                                <button
                                    onClick={() => window.open(`/products/${id}`, '_blank')}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-gray-800 text-white rounded-sm hover:bg-gray-700"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Public Page
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
                                        <span className="text-gray-300">Profit per Unit</span>
                                    </div>
                                    <span className="text-white font-medium">{formatPrice(profit)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Award className="h-4 w-4 text-yellow-400 mr-2" />
                                        <span className="text-gray-300">Profit Margin</span>
                                    </div>
                                    <span className="text-white font-medium">{profitPercentage}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Layers className="h-4 w-4 text-blue-400 mr-2" />
                                        <span className="text-gray-300">Inventory Value</span>
                                    </div>
                                    <span className="text-white font-medium">
                                        {formatPrice((product.price || 0) * (product.stock || 0))}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Shield className="h-4 w-4 text-purple-400 mr-2" />
                                        <span className="text-gray-300">Days in Stock</span>
                                    </div>
                                    <span className="text-white font-medium">
                                        {Math.ceil((new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24))} days
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="bg-dark-light border border-gray-800 rounded-sm p-4 mt-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                            <p className="text-gray-400 text-sm">
                                This product was created on {new Date(product.createdAt).toLocaleDateString()}.
                                {product.stock <= (product.minStock || 5) && (
                                    <span className="text-yellow-400 block mt-2">
                                        ⚠️ Low stock alert! Consider restocking soon.
                                    </span>
                                )}
                                {product.stock === 0 && (
                                    <span className="text-red-400 block mt-2">
                                        ⚠️ Out of stock! Restock urgently needed.
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminProductDetails