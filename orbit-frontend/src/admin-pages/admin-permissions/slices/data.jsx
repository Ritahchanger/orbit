export const initialRoles = [
    {
        id: '1',
        name: 'superadmin',
        displayName: 'Superadmin',
        description: 'Full system access with all permissions',
        permissions: ['*'], // All permissions
        level: 10,
        isSystemRole: true,
        canAssign: true,
        userCount: 1,
        createdAt: '2024-01-01',
        editable: false
    },
    {
        id: '2',
        name: 'admin',
        displayName: 'Admin',
        description: 'Administrator with management permissions',
        permissions: [
            'users.view', 'users.manage',
            'stores.view', 'stores.manage',
            'products.view', 'products.manage',
            'reports.view', 'reports.manage',
            'sales.view', 'sales.manage'
        ],
        level: 9,
        isSystemRole: true,
        canAssign: true,
        userCount: 2,
        createdAt: '2024-01-01',
        editable: false
    },
    {
        id: '3',
        name: 'manager',
        displayName: 'Manager',
        description: 'Store manager with sales and inventory access',
        permissions: [
            'products.view', 'products.edit',
            'sales.view', 'sales.create',
            'inventory.view', 'inventory.update',
            'reports.view',
            'dashboard.view'
        ],
        level: 7,
        isSystemRole: true,
        canAssign: false,
        userCount: 5,
        createdAt: '2024-01-01',
        editable: true
    },
    {
        id: '4',
        name: 'cashier',
        displayName: 'Cashier',
        description: 'Cashier with basic sales permissions',
        permissions: [
            'products.view',
            'sales.view', 'sales.create',
            'dashboard.view'
        ],
        level: 5,
        isSystemRole: true,
        canAssign: false,
        userCount: 10,
        createdAt: '2024-01-01',
        editable: true
    },
    {
        id: '5',
        name: 'staff',
        displayName: 'Staff',
        description: 'General staff member',
        permissions: [
            'products.view',
            'dashboard.view'
        ],
        level: 4,
        isSystemRole: true,
        canAssign: false,
        userCount: 15,
        createdAt: '2024-01-01',
        editable: true
    }
];

export const initialPermissions = [
    // Store permissions
    { id: 'stores.view', key: 'stores.view', module: 'stores', description: 'View stores' },
    { id: 'stores.create', key: 'stores.create', module: 'stores', description: 'Create stores' },
    { id: 'stores.update', key: 'stores.update', module: 'stores', description: 'Update stores' },
    { id: 'stores.delete', key: 'stores.delete', module: 'stores', description: 'Delete stores' },
    { id: 'stores.manage', key: 'stores.manage', module: 'stores', description: 'Manage stores' },

    // Product permissions
    { id: 'products.view', key: 'products.view', module: 'products', description: 'View products' },
    { id: 'products.create', key: 'products.create', module: 'products', description: 'Create products' },
    { id: 'products.update', key: 'products.update', module: 'products', description: 'Update products' },
    { id: 'products.delete', key: 'products.delete', module: 'products', description: 'Delete products' },
    { id: 'products.manage', key: 'products.manage', module: 'products', description: 'Manage products' },

    // User permissions
    { id: 'users.view', key: 'users.view', module: 'users', description: 'View users' },
    { id: 'users.create', key: 'users.create', module: 'users', description: 'Create users' },
    { id: 'users.update', key: 'users.update', module: 'users', description: 'Update users' },
    { id: 'users.delete', key: 'users.delete', module: 'users', description: 'Delete users' },
    { id: 'users.manage', key: 'users.manage', module: 'users', description: 'Manage users' },

    // Sales permissions
    { id: 'sales.view', key: 'sales.view', module: 'sales', description: 'View sales' },
    { id: 'sales.create', key: 'sales.create', module: 'sales', description: 'Create sales' },
    { id: 'sales.update', key: 'sales.update', module: 'sales', description: 'Update sales' },
    { id: 'sales.delete', key: 'sales.delete', module: 'sales', description: 'Delete sales' },
    { id: 'sales.manage', key: 'sales.manage', module: 'sales', description: 'Manage sales' },

    // Report permissions
    { id: 'reports.view', key: 'reports.view', module: 'reports', description: 'View reports' },
    { id: 'reports.generate', key: 'reports.generate', module: 'reports', description: 'Generate reports' },
    { id: 'reports.delete', key: 'reports.delete', module: 'reports', description: 'Delete reports' },
    { id: 'reports.manage', key: 'reports.manage', module: 'reports', description: 'Manage reports' },

    // Dashboard permissions
    { id: 'dashboard.view', key: 'dashboard.view', module: 'dashboard', description: 'View dashboard' },

    // Inventory permissions
    { id: 'inventory.view', key: 'inventory.view', module: 'inventory', description: 'View inventory' },
    { id: 'inventory.update', key: 'inventory.update', module: 'inventory', description: 'Update inventory' },

    // Consultation permissions
    { id: 'consultations.view', key: 'consultations.view', module: 'consultations', description: 'View consultations' },
    { id: 'consultations.create', key: 'consultations.create', module: 'consultations', description: 'Create consultations' },
    { id: 'consultations.update', key: 'consultations.update', module: 'consultations', description: 'Update consultations' },
    { id: 'consultations.delete', key: 'consultations.delete', module: 'consultations', description: 'Delete consultations' },
    { id: 'consultations.manage', key: 'consultations.manage', module: 'consultations', description: 'Manage consultations' }
];
