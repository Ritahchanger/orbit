#!/usr/bin/env node
// seeds/business.seed.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDb = require("../config/db.connection");

// ✅ Register ALL models first — fixes "Schema hasn't been registered for model Role"
const Role = require("../permissions/models/role.model");
const User = require("../user/user.model");
const Business = require("../business/models/business.model");
const {
  PlanTemplate,
  Subscription,
} = require("../subscription/model/subscription.model");

// ── Plan Seed Data ────────────────────────────────────────────────────────────

const planSeeds = [
  {
    name: "Starter",
    slug: "starter",
    monthlyPrice: 5000,
    annualPrice: 48000,
    annualDiscountPercent: 20,
    currency: "KES",
    maxStores: 2,
    maxUsers: 5,
    maxBusinesses: 1,
    trialDays: 14,
    isPopular: false,
    isActive: true,
    features: [
      "Up to 2 stores",
      "Up to 5 users",
      "Basic analytics",
      "Inventory management",
      "Email support",
    ],
  },
  {
    name: "Professional",
    slug: "professional",
    monthlyPrice: 15000,
    annualPrice: 144000,
    annualDiscountPercent: 20,
    currency: "KES",
    maxStores: 10,
    maxUsers: 25,
    maxBusinesses: 3,
    trialDays: 14,
    isPopular: true,
    isActive: true,
    features: [
      "Up to 10 stores",
      "Up to 25 users",
      "Advanced analytics",
      "Multi-business support",
      "Priority support",
      "API access",
      "Custom reports",
    ],
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    monthlyPrice: 0,
    annualPrice: 0,
    annualDiscountPercent: 0,
    currency: "KES",
    maxStores: -1,
    maxUsers: -1,
    maxBusinesses: -1,
    trialDays: 14,
    isPopular: false,
    isActive: true,
    features: [
      "Unlimited stores",
      "Unlimited users",
      "Unlimited businesses",
      "Custom analytics",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise option",
      "Custom integrations",
    ],
  },
];

// ── Role Seed Data ────────────────────────────────────────────────────────────

const roleSeeds = [
  {
    name: "superadmin",
    description: "Full system access with all permissions",
    isSystemRole: true,
    canAssign: true,
    level: 10,
    permissions: [], // superadmin bypasses permission checks
  },
  {
    name: "admin",
    description: "Administrator with management permissions",
    isSystemRole: true,
    canAssign: true,
    level: 9,
    permissions: [
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
      "stores.view",
      "stores.create",
      "stores.edit",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "inventory.view",
      "inventory.edit",
      "sales.view",
      "sales.create",
      "sales.edit",
      "reports.view",
      "reports.export",
    ],
  },
  {
    name: "manager",
    description: "Store manager with sales and inventory access",
    isSystemRole: true,
    canAssign: false,
    level: 7,
    permissions: [
      "users.view",
      "stores.view",
      "products.view",
      "products.create",
      "products.edit",
      "inventory.view",
      "inventory.edit",
      "sales.view",
      "sales.create",
      "reports.view",
    ],
  },
  {
    name: "cashier",
    description: "Cashier with basic sales permissions",
    isSystemRole: true,
    canAssign: false,
    level: 5,
    permissions: [
      "products.view",
      "inventory.view",
      "sales.view",
      "sales.create",
    ],
  },
  {
    name: "staff",
    description: "General staff member",
    isSystemRole: true,
    canAssign: false,
    level: 4,
    permissions: ["products.view", "inventory.view", "sales.view"],
  },
];

// ── Business Seed Data ────────────────────────────────────────────────────────

