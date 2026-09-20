// StorefrontCart.jsx
import { Link } from "react-router-dom";
import { Minus, Package, Plus, ShoppingCart, Store as StoreIcon, Trash2 } from "lucide-react";
import { CartProvider, useCart } from "../context/CartContext";
import StorefrontLayout from "../layout/StorefrontLayout";
import Money from "../components/Money";
import { useStorefront } from "../hooks/storefront.hooks";
import { useStoreSlug, useStoreLink } from "../hooks/useStoreSlug";

const CartLine = ({ item, currency, onUpdateQuantity, onRemove }) => (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="w-16 h-16 flex-shrink-0 rounded-md bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
            {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
                <Package className="w-6 h-6 text-gray-400" />
            )}
        </div>

        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
            <Money amount={item.price} currency={currency} className="text-sm text-gray-500 dark:text-gray-400" />
        </div>

        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md">
            <button
                type="button"
                onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                className="p-1.5"
            >
                <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
                type="button"
                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                className="p-1.5"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>

        <Money
            amount={item.price * item.quantity}
            currency={currency}
            className="w-20 text-right text-sm font-semibold text-gray-900 dark:text-white"
        />

        <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    </div>
);

const CartContent = ({ currency }) => {
    const { items, subtotal, updateQuantity, removeItem } = useCart();
    const link = useStoreLink();

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <ShoppingCart className="w-10 h-10 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
                <Link to={link("")} className="text-sm font-medium underline">
                    Continue shopping
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Cart</h1>

            <div>
                {items.map((item) => (
                    <CartLine
                        key={item.productId}
                        item={item}
                        currency={currency}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <Money amount={subtotal} currency={currency} className="text-lg font-bold text-gray-900 dark:text-white" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link
                    to={link("")}
                    className="flex-1 text-center rounded-md px-4 py-3 text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    Continue shopping
                </Link>
                <Link
                    to={link("/checkout")}
                    className="flex-1 text-center rounded-md px-4 py-3 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                >
                    Proceed to Checkout
                </Link>
            </div>
        </div>
    );
};

const StorefrontCart = () => {
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
                <CartContent currency={business?.ecommerce?.currency} />
            </StorefrontLayout>
        </CartProvider>
    );
};

export default StorefrontCart;
