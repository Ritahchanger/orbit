import { useState, useEffect } from "react";
import {
  Store,
  DollarSign,
  Globe,
  AlertCircle,
  Loader2,
  MessageCircle,
  Eye,
} from "lucide-react";
import { useFeaturedProducts } from "../../../admin-pages/hooks/product.hooks";
import { useNavigate } from "react-router-dom";

const TabContent = () => {
  const [currency, setCurrency] = useState("KES");
  const [exchangeRate, setExchangeRate] = useState(143);
  const [inquiringProductId, setInquiringProductId] = useState(null);

  const navigate = useNavigate();

  // Use the React Query hook to fetch featured products
  const {
    data: featuredProductsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useFeaturedProducts(20);

  // Fetch live exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
      }
    };

    fetchExchangeRate();
  }, []);

  // Handle WhatsApp inquiry
  const handleWhatsAppInquiry = (e, product) => {
    e.stopPropagation();
    setInquiringProductId(product._id);

    // Get WhatsApp number from environment or use default
    const whatsappNumber =
      import.meta.env.VITE_WHATSAPP_NUMBER || "+254708728793";
    const cleanNumber = whatsappNumber
      .replace(/\s+/g, "")
      .replace(/[^0-9+]/g, "");

    // Create detailed message
    const message =
      `🛒 *PRODUCT INQUIRY* 🛒\n\n` +
      `*Product Name:* ${product.name}\n` +
      `*Category:* ${product.category || "Gaming"}\n` +
      `*Brand:* ${product.brand || "Not specified"}\n` +
      `*SKU:* ${product.sku || "N/A"}\n` +
      `*Price:* ${getDisplayPrice(product)}\n` +
      `*Alternate Price:* ${getAlternatePrice(product)}\n` +
      `*Stock Status:* ${product.stock > 0 ? `${product.stock} available` : "Out of stock"}\n\n` +
      `*Additional Info:*\n${product.description || "No description available"}\n\n` +
      `I'm interested in purchasing this item. Could you please:\n` +
      `1. Confirm current availability\n` +
      `2. Provide payment options\n` +
      `3. Share delivery/collection details\n\n` +
      `Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanNumber.replace("+", "")}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    // Reset inquiring state
    setTimeout(() => setInquiringProductId(null), 1500);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-400">Loading featured products...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 mb-2">Failed to load featured products</p>
        <p className="text-gray-400 text-sm mb-4">{error?.message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary/20 text-primary rounded-sm hover:bg-primary/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Handle empty state
  const products = featuredProductsData || [];

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <Store className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No featured products available</p>
        <p className="text-gray-500 text-sm mt-2">
          Check back later for featured gaming products
        </p>
      </div>
    );
  }

  // Get product image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primaryImage =
        product.images.find((img) => img.isPrimary) || product.images[0];
      return primaryImage.url || primaryImage;
    }

    // Fallback images based on category
    const category = product.category?.toLowerCase() || "";
    const name = product.name?.toLowerCase() || "";

    if (
      name.includes("ps5") ||
      name.includes("playstation") ||
      category.includes("console")
    ) {
      return "/images/ps5_console.webp";
    } else if (name.includes("xbox") || category.includes("console")) {
      return "/images/xbox_console.jpg";
    } else if (name.includes("blackshark") || category.includes("headphone")) {
      return "/images/blackshark_ps.webp";
    } else if (name.includes("corsair") || category.includes("keyboard")) {
      return "/images/corsair_ps.jpg";
    } else if (name.includes("logitech") || category.includes("mouse")) {
      return "/images/logitech_ps.jpg";
    } else if (category.includes("controller")) {
      return "/images/controller.jpg";
    } else if (category.includes("monitor")) {
      return "/images/monitor.jpg";
    } else if (category.includes("chair")) {
      return "/images/gaming_chair.jpg";
    }

    return "/images/product-placeholder.jpg";
  };

  // Convert KES to USD
  const convertToUSD = (kesPrice) => {
    const price = parseFloat(kesPrice) || 0;
    return (price / exchangeRate).toFixed(2);
  };

  // Get display price based on selected currency
  const getDisplayPrice = (product) => {
    const kesPrice = parseFloat(product.price) || 0;

    if (currency === "KES") {
      return `KSh ${kesPrice.toLocaleString("en-KE")}`;
    } else {
      const usdPrice = convertToUSD(kesPrice);
      return `$${usdPrice}`;
    }
  };

  // Get alternate currency price
  const getAlternatePrice = (product) => {
    const kesPrice = parseFloat(product.price) || 0;

    if (currency === "KES") {
      const usdPrice = convertToUSD(kesPrice);
      return `$${usdPrice}`;
    } else {
      return `KSh ${kesPrice.toLocaleString("en-KE")}`;
    }
  };

  // Get stock status
  const getStockStatus = (product) => {
    if (!product.stock && product.stock !== 0)
      return { text: "Check Availability", color: "gray" };
    if (product.stock === 0) return { text: "Out of Stock", color: "red" };
    if (product.stock < 5) return { text: "Low Stock", color: "orange" };
    if (product.stock < 10) return { text: "Limited Stock", color: "yellow" };
    return { text: "In Stock", color: "green" };
  };

  return (
    <div className="space-y-6">
      {/* Currency Toggler */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-dark-light rounded-sm border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-sm">
            <Globe className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Featured Products</h3>
            <p className="text-xs text-gray-400">
              {products.length} premium gaming products
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-sm text-gray-300 bg-gray-900/50 px-3 py-1 rounded">
            <span className="text-gray-400 mr-2">Rate:</span>
            <span className="font-semibold">1 USD ≈ {exchangeRate} KES</span>
          </div>

          <div className="flex bg-gray-900 rounded-sm p-1 border border-gray-700">
            <button
              onClick={() => setCurrency("KES")}
              className={`px-4 py-2 rounded-sm text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                currency === "KES"
                  ? "bg-linear-to-r from-primary to-cyan-600 text-white shadow-glow-blue"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-xs">🇰🇪</span>
              KES
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-2 rounded-sm text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                currency === "USD"
                  ? "bg-linear-to-r from-primary to-cyan-600 text-white shadow-glow-blue"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <DollarSign size={14} />
              USD
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid - Uniform Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
        {products.map((product) => {
          const stockStatus = getStockStatus(product);

          return (
            <div
              key={product._id || product.id}
              className="bg-dark-light rounded-sm border border-gray-800 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl group cursor-pointer"
              onClick={() => navigate(`/products/${product._id}`)}
            >
              {/* Product Image Container */}
              <div className="relative h-48 bg-linear-to-br from-gray-900 to-gray-800 overflow-hidden">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "/images/product-placeholder.jpg";
                  }}
                />

                {/* Stock Status Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      stockStatus.color === "red"
                        ? "bg-red-600/90 text-white"
                        : stockStatus.color === "orange"
                          ? "bg-orange-600/90 text-white"
                          : stockStatus.color === "yellow"
                            ? "bg-yellow-600/90 text-gray-900"
                            : stockStatus.color === "green"
                              ? "bg-green-600/90 text-white"
                              : "bg-gray-600/90 text-gray-300"
                    }`}
                  >
                    {stockStatus.text}
                  </span>
                </div>

                {/* Currency Indicator */}
                <div className="absolute top-3 right-3">
                  <span className="bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${currency === "KES" ? "bg-green-500" : "bg-blue-500"}`}
                    ></span>
                    <span className="text-xs font-bold">
                      {currency === "KES" ? "KES" : "USD"}
                    </span>
                  </span>
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center  justify-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product._id}`);
                    }}
                    className="p-3 bg-primary text-white rounded-full hover:scale-110 transition-transform"
                    title="View Details"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={(e) => handleWhatsAppInquiry(e, product)}
                    disabled={
                      product.stock === 0 || inquiringProductId === product._id
                    }
                    className="p-3 bg-green-600 text-white rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Inquire on WhatsApp"
                  >
                    {inquiringProductId === product._id ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <MessageCircle size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4">
                {/* Category and Brand */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                    {product.category || "Gaming"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {product.brand || "Premium Brand"}
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-1">
                  {product.name}
                </h3>

                {/* Short Description */}
                <p className="text-sm hidden  text-gray-400 mb-4 line-clamp-2">
                  {product.description || "High-performance gaming gear"}
                </p>

                {/* Pricing Section */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xl font-bold text-white">
                        {getDisplayPrice(product)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currency === "KES" ? "Kenyan Shilling" : "US Dollar"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {currency === "KES" ? "USD" : "KES"}
                      </div>
                      <div className="text-sm font-medium text-gray-300">
                        {getAlternatePrice(product)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-col sm:flex-row">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product._id}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-sm text-sm font-semibold transition-colors"
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                  <button
                    onClick={(e) => handleWhatsAppInquiry(e, product)}
                    disabled={
                      product.stock === 0 || inquiringProductId === product._id
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm text-sm font-semibold transition-colors ${
                      product.stock === 0
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {inquiringProductId === product._id ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <MessageCircle size={16} />
                        Inquire
                      </>
                    )}
                  </button>
                </div>

                {/* {product.stock > 0 && (
                  <div className="mt-3 text-center">
                    <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      <MessageCircle size={12} />
                      Click "Inquire" to chat instantly
                    </span>
                  </div>
                )} */}
              </div>
            </div>
          );
        })}
      </div>
      <button
        className="bg-blue-500 px-3 py-3 rounded-[2px] mx-auto block text-sm hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
        onClick={() => {
          navigate("/products");
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12h18m-9-9l9 9-9 9"
          />
        </svg>
        VIEW ALL PRODUCTS
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </button>

      {/* WhatsApp Support Note */}
      <div className="mt-8 p-4 bg-linear-to-r from-green-900/20 to-primary/10 border border-green-800/30 rounded-sm">
        <div className="flex items-center gap-3">
          <MessageCircle className="text-green-500" size={24} />
          <div>
            <h4 className="font-semibold text-white">
              Instant WhatsApp Support
            </h4>
            <p className="text-sm text-gray-400">
              Get real-time assistance for any product inquiries. Our team
              responds within minutes!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabContent;
