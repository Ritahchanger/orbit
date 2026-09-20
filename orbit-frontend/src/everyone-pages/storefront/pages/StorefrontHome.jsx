// StorefrontHome.jsx
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, Store as StoreIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { CartProvider, useCart } from "../context/CartContext";
import StorefrontLayout from "../layout/StorefrontLayout";
import ProductCard from "../components/ProductCard";
import { useStorefront, useStorefrontProducts } from "../hooks/storefront.hooks";
import { useStoreSlug, useStoreLink } from "../hooks/useStoreSlug";

const ProductGridSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800" />
                <div className="p-3.5 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
            </div>
        ))}
    </div>
);

const TaglineBanner = ({ ecommerce }) => {
    if (!ecommerce?.tagline && !ecommerce?.theme?.bannerUrl) return null;

    return (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 relative shadow-sm">
            {ecommerce.theme?.bannerUrl && (
                <img src={ecommerce.theme.bannerUrl} alt="" className="w-full h-40 object-cover" />
            )}
            {ecommerce.tagline && (
                <div className="p-4 bg-white dark:bg-gray-900">
                    <p className="text-gray-700 dark:text-gray-300">{ecommerce.tagline}</p>
                </div>
            )}
        </div>
    );
};

const StorefrontHomeContent = ({ slug, business }) => {
    const { addItem } = useCart();
    const link = useStoreLink();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);

    const { data, isLoading, isError } = useStorefrontProducts(slug, {
        page,
        limit: 20,
        search: search || undefined,
        category: category || undefined,
    });

    const products = data?.data || [];
    const pagination = data?.pagination;
    const currency = business?.ecommerce?.currency;

    const categories = useMemo(() => {
        const set = new Set(products.map((p) => p.category).filter(Boolean));
        return Array.from(set);
    }, [products]);

    const handleAddToCart = (product) => {
        addItem(product, 1);
        toast.success(`${product.name} added to cart`);
    };

    return (
        <div>
            <TaglineBanner ecommerce={business?.ecommerce} />

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search products..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                </div>

                {categories.length > 1 && (
                    <select
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setPage(1);
                        }}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent capitalize"
                    >
                        <option value="">All categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c} className="capitalize">
                                {c}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {isLoading && <ProductGridSkeleton />}

            {isError && (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    Something went wrong loading products. Please try again shortly.
                </div>
            )}

            {!isLoading && !isError && products.length === 0 && (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    No products found.
                </div>
            )}

            {!isLoading && !isError && products.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {products.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            linkTo={link(`/products/${product._id}`)}
                            currency={currency}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>
            )}

            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.page <= 1}
                        className="p-2 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-40"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                        disabled={pagination.page >= pagination.pages}
                        className="p-2 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-40"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

const StorefrontHome = () => {
    const slug = useStoreSlug();
    const { data, isLoading, isError, error } = useStorefront(slug);
    const business = data?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="animate-pulse text-gray-400">Loading business...</div>
            </div>
        );
    }

    if (isError || !business) {
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
                <StorefrontHomeContent slug={slug} business={business} />
            </StorefrontLayout>
        </CartProvider>
    );
};

export default StorefrontHome;
