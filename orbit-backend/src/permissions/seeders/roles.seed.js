const Role = require("../models/role.model");
const Permission = require("../models/permission.model");
const connectDb = require("../../config/db.connection");

const seedRoles = async () => {
  try {
    await connectDb();
    console.log("📦 Seeding roles...");

    // Get all permissions from database
    const allPermissions = await Permission.find({});
    const permissionKeys = allPermissions.map((p) => p.key);

    // Filter out profit-related permissions
    const profitRelatedPermissions = permissionKeys.filter(
      (key) =>
        key.includes("profit") ||
        key.includes("margin") ||
        key.includes("gross") ||
        key.includes("net") ||
        key.includes("cost") ||
        key.includes("revenue") ||
        key.includes("financial") ||
        key.includes("loss") ||
        key.includes("transactions.profit") ||
        key.includes("transactions.cost") ||
        key.includes("transactions.margin") ||
        key.includes("inventory.profit") ||
        key.includes("inventory.margins") ||
        key.includes("reports.profit") ||
        key === "payments.manage" // Hide payment management from non-admins
    );

    // Permissions that should be hidden from non-admin/superadmin
    const sensitivePermissions = [
      ...profitRelatedPermissions,
      "users.delete",
      "roles.manage",
      "permissions.manage",
      "database.manage",
      "settings.manage",
      "analytics.export",
      "reports.delete",
      "transactions.delete",
      "transactions.reverse",
      "transactions.approve",
      "transactions.audit",
      "sales.delete",
      "sales.void",
      "sales.refund",
      "stores.delete",
      "workers.delete",
      "products.delete",
      "inventory.delete",
    ];

    // Define role permission assignments
    const roleDefinitions = [
      {
        name: "superadmin",
        description: "Full system access with all permissions",
        permissions: permissionKeys, // Superadmin gets everything
        isSystemRole: true,
        canAssign: true,
        level: 10,
      },
      {
        name: "admin",
        description: "Administrator with management permissions",
        permissions: permissionKeys.filter(
          (key) => !sensitivePermissions.includes(key) || 
                   key === "users.view" || 
                   key === "roles.view"
        ),
        isSystemRole: true,
        canAssign: true,
        level: 9,
      },
      {
        name: "manager",
        description: "Store manager with sales and inventory access",
        permissions: [
          "products.view",
          "products.create",
          "products.update",
          "sales.view",
          "sales.create",
          "sales.update",
          "sales.discount",
          "inventory.view",
          "inventory.update",
          "inventory.create",
          "dashboard.view",
          "reports.view",
          "stores.view",
          "transactions.view",
           "transactions.mpesa.view",
          "workers.view",
          "profile.view",
          "profile.update",
          "profile.change_password",
        ].filter(permission => 
          // Ensure no profit permissions sneak in
          !profitRelatedPermissions.includes(permission) &&
          !sensitivePermissions.includes(permission)
        ),
        isSystemRole: true,
        canAssign: false,
        level: 7,
      },
      {
        name: "cashier",
        description: "Cashier - can process sales and view basic info only",
        permissions: [
          "products.view",
          "sales.view",
          "sales.create",
          "dashboard.view",
          "transactions.view",
           "transactions.mpesa.view",
          "profile.view",
          "profile.update",
          "inventory.view",
          "profile.change_password",
          "customers.view", // Add if exists
        ].filter(permission => 
          // Strict filter - no profit, no financial, no sensitive data
          !profitRelatedPermissions.includes(permission) &&
          !sensitivePermissions.includes(permission) &&
          !permission.includes("profit") &&
          !permission.includes("margin") &&
          !permission.includes("cost") &&
          !permission.includes("revenue") &&
          !permission.includes("delete") &&
          !permission.includes("void") &&
          !permission.includes("refund") &&
          !permission.includes("approve") &&
          !permission.includes("reverse") &&
          !permission.includes("audit") &&
          !permission.includes("export")
        ),
        isSystemRole: true,
        canAssign: false,
        level: 5,
      },
      {
        name: "staff",
        description: "General staff member - view only",
        permissions: [
          "products.view",
          "dashboard.view",
          "profile.view",
          "profile.update",
          "profile.change_password",
        ].filter(permission => 
          // Strict read-only, no financial data
          !profitRelatedPermissions.includes(permission) &&
          !sensitivePermissions.includes(permission) &&
          !permission.includes("create") &&
          !permission.includes("update") &&
          !permission.includes("delete") &&
          !permission.includes("profit") &&
          !permission.includes("margin") &&
          !permission.includes("cost") &&
          !permission.includes("revenue") &&
          !permission.includes("transactions")
        ),
        isSystemRole: true,
        canAssign: false,
        level: 4,
      },
    ];

    // Clear existing roles
    await Role.deleteMany({});
    console.log("🧹 Cleared existing roles");

    // Create roles
    const createdRoles = await Role.insertMany(roleDefinitions);
    console.log(`✅ Created ${createdRoles.length} roles`);

    // Log each role with permission count and verify no profit permissions
    createdRoles.forEach((role) => {
      console.log(`   • ${role.name}: ${role.permissions.length} permissions`);
      
      // Double-check for profit permissions in non-admin roles
      if (role.name !== "superadmin" && role.name !== "admin") {
        const hasProfitPermission = role.permissions.some(
          perm => 
            perm.includes("profit") || 
            perm.includes("margin") || 
            perm.includes("cost") ||
            perm.includes("revenue") ||
            perm.includes("gross") ||
            perm.includes("net")
        );
        
        if (hasProfitPermission) {
          console.warn(`   ⚠️  Warning: ${role.name} has profit-related permissions!`);
        } else {
          console.log(`   ✅ ${role.name}: No profit permissions`);
        }
      }
    });

    console.log("🎉 Role seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedRoles();
}

module.exports = seedRoles;