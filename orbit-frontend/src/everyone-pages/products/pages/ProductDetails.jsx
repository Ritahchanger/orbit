import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Layout from "../../../layout/everyone-layout/Layout";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  CheckCircle,
  Shield,
  RefreshCw,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Award,
  Phone,
  Clock,
  Tag,
  Eye,
  Truck,
} from "lucide-react";

// Import hooks - PUBLIC VERSION ONLY
import { useProduct } from "../../../admin-pages/hooks/product.hooks"; // Use only public-safe hooks

import ProductDetailsPreloader from "../../product-details/preloaders/ProductDetailsPreloader";

import RelatedProducts from "../components/RelatedProducts";

// Remove store context for public pages (users don't have stores)
// import { useStoreContext } from '../../../context/store/StoreContext'

// Remove admin hooks for public pages
// import { useStoreProduct, useRecordStoreSale, useRecordSale } from '../../../admin-pages/hooks/product.hooks'

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // PUBLIC: No store context needed for public users
  // const { currentStore, storeId } = useStoreContext()

  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("Description");
  const [quantity, setQuantity] = useState(1);

  // PUBLIC: Only fetch global product, no store-specific data
  const {
    data: productResponse,
    isLoading,
    error,
    refetch: refetchProduct,
  } = useProduct(id, true); // Always enabled for public

  // PUBLIC: Get only public-safe data
  const product = productResponse;

  // Format price - PUBLIC VERSION
  const formatPrice = (price) => {
    if (!price) return "KSh 0";
    return `KSh ${price.toLocaleString("en-KE")}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get stock status - PUBLIC VERSION (only show basic status)
  const getStockStatus = () => {
    if (!product?.stock && product?.stock !== 0)
      return { text: "Check Availability", color: "gray" };
    if (product.stock === 0) return { text: "Out of Stock", color: "red" };
    if (product.stock < (product.minStock || 5))
      return { text: "Limited Stock", color: "yellow" };
    return { text: "In Stock", color: "green" };
  };

  // Handle quantity change - PUBLIC
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  // Handle reservation inquiry - PUBLIC
  const handleInquiry = () => {
    if (!product) {
      toast.error("Product information not available.");
      return;
    }

    const phoneNumber = "+254708728793"; // Generic store number
    const message = `Hi, I'm interested in ${product.name} (SKU: ${product.sku || "N/A"}). Can you provide more details and availability?`;

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber.replace("+", "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    toast.success("Opening WhatsApp inquiry...", {
      icon: "",
      duration: 3000,
    });
  };

  // Handle add to wishlist - PUBLIC
  const handleToggleWishlist = () => {
    if (!product) return;

    setIsWishlist(!isWishlist);

    if (!isWishlist) {
      toast.success(`Added ${product.name} to wishlist`, {
        icon: "❤️",
        duration: 3000,
      });
    } else {
      toast.success(`Removed ${product.name} from wishlist`, {
        icon: "💔",
        duration: 3000,
      });
    }
  };

  // Handle share product - PUBLIC
  const handleShareProduct = () => {
    if (!product) return;

    const shareUrl = window.location.href;
    const shareText = `Check out ${product.name} at Mega Gamers: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Product link copied to clipboard!", {
        icon: "📋",
        duration: 3000,
      });
    }
  };

  // Get product images - PUBLIC VERSION (only show images)
  const getProductImages = () => {
    if (!product) return ["https://via.placeholder.com/600x400?text=No+Image"];

    const images = [];

    // Try different image sources
    if (product.primaryImage) images.push(product.primaryImage);
    if (product.images?.length > 0) {
      images.push(
        ...product.images.filter((img) => img.url).map((img) => img.url),
      );
    }
    if (product.productImages?.length > 0) {
      images.push(
        ...product.productImages.filter((img) => img.url).map((img) => img.url),
      );
    }

    return images.length > 0
      ? images
      : ["https://via.placeholder.com/600x400?text=No+Image"];
  };

  // Get product features - PUBLIC VERSION
  const getProductFeatures = () => {
    if (!product) return [];

    const features = [];

    if (product.features?.length > 0) {
      product.features.forEach((feature) => {
        features.push({
          icon: "🌟",
          title: feature,
          description: "",
        });
      });
    }

    return features.length > 0
      ? features.slice(0, 4)
      : [
          {
            icon: "🎮",
            title: "Premium Gaming",
            description: "Designed for optimal gaming performance",
          },
          {
            icon: "⚡",
            title: "Fast Response",
            description: "Low latency and high responsiveness",
          },
          {
            icon: "🔧",
            title: "Durable Build",
            description: "Built to last with quality materials",
          },
          {
            icon: "💎",
            title: "Premium Quality",
            description: "Top-tier components and construction",
          },
        ];
  };

  // Get store info from product - PUBLIC VERSION (limited info)
  const getStoreInfo = () => {
    if (!product?.store) return null;

    return {
      name: product.store.name || "Our Store",
      city: product.store.address?.city || "Nairobi",
      phone: product.store.phone || "+254 708 728 793",
    };
  };

  // Get related products (placeholder) - PUBLIC
  const getRelatedProducts = () => {
    if (!product) return [];

    // In a real app, you'd fetch related products from API
    return [
      {
        id: 1,
        name: "Gaming Headset Pro",
        price: "KSh 8,499",
        image: "https://via.placeholder.com/300x200?text=Headset",
      },
      {
        id: 2,
        name: "Mechanical Keyboard",
        price: "KSh 12,999",
        image: "https://via.placeholder.com/300x200?text=Keyboard",
      },
      {
        id: 3,
        name: "Gaming Mouse Pad",
        price: "KSh 1,999",
        image: "https://via.placeholder.com/300x200?text=Mousepad",
      },
      {
        id: 4,
        name: "Controller Charger",
        price: "KSh 3,499",
        image: "https://placeholder.com/300x200?text=Charger",
      },
    ];
  };

  // Filter product data for public display - REMOVE SENSITIVE INFO
  const getPublicProductData = () => {
    if (!product) return null;

    // Create a copy without sensitive information
    const publicProduct = { ...product };

    // Remove sensitive fields
    delete publicProduct.costPrice;
    delete publicProduct.buyingPrice;
    delete publicProduct.profitPerUnit;
    delete publicProduct.totalPotentialProfit;
    delete publicProduct.profit;
    delete publicProduct.profitPercentage;
    delete publicProduct.inventoryValue;

    // Ensure only safe fields remain
    return {
      ...publicProduct,
      // Add any computed public fields
      displayPrice: formatPrice(product.price || product.sellingPrice),
      stockStatus: getStockStatus(),
    };
  };

  const publicProduct = getPublicProductData();
  const images = getProductImages();
  const features = getProductFeatures();
  const stockStatus = getStockStatus();
  const storeInfo = getStoreInfo();
  const relatedProducts = getRelatedProducts();
  const tabs = ["Description", "Features", "Specifications"];

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <ProductDetailsPreloader />
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen gaming-theme flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Failed to load product
            </h1>
            <p className="text-gray-400 mb-6">
              {error.message || "Product not found or an error occurred"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-sm"
              >
                Back to Products
              </button>
              <button
                onClick={refetchProduct}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // No product found
  if (!product || !publicProduct) {
    return (
      <Layout>
        <div className="min-h-screen gaming-theme flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Product not found
            </h1>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-sm"
            >
              Back to Products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Description":
        return (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">
              Product Description
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {product.description ||
                  product.specs ||
                  "No description available"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-sm border border-gray-800 p-6 hover:border-primary transition"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "Specifications":
        return (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">
              Technical Specifications
            </h3>
            <div className="bg-gray-900/50 rounded-sm border border-gray-800 overflow-hidden">
              <table className="w-full">
                <tbody>
                  {product.specifications &&
                  Array.isArray(product.specifications) ? (
                    product.specifications.map((spec, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-800 last:border-b-0"
                      >
                        <td className="py-4 px-6 text-gray-300 font-medium border-r border-gray-800 w-1/3">
                          Feature {index + 1}
                        </td>
                        <td className="py-4 px-6 text-gray-400">{spec}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="py-8 text-center text-gray-400"
                      >
                        No specifications available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Features":
        return (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">Key Features</h3>
            <ul className="space-y-4">
              {product.features?.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle
                    className="text-[#00FF88] mt-1 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-gray-300">{feature}</span>
                </li>
              )) || <li className="text-gray-400">No features listed</li>}
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen gaming-theme">
        {/* Breadcrumb */}
        <div className="bg-dark-light py-4 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center text-sm text-gray-400">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 hover:text-white transition"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <ChevronRight size={16} className="mx-3" />
              <Link to="/products" className="hover:text-white transition">
                Products
              </Link>
              <ChevronRight size={16} className="mx-3" />
              <Link
                to={`/products/category/${product.category}`}
                className="hover:text-white transition capitalize"
              >
                {product.category?.replace("-", " ") || "category"}
              </Link>
              <ChevronRight size={16} className="mx-3" />
              <span className="text-white font-medium truncate max-w-xs">
                {product.name}
              </span>
            </div>
          </div>
        </div>

        {/* Main Product Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Gallery */}
              <div>
                <div className="mb-4">
                  <div className="bg-gray-900 rounded-sm overflow-hidden">
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="w-full h-96 object-contain"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-1 h-20 bg-gray-900 rounded-sm overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-transparent hover:border-gray-700"
                      }`}
                      aria-label={`View product image ${index + 1}`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div>
                {/* Brand & Category */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-semibold rounded-sm">
                    {product.brand || "Unknown Brand"}
                  </span>
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-sm capitalize">
                    {product.category?.replace("-", " ") || "uncategorized"}
                  </span>
                  <span
                    className={`px-3 py-1 ${
                      stockStatus.color === "red"
                        ? "bg-red-500/20 text-red-400"
                        : stockStatus.color === "yellow"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                    } text-sm rounded-sm flex items-center gap-1`}
                  >
                    <Tag size={12} /> {stockStatus.text}
                  </span>
                  {product.sku && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-sm">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i < Math.floor(product.rating || 4)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-600"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-white font-medium">
                      {product.rating?.toFixed(1) || "4.5"}
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">
                    {product.reviewCount || 0} reviews
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium">
                    {product.totalSold || 0} sold
                  </span>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-white">
                      {formatPrice(product.price || product.sellingPrice)}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="mt-4">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-300 font-medium">
                        Quantity:
                      </span>
                      <div className="flex items-center border border-gray-700 rounded-sm">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 text-white font-medium">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= (product.stock || 1)}
                          className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {product.stock || 0} available in stock
                      </span>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-3">
                      Key Features:
                    </h3>
                    <ul className="space-y-2">
                      {product.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle
                            size={18}
                            className="text-[#00FF88] mt-0.5 flex-shrink-0"
                          />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={handleToggleWishlist}
                      className={`p-3 rounded-sm transition ${
                        isWishlist
                          ? "bg-red-500/20 text-red-400"
                          : "bg-gray-800 text-gray-400 hover:text-white"
                      }`}
                      aria-label={
                        isWishlist ? "Remove from wishlist" : "Add to wishlist"
                      }
                    >
                      <Heart
                        size={20}
                        className={isWishlist ? "fill-current" : ""}
                      />
                    </button>

                    <button
                      onClick={handleShareProduct}
                      className="p-3 bg-gray-800 text-gray-400 rounded-sm hover:text-white transition"
                      aria-label="Share product"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>

                  {/* Public Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleInquiry}
                      disabled={product.stock === 0}
                      className="flex items-center justify-center gap-3 bg-primary hover:bg-blue-600 text-white py-4 rounded-sm font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Calendar size={22} />
                      Make Inquiry
                    </button>

                    <button
                      onClick={handleInquiry}
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-secondary to-orange-600 hover:opacity-90 text-white py-4 rounded-sm font-bold text-lg transition"
                    >
                      <Phone size={22} />
                      Contact Us
                    </button>
                  </div>
                </div>

                {/* Store Info - Public Version */}
                <div className="bg-gray-900/50 rounded-sm border border-gray-800 p-5 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="text-primary" size={24} />
                    <h3 className="text-lg font-bold text-white">
                      Available at Our Store
                    </h3>
                  </div>

                  <div className="space-y-4 mb-4">
                    <div className="p-4 rounded-sm border border-primary bg-primary/5">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-white">
                            {storeInfo?.name || "Mega Gamers Store"}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {storeInfo?.city || "Nairobi, Kenya"}
                          </p>
                          <p className="text-sm text-gray-400">
                            Phone: {storeInfo?.phone || "+254 708 728 793"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              stockStatus.color === "red"
                                ? "text-red-400"
                                : stockStatus.color === "yellow"
                                  ? "text-yellow-400"
                                  : "text-green-400"
                            }`}
                          >
                            {product.stock > 0
                              ? "In Stock"
                              : "Check Availability"}
                          </div>
                          <div className="text-xs text-gray-500">at store</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock size={14} />
                          <span>Mon-Sat: 8AM-8PM</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Truck size={14} />
                          <span>Free Consultation</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleInquiry}
                    disabled={product.stock === 0}
                    className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-sm font-medium transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Check Availability
                  </button>

                  <p className="text-gray-400 text-sm text-center">
                    Contact us for pricing, availability, and to schedule a
                    demo.
                  </p>
                </div>

                {/* Benefits - Public */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-sm">
                      <Eye size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Try Before You Buy
                      </p>
                      <p className="text-xs text-gray-400">
                        Live demos available
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-sm">
                      <Shield size={20} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Warranty</p>
                      <p className="text-xs text-gray-400">
                        {product.warranty || "1 Year"} coverage
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#00FF88]/10 rounded-sm">
                      <RefreshCw size={20} className="text-[#00FF88]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Expert Setup
                      </p>
                      <p className="text-xs text-gray-400">Free consultation</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-sm">
                      <Award size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Price Match
                      </p>
                      <p className="text-xs text-gray-400">Guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Section - Public (No Reviews tab) */}
        <section className="py-8 bg-dark-light">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Tabs - Public Version */}
              <div className="flex border-b border-gray-800 mb-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium text-lg border-b-2 whitespace-nowrap transition ${
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {renderTabContent()}
            </div>
          </div>
        </section>

        {/* Related Products */}

        <RelatedProducts productId={id} />

        {/* Store CTA - Public */}
        <section className="py-12 bg-gradient-to-r from-primary/10 via-dark-light to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-primary/20 rounded-full">
                  <MapPin className="text-primary" size={32} />
                </div>
                <div className="p-3 bg-secondary/20 rounded-full">
                  <Calendar className="text-secondary" size={32} />
                </div>
                <div className="p-3 bg-[#00FF88]/20 rounded-full">
                  <Users className="text-[#00FF88]" size={32} />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-center mb-6">
                Visit Our Store in <span className="text-primary">Nairobi</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Store Location
                  </h3>
                  <div className="bg-gray-900/50 rounded-sm border border-gray-800 p-6">
                    <div className="mb-4">
                      <p className="text-gray-300 mb-2">
                        <strong>Address:</strong>
                      </p>
                      <p className="text-gray-400">Tom Mboya Street</p>
                      <p className="text-gray-400">
                        Opposite Archives Building
                      </p>
                      <p className="text-gray-400">Nairobi, Kenya</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-300 mb-2">
                        <strong>Opening Hours:</strong>
                      </p>
                      <p className="text-gray-400">
                        Monday - Saturday: 8:00 AM - 8:00 PM
                      </p>
                      <p className="text-gray-400">
                        Sunday: 10:00 AM - 6:00 PM
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-300 mb-2">
                        <strong>Contact:</strong>
                      </p>
                      <p className="text-gray-400">
                        Phone: +254 708 728 793 | +254 707 992 593
                      </p>
                      <p className="text-gray-400">
                        Email: info@megagamers.co.ke
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Why Visit Our Store?
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle
                        className="text-[#00FF88] mt-1 flex-shrink-0"
                        size={20}
                      />
                      <span className="text-gray-300">
                        Hands-on experience with all products
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle
                        className="text-[#00FF88] mt-1 flex-shrink-0"
                        size={20}
                      />
                      <span className="text-gray-300">
                        Expert gaming advice from our specialists
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle
                        className="text-[#00FF88] mt-1 flex-shrink-0"
                        size={20}
                      />
                      <span className="text-gray-300">
                        Exclusive in-store only deals and discounts
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle
                        className="text-[#00FF88] mt-1 flex-shrink-0"
                        size={20}
                      />
                      <span className="text-gray-300">
                        Free product setup and demonstration
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle
                        className="text-[#00FF88] mt-1 flex-shrink-0"
                        size={20}
                      />
                      <span className="text-gray-300">
                        Price match guarantee for all products
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://maps.google.com/?q=Tom+Mboya+Street+Nairobi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-sm text-lg font-bold transition flex items-center justify-center gap-3"
                >
                  <MapPin size={20} />
                  Get Directions
                </a>
                <Link
                  to="/setup-consultation"
                  className="px-8 py-4 border-2 border-white/30 bg-white/5 text-white rounded-sm text-lg font-bold hover:bg-white/10 transition flex items-center justify-center gap-3"
                >
                  <Calendar size={20} />
                  Book Free Consultation
                </Link>
                <a
                  href="tel:+254700000000"
                  className="px-8 py-4 bg-[#00FF88] hover:bg-[#00DD77] text-black rounded-sm text-lg font-bold transition flex items-center justify-center gap-3"
                >
                  <Phone size={20} />
                  Call Store Now
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ProductDetails;
