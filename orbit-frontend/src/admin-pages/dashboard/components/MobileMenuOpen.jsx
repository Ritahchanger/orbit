import { Link } from 'react-router-dom';
import {
    LogOut,
    FileText,
    Shield,
    Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import StoreSwitcher from './StoreSwitcher';
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
                <div className="space-y-2">
                    {allowedNavItems.map((item) => {
                        const Icon = item.icon;

                        if (item.type === 'link') {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center justify-between px-4 py-3 rounded-sm transition-colors text-sm ${active
                                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon className="h-5 w-5" />
                                        {item.name}
                                        {item.requiredRole && userRole !== 'superadmin' && (
                                            <Shield className="h-3 w-3 text-amber-500 ml-auto" />
                                        )}
                                    </span>
                                </Link>
                            );
                        }

                        if (item.type === 'dropdown') {
                            return (
                                <div key={item.name} className="space-y-1">
                                    <div className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 font-medium text-sm">
                                        <Icon className="h-5 w-5 mr-3" />
                                        {item.name}
                                    </div>
                                    <div className="ml-8 space-y-1 text-sm">
                                        {item.items
                                            .filter(subItem =>
                                                !subItem.requiredRole ||
                                                userRole === 'superadmin'
                                            )
                                            .map((subItem) => {
                                                const SubIcon = subItem.icon;
                                                const active = isActive(subItem.path);
                                                return (
                                                    <Link
                                                        key={subItem.name}
                                                        to={subItem.path}
                                                        className={`flex items-center px-4 py-2 rounded-sm transition-colors ${active
                                                            ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                                            }`}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <SubIcon className="h-4 w-4 mr-3" />
                                                        {subItem.name}
                                                        {subItem.requiredRole && userRole !== 'superadmin' && (
                                                            <Shield className="h-3 w-3 text-amber-500 ml-auto" />
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                    </div>
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>

                {/* Admin Mobile Actions */}
                <div className="mt-6 space-y-3">
                    {/* Reports Link - Mobile */}
                    {(userRole === 'superadmin' || userRole === 'admin') && (
                        <Link
                            to="/admin/reports"
                            className="block w-full text-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 py-3 rounded-sm font-medium transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-sm uppercase border border-emerald-200 dark:border-emerald-500/20"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <FileText className="inline-block mr-2" size={16} />
                            Generate Reports
                        </Link>
                    )}

                    <button
                        onClick={handleLogout}
                        className="block w-full text-center border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 py-3 rounded-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-sm uppercase"
                    >
                        <LogOut className="inline-block mr-2" size={16} />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MobileMenuOpen;