const Permission = require("../models/permission.model");

const connectDb = require("../../config/db.connection");

const permissions = [
    // Sales Module
    { key: "sales.view", module: "sales", description: "View sales/transactions" },
    { key: "sales.create", module: "sales", description: "Create new sales/transactions" },
    { key: "sales.update", module: "sales", description: "Update sales details" },
    { key: "sales.delete", module: "sales", description: "Delete sales/transactions" },
    { key: "sales.void", module: "sales", description: "Void/cancel sales transactions" },
    { key: "sales.refund", module: "sales", description: "Process refunds for sales" },
    { key: "sales.discount", module: "sales", description: "Apply discounts to sales" },
    
    // Transactions Module (Separate from Sales)
    { key: "transactions.view", module: "transactions", description: "View transactions" },
    { key: "transactions.create", module: "transactions", description: "Create new transactions" },
    { key: "transactions.update", module: "transactions", description: "Update transaction details" },
    { key: "transactions.delete", module: "transactions", description: "Delete transactions" },
    { key: "transactions.approve", module: "transactions", description: "Approve transactions" },
    { key: "transactions.reverse", module: "transactions", description: "Reverse transactions" },
    { key: "transactions.refund", module: "transactions", description: "Process transaction refunds" },
    { key: "transactions.export", module: "transactions", description: "Export transaction records" },
    { key: "transactions.audit", module: "transactions", description: "View transaction audit logs" },
    { key: "transactions.profit.view", module: "transactions", description: "View profit per transaction" },
    { key: "transactions.mpesa.view", module: "transactions", description: "View mpesa transactions" },
    { key: "transactions.cost.view", module: "transactions", description: "View cost of goods sold per transaction" },
    { key: "transactions.margin.view", module: "transactions", description: "View profit margin per transaction" },
    
    // Products Module
    { key: "products.view", module: "products", description: "View products" },
    { key: "products.create", module: "products", description: "Add new products" },
    { key: "products.update", module: "products", description: "Update product details" },
    { key: "products.delete", module: "products", description: "Delete products" },
    
    // Stores Module
    { key: "stores.view", module: "stores", description: "View stores" },
    { key: "stores.create", module: "stores", description: "Create new stores" },
    { key: "stores.update", module: "stores", description: "Update store details" },
    { key: "stores.delete", module: "stores", description: "Delete a store" },
    
    // Workers Module
    { key: "workers.view", module: "workers", description: "View workers/employees" },
    { key: "workers.create", module: "workers", description: "Add new workers" },
    { key: "workers.update", module: "workers", description: "Update worker details" },
    { key: "workers.delete", module: "workers", description: "Delete workers" },
    
    // Reports Module
    { key: "reports.view", module: "reports", description: "View reports" },
    { key: "reports.generate", module: "reports", description: "Generate new reports" },
    { key: "reports.delete", module: "reports", description: "Delete reports" },
    { key: "reports.export", module: "reports", description: "Export reports" },
    { key: "reports.profit.view", module: "reports", description: "View profit-specific reports" },
    { key: "reports.profit.generate", module: "reports", description: "Generate profit reports" },
    { key: "reports.sales.view", module: "reports", description: "View sales reports" },
    { key: "reports.inventory.view", module: "reports", description: "View inventory reports" },
    
    // Inventory Module
    { key: "inventory.view", module: "inventory", description: "View inventory" },
    { key: "inventory.create", module: "inventory", description: "Add inventory items" },
    { key: "inventory.update", module: "inventory", description: "Update inventory items" },
    { key: "inventory.delete", module: "inventory", description: "Delete inventory items" },
    { key: "inventory.profit.view", module: "inventory", description: "View potential profit from inventory" },
    { key: "inventory.margins.view", module: "inventory", description: "View product margin calculations" },
    
    // Financial Module (Profit & Revenue)
    { key: "profit.view", module: "financial", description: "View profit margins and earnings" },
    { key: "profit.daily", module: "financial", description: "View daily profit calculations" },
    { key: "profit.weekly", module: "financial", description: "View weekly profit reports" },
    { key: "profit.monthly", module: "financial", description: "View monthly profit reports" },
    { key: "profit.annual", module: "financial", description: "View annual profit reports" },
    { key: "profit.by_store", module: "financial", description: "View profit breakdown by store" },
    { key: "profit.by_product", module: "financial", description: "View profit breakdown by product" },
    { key: "profit.by_category", module: "financial", description: "View profit breakdown by category" },
    { key: "profit.margins", module: "financial", description: "View profit margin percentages" },
    { key: "profit.projections", module: "financial", description: "View profit projections and forecasts" },
    { key: "profit.export", module: "financial", description: "Export profit reports" },
    { key: "cost.view", module: "financial", description: "View cost prices and expenses" },
    { key: "revenue.view", module: "financial", description: "View revenue breakdown" },
    { key: "gross_profit.view", module: "financial", description: "View gross profit calculations" },
    { key: "net_profit.view", module: "financial", description: "View net profit after expenses" },
    { key: "profit_loss.view", module: "financial", description: "View profit and loss statements" },
    
    // Users Module
    { key: "users.view", module: "users", description: "View users" },
    { key: "users.create", module: "users", description: "Create users" },
    { key: "users.update", module: "users", description: "Update users" },
    { key: "users.delete", module: "users", description: "Delete users" },
    
    // Profile Module
    { key: "profile.view", module: "profile", description: "View user profile" },
    { key: "profile.update", module: "profile", description: "Update user profile" },
    { key: "profile.change_password", module: "profile", description: "Change password" },
    
    // Roles Module
    { key: "roles.view", module: "roles", description: "View roles" },
    { key: "roles.create", module: "roles", description: "Create roles" },
    { key: "roles.update", module: "roles", description: "Update roles" },
    { key: "roles.delete", module: "roles", description: "Delete roles" },
    { key: "permissions.manage", module: "system", description: "Manage user permissions and roles" },
    
    // Dashboard & Analytics
    { key: "dashboard.view", module: "dashboard", description: "View dashboard" },
    { key: "analytics.view", module: "analytics", description: "View analytics dashboard" },
    { key: "analytics.export", module: "analytics", description: "Export analytics data" },
    
    // System Module
    { key: "settings.manage", module: "system", description: "Manage system settings" },
    { key: "database.manage", module: "system", description: "Manage database operations" },
    
    // Payments Module
    { key: "payments.manage", module: "payments", description: "Full payment management rights" },
    { key: "payments.view", module: "payments", description: "View payments" },
    { key: "payments.process", module: "payments", description: "Process payments" },
    { key: "payments.refund", module: "payments", description: "Refund payments" },
    
    // Consultations Module
    { key: "consultations.manage", module: "consultations", description: "Full management rights for consultations" },
    { key: "consultations.view", module: "consultations", description: "View consultations" },
    { key: "consultations.create", module: "consultations", description: "Create consultations" },
    { key: "consultations.update", module: "consultations", description: "Update consultation details" },
    { key: "consultations.delete", module: "consultations", description: "Delete consultations" },
    
    // Newsletter Module
    { key: "newsletter.manage", module: "newsletter", description: "Full newsletter management rights" },
    { key: "newsletter.view", module: "newsletter", description: "View newsletter subscriptions" },
    { key: "newsletter.create", module: "newsletter", description: "Create newsletter campaigns" },
    { key: "newsletter.send", module: "newsletter", description: "Send newsletter emails" },
];

const seedPermissions = async () => {
    try {
        // Connect to DB
        await connectDb();

        // Clear old permissions
        await Permission.deleteMany({});

        // Insert new permissions
        await Permission.insertMany(permissions);

        console.log("✅ Permissions seeded successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding permissions:", error);
        process.exit(1);
    }
};


seedPermissions()