const businessSeeds = [
  {
    businessName: "Savanna Retail Group",
    businessType: "Retail Chain",
    registrationNumber: "BRN-2022-001",
    taxId: "PIN-A001234567B",
    businessEmail: "info@savannaretail.co.ke",
    businessPhone: "+254 720 111 001",
    businessAddress: "Westlands Commercial Centre, 3rd Floor",
    city: "Nairobi",
    country: "Kenya",
    postalCode: "00100",
    website: "https://savannaretail.co.ke",
    employeeCount: "51-200",
    yearEstablished: 2018,
    businessDescription:
      "A leading retail chain operating across East Africa with focus on FMCG and household products.",
    numberOfStores: 8,
    subscriptionPlan: "professional",
    paymentMethod: "annual",
    status: "active",
    isVerified: true,
    verifiedAt: new Date("2022-03-15"),
    admin: {
      firstName: "James",
      lastName: "Mwangi",
      email: "james.mwangi@savannaretail.co.ke",
      phoneNo: "+254 722 111 001",
      password: "SavannaAdmin2024!",
    },
  },
  {
    businessName: "Kilimanjaro Foods Ltd",
    businessType: "Restaurant Chain",
    registrationNumber: "BRN-2020-045",
    taxId: "PIN-B009876543C",
    businessEmail: "ops@kilifoods.co.ke",
    businessPhone: "+254 733 222 002",
    businessAddress: "Ngong Road, Karen Shopping Centre",
    city: "Nairobi",
    country: "Kenya",
    postalCode: "00502",
    website: "https://kilifoods.co.ke",
    employeeCount: "201-500",
    yearEstablished: 2015,
    businessDescription:
      "Restaurant chain serving authentic African cuisine across Kenya and Uganda.",
    numberOfStores: 6,
    subscriptionPlan: "professional",
    paymentMethod: "monthly",
    status: "active",
    isVerified: true,
    verifiedAt: new Date("2021-01-10"),
    admin: {
      firstName: "Sarah",
      lastName: "Kimani",
      email: "sarah.kimani@kilifoods.co.ke",
      phoneNo: "+254 733 222 002",
      password: "KiliAdmin2024!",
    },
  },
  {
    businessName: "Boda Express Logistics",
    businessType: "Wholesale",
    registrationNumber: "BRN-2023-112",
    taxId: "PIN-C004567891D",
    businessEmail: "hello@bodaexpress.co.ke",
    businessPhone: "+254 711 333 003",
    businessAddress: "Industrial Area, Enterprise Road",
    city: "Nairobi",
    country: "Kenya",
    postalCode: "00200",
    website: "",
    employeeCount: "11-50",
    yearEstablished: 2023,
    businessDescription:
      "Last-mile delivery and wholesale distribution startup serving small businesses in Nairobi.",
    numberOfStores: 1,
    subscriptionPlan: "starter",
    paymentMethod: "monthly",
    status: "active",
    isVerified: true,
    verifiedAt: new Date("2023-06-20"),
    admin: {
      firstName: "David",
      lastName: "Ochieng",
      email: "david.ochieng@bodaexpress.co.ke",
      phoneNo: "+254 711 333 003",
      password: "BodaAdmin2024!",
    },
  },
  {
    businessName: "Rift Valley Supermarkets",
    businessType: "Retail Chain",
    registrationNumber: "BRN-2019-007",
    taxId: "PIN-D007654321E",
    businessEmail: "admin@riftvalleysuper.co.ke",
    businessPhone: "+254 722 444 004",
    businessAddress: "Nakuru Town Centre, Kenyatta Avenue",
    city: "Nakuru",
    country: "Kenya",
    postalCode: "20100",
    website: "https://riftvalleysuper.co.ke",
    employeeCount: "500+",
    yearEstablished: 2012,
    businessDescription:
      "Regional supermarket chain with operations in Rift Valley and Western Kenya.",
    numberOfStores: 12,
    subscriptionPlan: "enterprise",
    paymentMethod: "annual",
    status: "active",
    isVerified: true,
    verifiedAt: new Date("2019-09-01"),
    admin: {
      firstName: "Grace",
      lastName: "Chebet",
      email: "grace.chebet@riftvalleysuper.co.ke",
      phoneNo: "+254 722 444 004",
      password: "RiftAdmin2024!",
    },
  },
  {
    businessName: "Pwani E-Commerce Hub",
    businessType: "E-commerce",
    registrationNumber: "BRN-2024-089",
    taxId: "PIN-E008765432F",
    businessEmail: "support@pwanihub.co.ke",
    businessPhone: "+254 744 555 005",
    businessAddress: "Nyali Centre, Links Road",
    city: "Mombasa",
    country: "Kenya",
    postalCode: "80100",
    website: "https://pwanihub.co.ke",
    employeeCount: "1-10",
    yearEstablished: 2024,
    businessDescription:
      "Online marketplace connecting coastal artisans and traders with customers across Kenya.",
    numberOfStores: 1,
    subscriptionPlan: "starter",
    paymentMethod: "monthly",
    status: "pending",
    isVerified: false,
    admin: {
      firstName: "Ali",
      lastName: "Hassan",
      email: "ali.hassan@pwanihub.co.ke",
      phoneNo: "+254 744 555 005",
      password: "PwaniAdmin2024!",
    },
  },
];

