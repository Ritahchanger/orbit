// StorefrontProductDetail.jsx
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Minus, Package, Plus, ShoppingCart, Store as StoreIcon } from "lucide-react";
import { CartProvider, useCart } from "../context/CartContext";
import StorefrontLayout from "../layout/StorefrontLayout";
import Money from "../components/Money";
import { useStorefront, useStorefrontProduct } from "../hooks/storefront.hooks";
import { useStoreSlug, useStoreLink } from "../hooks/useStoreSlug";

const DetailSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
        <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        </div>
    </div>
);

const specFields = [
    ["brand", "Brand"],
    ["warranty", "Warranty"],
    ["weight", "Weight"],
    ["dimensions", "Dimensions"],
    ["model", "Model"],
    ["color", "Color"],
    ["connectivity", "Connectivity"],
    ["powerConsumption", "Power Consumption"],
];

const ProductDetailContent = ({ business, product }) => {
    const { addItem } = useCart();
    const link = useStoreLink();
    const [quantity, setQuantity] = useState(1);
    const [failedImages, setFailedImages] = useState(() => new Set());
    const currency = business?.ecommerce?.currency;
    const stock = product.stock || 0;
    const outOfStock = stock <= 0;

    const images = useMemo(() => {
        const list = product.images || [];
        const primary = list.find((img) => img.isPrimary);
        const rest = list.filter((img) => !(primary && img === primary));
        return primary ? [primary, ...rest] : list;
    }, [product.images]);

    const [activeImage, setActiveImage] = useState(0);

    const handleAddToCart = () => {
        addItem(product, quantity);
        toast.success(`${product.name} added to cart`);
    };

    return (
        <div>
            <Link
                to={link("")}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:underline mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to shop
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-950 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-800">
                        {images.length > 0 && !failedImages.has(activeImage) ? (
                            <img
                                src={images[activeImage]?.displayUrl}
                                alt={product.name}
                                onError={() =>
                                    setFailedImages((prev) => new Set(prev).add(activeImage))
                                }
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto">
                            {images.map((img, idx) => (
                                <button
                                    key={img.gcsFileName || idx}
                                    type="button"
                                    onClick={() => setActiveImage(idx)}
                                    className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border ${
                                        idx === activeImage
                                            ? "border-gray-900 dark:border-white"
                                            : "border-gray-200 dark:border-gray-700"
                                    }`}
                                >
                                    {!failedImages.has(idx) ? (
                                        <img
                                            src={img.displayUrl}
                                            alt=""
                                            onError={() =>
                                                setFailedImages((prev) => new Set(prev).add(idx))
                                            }
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                            <Package className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    {product.category && (
                        <span className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                            {product.category}
                        </span>
                    )}
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                        {product.name}
                    </h1>
                    <Money
                        amount={product.price}
                        currency={currency}
                        className="block text-xl font-bold text-gray-900 dark:text-white mt-2"
                    />

                    {product.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-4">{product.description}</p>
                    )}

                    <dl className="grid grid-cols-2 gap-3 mt-6 text-sm">
                        {specFields.map(([key, label]) =>
                            product[key] ? (
                                <div key={key}>
                                    <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                                    <dd className="text-gray-900 dark:text-white font-medium">{product[key]}</dd>
                                </div>
                            ) : null,
                        )}
                    </dl>

                    <div className="mt-6 flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md">
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={outOfStock}
                                className="p-2 disabled:opacity-40"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center text-sm">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                                disabled={outOfStock}
                                className="p-2 disabled:opacity-40"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {outOfStock ? "Out of stock" : `${stock} in stock`}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={outOfStock}
                        className="mt-6 inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-md px-6 py-3 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

const StorefrontProductDetail = () => {
    // Path-scoped routes use :productId (/store/:slug/products/:productId);
    // the domain-scoped route reused from the legacy catalog uses :id (/products/:id).
    const { productId: paramProductId, id: paramId } = useParams();
    const productId = paramProductId || paramId;
    const slug = useStoreSlug();
    const link = useStoreLink();
    const { data: storeData, isLoading: storeLoading, isError: storeError, error } = useStorefront(slug);
    const business = storeData?.data;

    const {
        data: productData,
        isLoading: productLoading,
        isError: productError,
    } = useStorefrontProduct(slug, productId, { enabled: !!business });

    const product = productData?.data;

    if (storeLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="animate-pulse text-gray-400">Loading business...</div>
            </div>
        );
    }

    if (storeError || !business) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-950 text-center px-4">
                <StoreIcon className="w-10 h-10 text-gray-400" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    This business isn't available right now
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {error?.message || "It may have moved, or isn't accepting visitors at the moment."}
                </p>
            </div>
        );
    }

    return (
        <CartProvider slug={slug}>
            <StorefrontLayout business={business} slug={slug}>
                {productLoading && <DetailSkeleton />}

                {!productLoading && (productError || !product) && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            We couldn't find that product.
                        </p>
                        <Link to={link("")} className="text-sm underline">
                            Back to store
                        </Link>
                    </div>
                )}

                {!productLoading && product && (
                    <ProductDetailContent business={business} product={product} />
                )}
            </StorefrontLayout>
        </CartProvider>
    );
};

export default StorefrontProductDetail;
