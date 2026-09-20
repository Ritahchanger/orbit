// StorefrontOrderConfirmation.jsx
import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Money from "../components/Money";
import { useStoreLink } from "../hooks/useStoreSlug";

const StorefrontOrderConfirmation = () => {
    const { orderNumber } = useParams();
    const { state } = useLocation();
    const link = useStoreLink();
    const order = state?.order;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-10">
            <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 sm:p-8">
                <div className="flex flex-col items-center text-center gap-2 mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Order Confirmed</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Order #{order?.orderNumber ?? orderNumber}
                    </p>
                </div>

                {order ? (
                    <>
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {order.items?.map((item) => (
                                <div key={item.sku || item.name} className="flex justify-between py-2 text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {item.name} x {item.quantity}
                                    </span>
                                    <Money amount={item.subtotal} currency={order.currency} className="text-gray-900 dark:text-white" />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-1.5 text-sm border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                <Money amount={order.subtotal} currency={order.currency} className="text-gray-900 dark:text-white" />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                <Money amount={order.shippingFee} currency={order.currency} className="text-gray-900 dark:text-white" />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                                <Money amount={order.tax} currency={order.currency} className="text-gray-900 dark:text-white" />
                            </div>
                            <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200 dark:border-gray-800">
                                <span>Total</span>
                                <Money amount={order.total} currency={order.currency} />
                            </div>
                        </div>

                        {order.paymentMethod && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                Payment method: <span className="capitalize">{order.paymentMethod}</span>
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Thanks for your order. Keep this order number for your records.
                    </p>
                )}

                <Link
                    to={link("")}
                    className="mt-8 block text-center rounded-md px-4 py-3 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default StorefrontOrderConfirmation;