// ── Seed Roles ────────────────────────────────────────────────────────────────

const seedRoles = async (force = false) => {
  console.log("\n🔐 Seeding roles...");

  if (force) {
    await Role.deleteMany({});
    console.log("   🗑️  Cleared existing roles");
  }

  const existing = await Role.countDocuments();
  if (existing > 0 && !force) {
    console.log(`   ✅ Roles already seeded (${existing} found) — skipping`);
    return await Role.find();
  }

  const created = await Role.insertMany(roleSeeds);
  console.log(`   ✅ Created ${created.length} roles:`);
  created.forEach((r) =>
    console.log(
      `      Level ${r.level} — ${r.name.padEnd(12)} (${r.permissions.length} permissions)`,
    ),
  );

  return created;
};

// ── Seed Plans ────────────────────────────────────────────────────────────────

const seedPlans = async (force = false) => {
  console.log("\n💳 Seeding plan templates...");

  if (force) {
    await PlanTemplate.deleteMany({});
    console.log("   🗑️  Cleared existing plan templates");
  }

  const existing = await PlanTemplate.countDocuments();
  if (existing > 0 && !force) {
    console.log(`   ✅ Plans already seeded (${existing} found) — skipping`);
    return await PlanTemplate.find();
  }

  const created = await PlanTemplate.insertMany(planSeeds);
  console.log(`   ✅ Created ${created.length} plan templates:`);
  created.forEach((p) => {
    const price =
      p.monthlyPrice === 0
        ? "Custom pricing"
        : `KES ${p.monthlyPrice.toLocaleString()}/mo  |  KES ${p.annualPrice.toLocaleString()}/yr`;
    console.log(
      `      ${p.isPopular ? "⭐" : "  "} ${p.name.padEnd(15)} ${price}`,
    );
  });

  return created;
};

// ── Seed Businesses ───────────────────────────────────────────────────────────
// seeds/business.seed.js - seedBusinesses function only, everything else stays the same

