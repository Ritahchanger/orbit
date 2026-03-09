import {
    Package,
    BarChart3,
    Home,
    Settings,
    Users,
    Store,
    FileText,
    Shield,
    Database,
    Calendar,
    Layers,
    Wallet,
    User
} from "lucide-react"
export const adminPages = [
    // Dashboard
    { id: 'dashboard', name: 'Dashboard', path: '/admin/dashboard', icon: Home, roles: ['manager', 'admin', 'superadmin', 'cashier'], category: 'Dashboard' },

    // Inventory & Products
    { id: 'products', name: 'Products', path: '/admin/products', icon: Package, roles: ['manager', 'admin', 'superadmin', 'cashier'], category: 'Inventory' },

    { id: 'inventory', name: 'Inventory', path: '/admin/inventory', icon: Layers, roles: ['admin', 'superadmin', 'manager'], category: 'Inventory' },

    // Stores
    { id: 'stores', name: 'Stores', path: '/admin/stores', icon: Store, roles: ['admin', 'superadmin'], category: 'Management' },

    // Consultation
    { id: 'consultation', name: 'Consultation', path: '/admin/consultation-setup', icon: Calendar, roles: ['superadmin'], category: 'Services' },

    { id: 'consultation-types', name: 'Consultation Types', path: '/admin/consultation/types', icon: Calendar, roles: ['superadmin'], category: 'Services' },

    // Reports & Analytics
    { id: 'reports', name: 'Reports', path: '/admin/reports', icon: FileText, roles: ['admin', 'superadmin', 'manager'], category: 'Analytics' },

    { id: 'analytics', name: 'Analytics', path: '/admin/analytics', icon: BarChart3, roles: ['superadmin'], category: 'Analytics' },

    // Payments
    { id: 'payments', name: 'Payments', path: '/admin/payments', icon: Wallet, roles: ['superadmin'], category: 'Finance' },

    // User Management
    { id: 'workers', name: 'Workers', path: '/admin/workers', icon: Users, roles: ['superadmin'], category: 'Management' },

    { id: 'profile', name: 'Profile', path: '/admin/profile', icon: User, roles: ['admin', 'superadmin', 'manager', 'cashier'], category: 'Account' },

    // System Settings (Superadmin only)
    { id: 'system-settings', name: 'System Settings', path: '/admin/system/settings', icon: Settings, roles: ['superadmin'], category: 'System' },

    { id: 'permissions', name: 'Permissions', path: '/admin/settings', icon: Shield, roles: ['superadmin'], category: 'System' },

    { id: 'database', name: 'Database', path: '/admin/system/database', icon: Database, roles: ['superadmin'], category: 'System' },

    { id: 'api-keys', name: 'API Keys', path: '/admin/system/api-keys', icon: Shield, roles: ['superadmin'], category: 'System' },

    { id: 'newsletter', name: 'Newsletter', path: '/admin/newsletter', icon: FileText, roles: ['superadmin'], category: 'System' },
]