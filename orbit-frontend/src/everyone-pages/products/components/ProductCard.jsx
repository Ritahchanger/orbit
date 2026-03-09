// src/everyone-pages/products/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { Star, Eye, ShoppingBag, Tag, MessageCircle, Bell } from "lucide-react";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const [inquiring, setInquiring] = useState(false);

  // Helper functions
  const formatPrice = (price) => {
    return `KSh ${price?.toLocaleString("en-KE") || "0"}`;
  };

  // Determine stock status
  const getStockStatus = () => {
    if (!product?.stock && product?.stock !== 0)
      return { text: "Check", color: "gray" };
    if (product.stock === 0) return { text: "Out of Stock", color: "red" };
    if (product.stock < (product.minStock || 5))
      return { text: "Low Stock", color: "yellow" };
    return { text: "In Stock", color: "green" };
  };

  // Get primary image
  const getPrimaryImage = () => {
    if (product.primaryImage) return product.primaryImage;
    if (product.images?.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      return primary?.url || product.images[0]?.url;
    }
    return "https://via.placeholder.com/300x200?text=No+Image";
  };

  // Handle WhatsApp inquiry
  const handleWhatsAppInquiry = (e) => {
    e.preventDefault();
    setInquiring(true);

    // You can get these from environment variables or a config
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "+254708728793";

    const cleanPhone = phoneNumber.replace(/\s+/g, "").replace(/[^0-9+]/g, "");

    const message =
      `Hello! I'm interested in this product:\n\n` +
      `📦 *${product.name}*\n` +
      `💰 Price: ${formatPrice(product.price || product.sellingPrice)}\n` +
      `📋 SKU: ${product.sku || "Not specified"}\n` +
      `🏷️ Brand: ${product.brand || "Not specified"}\n` +
      `📦 Stock: ${product.stock || 0} available\n\n` +
      `Can you provide more details about availability and purchasing options?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => setInquiring(false), 1000);
  };

  const stockStatus = getStockStatus();
  const isOutOfStock = product.stock === 0;

  return (
    <div
      className={`group bg-dark-light rounded-sm border overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-lg ${
        isOutOfStock ? "border-red-900/30 opacity-75" : "border-gray-800"
      }`}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-900 overflow-hidden">
        <img
          src={getPrimaryImage()}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-sm ${
              stockStatus.color === "red"
                ? "bg-red-600/90 text-white"
                : stockStatus.color === "yellow"
                  ? "bg-yellow-600/90 text-white"
                  : stockStatus.color === "green"
                    ? "bg-green-600/90 text-white"
                    : "bg-gray-600/90 text-gray-300"
            }`}
          >
            {stockStatus.text}
          </span>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-600 text-white text-sm font-bold rotate-[-15deg] shadow-lg border-2 border-white/50">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Quick View Overlay - Only show if in stock or always? */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            to={`/products/${product._id || product.id}`}
            className="p-3 bg-primary text-white rounded-full hover:scale-110 transition-transform"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye size={20} />
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand & Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            {product.brand || "Brand"}
          </span>
          {/* {product.sku && (
            <span className="text-xs text-gray-400">
              SKU: {product.sku.substring(0, 8)}...
            </span>
          )} */}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm hidden  text-gray-400 mb-4 line-clamp-2">
          {product.description || "Visit store for details"}
        </p>

        {/* Price */}
        <div className="mb-3">
          <div className="text-xl font-bold text-white">
            {formatPrice(product.price || product.sellingPrice)}
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <span className={isOutOfStock ? "text-red-400" : ""}>
              {isOutOfStock
                ? "Currently unavailable"
                : `${product.stock || 0} available`}
            </span>
          </div>
        </div>

        {/* Quick Features (if available) */}
        {/* {product.features && product.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {product.features.slice(0, 2).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-sm"
                >
                  {feature.length > 15
                    ? feature.substring(0, 15) + "..."
                    : feature}
                </span>
              ))}
            </div>
          </div>
        )} */}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-col sm:flex-row">
          <Link
            to={`/products/${product._id || product.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-blue-600 text-white rounded-sm text-sm font-semibold transition"
          >
            <Eye size={16} />
            <span>View Details</span>
          </Link>

          {isOutOfStock ? (
            // Notify Me button for out of stock
            <button
              onClick={() => {
                // Implement notify me functionality
                alert("Notify me feature coming soon!");
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-sm text-sm font-semibold transition"
              title="Get notified when back in stock"
            >
              <Bell size={16} />
              <span>Notify Me</span>
            </button>
          ) : (
            // WhatsApp Inquiry button for in-stock items
            <button
              onClick={handleWhatsAppInquiry}
              disabled={inquiring}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-sm text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Inquire on WhatsApp"
            >
              {inquiring ? (
                <span className="flex items-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Opening...
                </span>
              ) : (
                <>
                  <MessageCircle size={16} />
                  <span>Inquire</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* WhatsApp hint for in-stock items */}
        {/* {!isOutOfStock && (
          <div className="mt-2 text-xs text-gray-400 text-center">
            <span className="flex items-center justify-center gap-1">
              <MessageCircle size={12} />
              Click to chat on WhatsApp
            </span>
          </div>
        )} */}

        {/* Out of stock hint */}
        {isOutOfStock && (
          <div className="mt-2 text-xs text-red-400 text-center">
            <span className="flex items-center justify-center gap-1">
              <Bell size={12} />
              Will be back in stock soon
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
