// CartContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const storageKey = (slug) => `storefront_cart_${slug}`;

const readCart = (slug) => {
    try {
        const raw = localStorage.getItem(storageKey(slug));
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const writeCart = (slug, items) => {
    try {
        localStorage.setItem(storageKey(slug), JSON.stringify(items));
    } catch {
        // ignore storage errors (private mode, quota, disabled storage, etc.)
    }
};

const clampQuantity = (quantity, maxStock) => {
    const max = Number.isFinite(maxStock) && maxStock > 0 ? maxStock : 1;
    return Math.min(Math.max(1, Math.floor(quantity) || 1), max);
};

export const CartProvider = ({ slug, children }) => {
    const [items, setItems] = useState(() => readCart(slug));

    useEffect(() => {
        setItems(readCart(slug));
    }, [slug]);

    useEffect(() => {
        writeCart(slug, items);
    }, [slug, items]);

    const addItem = useCallback((product, quantity = 1) => {
        const productId = product?.productId ?? product?._id;
        if (!productId) return;

        const maxStock = Number.isFinite(product?.maxStock)
            ? product.maxStock
            : Number.isFinite(product?.stock)
                ? product.stock
                : 1;

        const image =
            product?.image ??
            product?.images?.find((img) => img.isPrimary)?.displayUrl ??
            product?.images?.[0]?.displayUrl ??
            null;

        setItems((prev) => {
            const existing = prev.find((item) => item.productId === productId);
            if (existing) {
                return prev.map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: clampQuantity(item.quantity + quantity, item.maxStock) }
                        : item,
                );
            }

            return [
                ...prev,
                {
                    productId,
                    name: product?.name,
                    price: product?.price,
                    image,
                    maxStock,
                    quantity: clampQuantity(quantity, maxStock),
                },
            ];
        });
    }, []);

    const removeItem = useCallback((productId) => {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
    }, []);

    const updateQuantity = useCallback((productId, quantity) => {
        setItems((prev) =>
            prev.map((item) =>
                item.productId === productId
                    ? { ...item, quantity: clampQuantity(quantity, item.maxStock) }
                    : item,
            ),
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
        [items],
    );

    const itemCount = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items],
    );

    const value = useMemo(
        () => ({ items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }),
        [items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return ctx;
};

export default CartContext;
