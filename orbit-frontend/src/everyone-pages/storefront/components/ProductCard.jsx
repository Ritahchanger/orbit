// ProductCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Eye } from "lucide-react";
import Money from "./Money";

export const getPrimaryImage = (product) => {
    return (
        product?.images?.find((img) => img.isPrimary)?.displayUrl ??
        product?.images?.[0]?.displayUrl ??
        null
    );
};

const getStockBadge = (stock) => {
    if (!stock || stock <= 0) {
        return { label: "Out of stock", className: "bg-red-500/90 text-white" };
    }
    if (stock <= 5) {
        return { label: "Low stock", className: "bg-amber-500/90 text-white" };
    }
    return { label: "In stock", className: "bg-emerald-500/90 text-white" };
};

const ProductCard = ({ product, linkTo, currency, onAddToCart }) => {
    const image = getPrimaryImage(product);
    const [imageFailed, setImageFailed] = useState(false);
    const outOfStock = !product?.stock || product.stock <= 0;
    const badge = getStockBadge(product?.stock);

    return (
        <div className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <Link to={linkTo} className="block relative">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-950 flex items-center justify-center overflow-hidden">
                    {image && !imageFailed ? (
                        <img
                            src={image}
                            alt={product.name}
                            loading="lazy"
                            onError={() => setImageFailed(true)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    )}
                </div>

                <span
                    className={`absolute top-2 right-2 px-2 py-1 text-[11px] font-semibold rounded-full shadow-sm ${badge.className}`}
                >
                    {badge.label}
                </span>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity p-2.5 rounded-full bg-white/90 text-gray-900 shadow-md">
                        <Eye className="w-4 h-4" />
                    </span>
                </div>
            </Link>

            <div className="flex flex-col flex-1 p-3.5 gap-1.5">
                {product.category && (
                    <span className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                        {product.category}
                    </span>
                )}

                <Link
                    to={linkTo}
                    className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 hover:underline leading-snug"
                >
                    {product.name}
                </Link>

                <div className="mt-auto pt-1 flex items-baseline justify-between gap-2">
                    <Money
                        amount={product.price}
                        currency={currency}
                        className="text-base font-bold text-gray-900 dark:text-white"
                    />
                    {!outOfStock && (
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {product.stock} left
                        </span>
                    )}
                </div>

                <div className="mt-2 flex gap-2">
                    <Link
                        to={linkTo}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Details
                    </Link>
                    <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => onAddToCart?.(product)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {outOfStock ? "Sold out" : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
