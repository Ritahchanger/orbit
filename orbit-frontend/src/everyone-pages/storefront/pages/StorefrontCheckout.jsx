// StorefrontCheckout.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShoppingCart, Store as StoreIcon } from "lucide-react";
import { CartProvider, useCart } from "../context/CartContext";
import StorefrontLayout from "../layout/StorefrontLayout";
import Money from "../components/Money";
import { useStorefront, useCheckout } from "../hooks/storefront.hooks";
import { useStoreSlug, useStoreLink } from "../hooks/useStoreSlug";

const paymentMethodLabels = {
    cash: "Cash",
    mpesa: "M-Pesa",
    card: "Card",
    paybill: "Paybill",
    other: "Other",
};

const initialForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    paymentMethod: "",
    notes: "",
};

const OrderSummary = ({ items, subtotal, currency, shippingFee, tax, total }) => (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 h-fit">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h2>

        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate pr-2">
                        {item.name} x {item.quantity}
                    </span>
                    <Money amount={item.price * item.quantity} currency={currency} className="text-gray-900 dark:text-white flex-shrink-0" />
                </div>
            ))}
        </div>

        <div className="space-y-1.5 text-sm border-t border-gray-200 dark:border-gray-800 pt-3">
            <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <Money amount={subtotal} currency={currency} className="text-gray-900 dark:text-white" />
            </div>
            <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping (estimate)</span>
                <Money amount={shippingFee} currency={currency} className="text-gray-900 dark:text-white" />
            </div>
            <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax (estimate)</span>
                <Money amount={tax} currency={currency} className="text-gray-900 dark:text-white" />
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200 dark:border-gray-800">
                <span>Total</span>
                <Money amount={total} currency={currency} />
            </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
            Final totals are calculated by the store when your order is placed.
        </p>
    </div>
);

const CheckoutContent = ({ slug, business }) => {
    const navigate = useNavigate();
    const link = useStoreLink();
    const { items, subtotal, clearCart } = useCart();
    const [form, setForm] = useState(initialForm);
    const checkoutMutation = useCheckout();

    const ecommerce = business?.ecommerce || {};
    const currency = ecommerce.currency;
    const paymentMethods = ecommerce.paymentMethods || [];

    const shippingFee = useMemo(() => {
        const fee = ecommerce.shippingFee || 0;
        const threshold = ecommerce.freeShippingThreshold;
        if (threshold != null && subtotal >= threshold) return 0;
        return fee;
    }, [ecommerce.shippingFee, ecommerce.freeShippingThreshold, subtotal]);

    const tax = useMemo(() => {
        const rate = ecommerce.taxRate || 0;
        return (subtotal * rate) / 100;
    }, [ecommerce.taxRate, subtotal]);

    const total = subtotal + shippingFee + tax;

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.name.trim() || !form.phone.trim()) {
            toast.error("Name and phone are required");
            return;
        }

        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        const payload = {
            customer: {
                name: form.name.trim(),
                email: form.email.trim() || undefined,
                phone: form.phone.trim(),
            },
            shippingAddress: {
                address: form.address.trim() || undefined,
                city: form.city.trim() || undefined,
                country: form.country.trim() || undefined,
                postalCode: form.postalCode.trim() || undefined,
            },
            items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
            paymentMethod: form.paymentMethod || undefined,
            notes: form.notes.trim() || undefined,
        };

        checkoutMutation.mutate(
            { slug, payload },
            {
                onSuccess: (response) => {
                    const order = response?.data?.order;
                    clearCart();
                    toast.success(response?.message || "Order placed successfully");
                    navigate(link(`/order-confirmation/${order?.orderNumber ?? ""}`), {
                        state: { order },
                    });
                },
                onError: (err) => {
                    toast.error(err?.message || "Could not place order");
                },
            },
        );
    };

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
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    <section>
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="text"
                                required
                                placeholder="Full name *"
                                value={form.name}
                                onChange={handleChange("name")}
                                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm sm:col-span-1"
                            />
                            <input
                                type="tel"
                                required
                                placeholder="Phone *"
                                value={form.phone}
                                onChange={handleChange("phone")}
                                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                            />
                            <input
                                type="email"
                                placeholder="Email (optional)"
                                value={form.email}
                                onChange={handleChange("email")}
                                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm sm:col-span-2"
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Shipping Address</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Address"
                                value={form.address}
                                onChange={handleChange("address")}
                                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm sm:col-span-2"
                            />
                            <input
                                type="text"
                                placeholder="City"
                                value={form.city}
                                onChange={handleChange("city")}
                                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Country"
                                value={form.country}
                                onChange={handleChange("country")}
                                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Postal code"
                                value={form.postalCode}
                                onChange={handleChange("postalCode")}
                                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                            />
                        </div>
                    </section>

                    {paymentMethods.length > 0 && (
                        <section>
                            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Method</h2>
                            <div className="flex flex-wrap gap-2">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, paymentMethod: method }))}
                                        className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                                            form.paymentMethod === method
                                                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent"
                                                : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                        }`}
                                    >
                                        {paymentMethodLabels[method] || method}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h2>
                        <textarea
                            placeholder="Anything else the store should know?"
                            value={form.notes}
                            onChange={handleChange("notes")}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                        />
                    </section>

                    <button
                        type="submit"
                        disabled={checkoutMutation.isPending}
                        className="w-full rounded-md px-6 py-3 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {checkoutMutation.isPending ? "Placing order..." : "Place Order"}
                    </button>
                </form>

                <OrderSummary
                    items={items}
                    subtotal={subtotal}
                    currency={currency}
                    shippingFee={shippingFee}
                    tax={tax}
                    total={total}
                />
            </div>
        </div>
    );
};

const StorefrontCheckout = () => {
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
                <CheckoutContent slug={slug} business={business} />
            </StorefrontLayout>
        </CartProvider>
    );
};

export default StorefrontCheckout;
