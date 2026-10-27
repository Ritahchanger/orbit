import { Link } from 'react-router-dom';
import { LogOut, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StoreSwitcher from './StoreSwitcher';
import NavItemLink from '../layout/NavItemLink';
import { useStoreContext } from '../../../context/store/StoreContext';

const MobileMenuOpen = ({
    allowedNavItems,
    isActive,
    setIsMobileMenuOpen,
    currentStore,
    stores,
    handleStoreSwitch,
    userRole,
    handleLogout
}) => {
    const { isAllStores, selectAllStores } = useStoreContext();
    // Same rule as the desktop strip: admins and superadmins with several stores
    const canViewAllStores =
        (userRole === 'superadmin' || userRole === 'admin') && stores?.length > 1;

    return (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-4 pt-1">
                {/* Store Switcher - Mobile */}
                <div className="mb-3 space-y-2">
                    <StoreSwitcher
                        fullWidth
                        stores={stores || []}
                        currentStore={currentStore}
                        isAllStores={isAllStores}
                        canViewAllStores={canViewAllStores}
                        onSelectStore={(id) => {
                            handleStoreSwitch(id);
                            setIsMobileMenuOpen(false);
                        }}
                        onSelectAll={() => {
                            selectAllStores();
                            setIsMobileMenuOpen(false);
                            toast.success('Showing all stores');
                        }}
                    />
                    {(userRole === 'superadmin' || userRole === 'admin') && (
                        <Link
                            to="/admin/stores"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        >
                            <Building2 size={15} />
                            Manage stores
                        </Link>
                    )}
                </div>

                {/* Admin Mobile Links */}
                <nav className="space-y-1" aria-label="Admin menu">
                    {allowedNavItems.map((item) => (
                        <NavItemLink
                            key={item.path}
                            item={item}
                            variant="mobile"
                            active={isActive(item.path)}
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    ))}
                </nav>

                {/* Admin Mobile Actions */}
                <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-sm border border-rose-200 py-3 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                        <LogOut size={16} />
                        Log out
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MobileMenuOpen;