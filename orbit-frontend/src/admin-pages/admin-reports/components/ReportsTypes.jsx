import {
    BarChart3,
    TrendingUp,
    AlertTriangle,
    ShoppingCart,
    Store,
    Package
} from 'lucide-react';
const reportTypes = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, color: 'blue' },
    { id: 'sales', name: 'Sales', icon: TrendingUp, color: 'green' },
    { id: 'inventory', name: 'Inventory', icon: ShoppingCart, color: 'purple' },
    { id: 'stores', name: 'Stores', icon: Store, color: 'orange' },
    { id: 'products', name: 'Products', icon: Package, color: 'indigo' },
    { id: 'alerts', name: 'Alerts', icon: AlertTriangle, color: 'red' },
];
export { reportTypes };