// StorefrontLayout.jsx
import { Link } from "react-router-dom";
import { Store, ShoppingCart, Mail, Phone } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useStoreLink } from "../hooks/useStoreSlug";

const StorefrontLayout = ({ children, business }) => {
    const { itemCount } = useCart();
    const link = useStoreLink();

    const ecommerce = business?.ecommerce || {};
    const theme = ecommerce.theme || {};
    const accentColor = theme.primaryColor || "#111827";
    const logoUrl = theme.logoUrl || business?.businessLogo;
    const storeName = ecommerce.storeName || business?.businessName || "Store";

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <header
                style={{ backgroundColor: accentColor }}
                className="sticky top-0 z-10 text-white shadow-md"
            >
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <Link to={link("")} className="flex items-center gap-2.5 min-w-0">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={storeName}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                            />
                        ) : (
                            <span className="w-9 h-9 rounded-full bg-white/15 ring-2 ring-white/30 flex items-center justify-center">
                                <Store className="w-5 h-5" />
                            </span>
                        )}
                        <span className="font-semibold text-lg truncate">{storeName}</span>
                    </Link>

                    <Link
                        to={link("/cart")}
                        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="View cart"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {itemCount > 0 && (
                            <span
                                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[11px] font-bold flex items-center justify-center shadow-sm"
                                style={{ color: accentColor }}
                            >
                                {itemCount}
                            </span>
                        )}
                    </Link>
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>

            <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-wrap gap-4">
                        {ecommerce.contactEmail && (
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-4 h-4" />
                                {ecommerce.contactEmail}
                            </span>
                        )}
                        {ecommerce.contactPhone && (
                            <span className="flex items-center gap-1.5">
                                <Phone className="w-4 h-4" />
                                {ecommerce.contactPhone}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        &copy; {new Date().getFullYear()} {storeName}
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default StorefrontLayout;