const seedBusinesses = async (plans, force = false) => {
  console.log("\n🏢 Seeding businesses...");

  if (force) {
    await Business.deleteMany({});
    await Subscription.deleteMany({});
    await User.deleteMany({
      role: "superadmin",
      email: { $ne: "superadmin@orbit.com" },
    });
    console.log(
      "   🗑️  Cleared existing businesses, subscriptions and their admin users",
    );
  }

  const planMap = {};
  plans.forEach((p) => {
    planMap[p.slug] = p;
  });

  let created = 0;
  let skipped = 0;

  for (const seed of businessSeeds) {
    const { admin, ...businessData } = seed;

    const exists = await Business.findOne({
      businessEmail: businessData.businessEmail,
    });
    if (exists && !force) {
      console.log(
        `   ⏭️  Skipping "${businessData.businessName}" — already exists`,
      );
      skipped++;
      continue;
    }

    // Track created docs so we can clean up manually if something fails
    let createdUser = null;
    let createdBusiness = null;
    let createdSubscription = null;

    try {
      // 1. Create owner user — no session needed
      const hashedPassword = await bcrypt.hash(admin.password, 12);

      createdUser = await User.create({
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email.toLowerCase(),
        phoneNo: admin.phoneNo,
        password: hashedPassword,
        role: "superadmin",
        canAccessAllStores: true,
        isActive: true,
      });

      // 2. Create business
      createdBusiness = await Business.create({
        ...businessData,
        owner: createdUser._id,
      });

      // 3. Create subscription
      const plan = planMap[businessData.subscriptionPlan];
      const isAnnual = businessData.paymentMethod === "annual";
      const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
      const periodEnd = isAnnual
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const subStatus = businessData.isVerified ? "active" : "trialing";

      createdSubscription = await Subscription.create({
        business: createdBusiness._id,
        plan: plan._id,
        planSlug: plan.slug,
        billingCycle: businessData.paymentMethod,
        status: subStatus,
        pricePaid: price,
        currency: "KES",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        nextBillingDate: periodEnd,
        isTrialUsed: businessData.isVerified,
        limits: {
          maxStores: plan.maxStores,
          maxUsers: plan.maxUsers,
          maxBusinesses: plan.maxBusinesses,
        },
      });

      // 4. Link subscription back to business
      createdBusiness.subscription = createdSubscription._id;
      await createdBusiness.save();

      created++;
      console.log(`   ✅ ${businessData.businessName}`);
      console.log(`      👤 ${admin.email}  /  ${admin.password}`);
      console.log(
        `      💳 ${plan.name} · ${businessData.paymentMethod} · ${subStatus}`,
      );
    } catch (error) {
      // Manual rollback since we have no transactions
      console.error(
        `   ❌ Failed "${businessData.businessName}": ${error.message}`,
      );
      console.log(`      🔁 Rolling back...`);

      if (createdSubscription)
        await Subscription.deleteOne({ _id: createdSubscription._id });
      if (createdBusiness)
        await Business.deleteOne({ _id: createdBusiness._id });
      if (createdUser) await User.deleteOne({ _id: createdUser._id });

      console.log(`      ✅ Rollback complete`);
    }
  }

  console.log(`\n   Created : ${created}  |  Skipped : ${skipped}`);
};

// ── Run ───────────────────────────────────────────────────────────────────────

const run = async () => {
  const args = process.argv.slice(2);
  const force = args.includes("--force") || args.includes("-f");

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Orbit Seed Tool — Roles, Plans & Businesses
============================================
Usage: npm run seed:businesses [options]

Options:
  --force,  -f   Wipe existing data and reseed everything
  --help,   -h   Show this help

npm run seed:businesses
npm run seed:businesses --force
    `);
    process.exit(0);
  }

  if (force)
    console.log("⚠️  Force mode: existing data will be wiped and reseeded");

  // Order matters: roles → plans → businesses
  await seedRoles(force);
  const plans = await seedPlans(force);
  await seedBusinesses(plans, force);

  console.log("\n🎉 Seed complete!\n");
};

// ── Safety ────────────────────────────────────────────────────────────────────

if (
  process.env.NODE_ENV === "production" &&
  !process.argv.includes("--force")
) {
  console.error("🚨 Production mode — add --force flag to proceed");
  process.exit(1);
}

if (require.main === module) {
  (async () => {
    try {
      await connectDb();
      console.log(
        `📦 Connected: ${mongoose.connection.host}/${mongoose.connection.db?.databaseName}`,
      );
      await run();
      await mongoose.connection.close();
      console.log("🔌 Connection closed");
      process.exit(0);
    } catch (error) {
      console.error("💥 Seed failed:", error.message);
      process.exit(1);
    }
  })();
}

module.exports = { seedRoles, seedPlans, seedBusinesses };
