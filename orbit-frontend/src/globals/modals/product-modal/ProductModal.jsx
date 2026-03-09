// components/SearchModal/GamingProductModal.jsx
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    X, Gamepad2, Headphones, Monitor, Cpu, Star,
    ExternalLink, ChevronRight,
    Battery, Zap, Shield, MapPin, Clock, Tag,
    CheckCircle, AlertCircle, Truck, Settings,
    Cpu as CpuIcon, HardDrive, MemoryStick,
    DollarSign, Package, Award, Users, Info
} from 'lucide-react';

import {
    closeModal,
    setViewMode,
} from '../../../store/features/SearchModalSlice';

const GamingProductModal = () => {
    const dispatch = useDispatch();
    const modalRef = useRef(null);
    const {
        isOpen,
        product,
        viewMode,
        loading,
    } = useSelector((state) => state.searchModal);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') dispatch(closeModal());
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen || !product) return null;

    // Category icons mapping
    const categoryIcons = {
        console: <Gamepad2 className="text-blue-400" size={20} />,
        peripheral: <Headphones className="text-purple-400" size={20} />,
        pc: <Cpu className="text-green-400" size={20} />,
        accessory: <Battery className="text-yellow-400" size={20} />,
        setup: <Monitor className="text-cyan-400" size={20} />,
        gaming_chair: <Users className="text-orange-400" size={20} />
    };

    // Render rating stars
    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                size={16}
                className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-700 text-gray-700"}
            />
        ));
    };

    // Modal content based on view mode
    const renderContent = () => {
        switch (viewMode) {
            case 'specs':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-heading font-bold text-white">Technical Specifications</h3>
                            <button
                                onClick={() => dispatch(setViewMode('details'))}
                                className="flex items-center gap-2 text-primary hover:text-[#00D4FF] transition"
                            >
                                <ChevronRight size={16} className="rotate-180" />
                                Back to Details
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.specs?.map((spec, index) => (
                                <div key={index} className="bg-gray-900/50 p-4 rounded-sm border border-gray-800">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/20 rounded-sm">
                                            {spec.icon === 'cpu' ? <CpuIcon size={18} className="text-primary" /> :
                                                spec.icon === 'memory' ? <MemoryStick size={18} className="text-purple-400" /> :
                                                    spec.icon === 'storage' ? <HardDrive size={18} className="text-green-400" /> :
                                                        <Settings size={18} className="text-cyan-400" />}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">{spec.name}</h4>
                                            <p className="text-gray-400 text-sm">{spec.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'availability':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-heading font-bold text-white">Store Availability</h3>
                            <button
                                onClick={() => dispatch(setViewMode('details'))}
                                className="flex items-center gap-2 text-primary hover:text-[#00D4FF] transition"
                            >
                                <ChevronRight size={16} className="rotate-180" />
                                Back to Details
                            </button>
                        </div>

                        <div className="bg-gray-900/50 p-6 rounded-sm border border-gray-800">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="text-primary" size={24} />
                                <div>
                                    <h4 className="font-bold text-white text-lg">Mega Gamers Store</h4>
                                    <p className="text-gray-400">Tom Mboya Street, Near National Archives</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-sm ${product.storeAvailability ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                                            {product.storeAvailability ?
                                                <CheckCircle className="text-green-400" size={20} /> :
                                                <AlertCircle className="text-red-400" size={20} />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">In-store Stock</p>
                                            <p className="text-gray-400 text-sm">{product.storeAvailability ? 'Available for pickup today' : 'Out of stock'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-sm text-sm font-medium ${product.storeAvailability ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {product.storeAvailability ? 'IN STOCK' : 'OUT OF STOCK'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-900/30 rounded-sm">
                                            <Truck className="text-blue-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Delivery</p>
                                            <p className="text-gray-400 text-sm">Available within Nairobi</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-sm text-sm font-medium">
                                        2-3 DAYS
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default: // details view
                return (
                    <>
                        {/* Product Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    {categoryIcons[product.category] || <Package size={20} className="text-gray-400" />}
                                    <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                                        {product.category.replace('_', ' ')}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-heading font-bold text-white mb-2">{product.name}</h2>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        {renderStars(product.rating)}
                                        <span className="text-gray-400 text-sm ml-2">({product.reviewCount || 42} reviews)</span>
                                    </div>
                                    {product.brand && (
                                        <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-sm">
                                            {product.brand}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {product.discount && (
                                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-sm">
                                    <span className="font-bold text-lg">-{product.discount}% OFF</span>
                                </div>
                            )}
                        </div>

                        {/* Price Section */}
                        <div className="mb-6 p-4 bg-gray-900/50 rounded-sm border border-gray-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-bold text-white">Ksh {product.price.toLocaleString()}</span>
                                        {product.originalPrice && (
                                            <span className="text-lg text-gray-400 line-through">Ksh {product.originalPrice.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1">Inclusive of all taxes</p>
                                </div>
                                {product.saveAmount && (
                                    <div className="text-right">
                                        <p className="text-green-400 font-semibold">Save Ksh {product.saveAmount.toLocaleString()}</p>
                                        <p className="text-gray-400 text-sm">With this deal</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {product.features?.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-sm">
                                        <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                            <button
                                onClick={() => dispatch(setViewMode('specs'))}
                                className="flex items-center justify-center gap-2 py-3 px-6 bg-gray-800 text-white rounded-sm font-semibold hover:bg-gray-700 transition"
                            >
                                <Settings size={20} />
                                View Specifications
                            </button>

                            <button
                                onClick={() => dispatch(setViewMode('availability'))}
                                className="flex items-center justify-center gap-2 py-3 px-6 bg-gray-800 text-white rounded-sm font-semibold hover:bg-gray-700 transition"
                            >
                                <MapPin size={20} />
                                Check Availability
                            </button>
                        </div>
                    </>
                );
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
                onClick={() => dispatch(closeModal())}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div
                    ref={modalRef}
                    className="relative w-full max-w-4xl bg-gradient-to-b from-gray-900 to-gray-950 rounded-sm border border-gray-800 shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    tabIndex={-1}
                >
                    {/* Glow Effects */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-sm blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#00D4FF]/10 rounded-sm blur-3xl" />

                    {/* Header */}
                    <div className="relative p-6 border-b border-gray-800 bg-gray-900/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-sm">
                                    {categoryIcons[product.category] || <Package size={24} className="text-primary" />}
                                </div>
                                <div>
                                    <h1 className="text-xl font-heading font-bold text-white">Product Details</h1>
                                    <p className="text-gray-400 text-sm">Explore all details about this gaming gear</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* View Mode Tabs */}
                                <div className="hidden md:flex items-center gap-1 bg-gray-800 rounded-sm p-1">
                                    {['details', 'specs', 'availability'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => dispatch(setViewMode(mode))}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === mode
                                                ? 'bg-primary text-white'
                                                : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => dispatch(closeModal())}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-sm transition"
                                    aria-label="Close modal"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-primary/30 rounded-sm animate-spin" />
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <Gamepad2 className="text-primary animate-pulse" size={24} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column - Product Image */}
                                <div className="lg:col-span-1">
                                    <div className="relative bg-gray-900/50 rounded-sm border border-gray-800 overflow-hidden p-6">
                                        <div className="aspect-square rounded-sm overflow-hidden mb-4">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                                    <Gamepad2 size={80} className="text-gray-700" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {product.tags?.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-sm"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="bg-gray-900/50 p-3 rounded-sm border border-gray-800">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Award size={16} className="text-yellow-400" />
                                                <span className="text-sm text-gray-400">Warranty</span>
                                            </div>
                                            <p className="text-white font-semibold">{product.warranty || '1 Year'}</p>
                                        </div>

                                        <div className="bg-gray-900/50 p-3 rounded-sm border border-gray-800">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock size={16} className="text-cyan-400" />
                                                <span className="text-sm text-gray-400">Delivery</span>
                                            </div>
                                            <p className="text-white font-semibold">2-3 Days</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Details */}
                                <div className="lg:col-span-2">
                                    {renderContent()}

                                    {/* Visit Store Info */}
                                    {viewMode === 'details' && product.storeAvailability && (
                                        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-[#00D4FF]/10 rounded-sm border border-primary/20">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="text-primary mt-1" size={20} />
                                                <div>
                                                    <h4 className="font-semibold text-white mb-1">Visit Our Store</h4>
                                                    <p className="text-gray-300 text-sm">
                                                        See this product in person at our Mega Gamers store.
                                                        Get hands-on experience and expert advice from our gaming specialists.
                                                    </p>
                                                    <p className="text-gray-400 text-sm mt-2">
                                                        <span className="font-medium text-primary">Location:</span> Tom Mboya Street, Near National Archives
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        <span className="font-medium text-primary">Hours:</span> 9AM - 9PM (Mon-Sat), 10AM - 6PM (Sun)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-800 bg-gray-900/30">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Shield size={18} className="text-green-400" />
                                    <span className="text-gray-300 text-sm">Authentic Products</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck size={18} className="text-blue-400" />
                                    <span className="text-gray-300 text-sm">Free Store Pickup</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award size={18} className="text-yellow-400" />
                                    <span className="text-gray-300 text-sm">Warranty Included</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => dispatch(closeModal())}
                                    className="px-6 py-2 border border-gray-700 text-gray-300 rounded-sm font-medium hover:bg-gray-800 transition"
                                >
                                    Continue Browsing
                                </button>
                                <a
                                    href="/visit"
                                    className="px-6 py-2 bg-gradient-to-r from-primary to-[#00D4FF] text-white rounded-sm font-semibold hover:opacity-90 transition"
                                >
                                    Visit Store
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GamingProductModal;