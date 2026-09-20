#!/usr/bin/env node
// seeders/orbit-test.seed.js
// Test seed: Orbit business owned by codewithmunyao

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDb = require("../config/db.connection");

// Register all models upfront
const { countRoles } = require("../permissions");
const User = require("../user/user.model");
const Business = require("../business/models/business.model");
const Store = require("../stores/store.model");
const Category = require("../products/models/category.model");
const { createProduct, deleteProductsByFilter } = require("../products");
const { PlanTemplate, Subscription } = require("../subscription/models/subscription.model");

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────

const OWNER = {
  firstName: "Code",
  lastName: "WithMunyao",
  email: "codewithmunyao@gmail.com",
  phoneNo: "+254700000001",
  password: "Orbit@2024!",
  role: "superadmin",
  canAccessAllStores: true,
  isActive: true,
};

const BUSINESS = {
  businessName: "Orbit",
  businessType: "Retail Chain",
  registrationNumber: "BRN-2024-ORB001",
  taxId: "PIN-ORB1234567A",
  businessEmail: "admin@orbit.co.ke",
  businessPhone: "+254700000001",
  businessAddress: "Westlands Business Park, 2nd Floor",
  city: "Nairobi",
  country: "Kenya",
  postalCode: "00100",
  website: "https://orbit.co.ke",
  employeeCount: "11-50",
  yearEstablished: 2024,
  businessDescription: "Orbit — a modern retail and inventory management platform for East African businesses.",
  subscriptionPlan: "professional",
  paymentMethod: "annual",
  status: "active",
  isVerified: true,
  verifiedAt: new Date(),
};

const STORES = [
  {
    name: "Orbit Westlands",
    code: "ORB-WL-001",
    address: { street: "Westlands Road", building: "Orbit HQ", floor: "G", city: "Nairobi", county: "Nairobi" },
    phone: "+254700000010",
    email: "westlands@orbit.co.ke",
    openingHours: {
      monday:    { open: "08:00", close: "20:00" },
      tuesday:   { open: "08:00", close: "20:00" },
      wednesday: { open: "08:00", close: "20:00" },
      thursday:  { open: "08:00", close: "20:00" },
      friday:    { open: "08:00", close: "21:00" },
      saturday:  { open: "09:00", close: "21:00" },
      sunday:    { open: "10:00", close: "18:00" },
    },
  },
  {
    name: "Orbit CBD",
    code: "ORB-CBD-002",
    address: { street: "Moi Avenue", building: "City House", floor: "1", city: "Nairobi", county: "Nairobi" },
    phone: "+254700000020",
    email: "cbd@orbit.co.ke",
    openingHours: {
      monday:    { open: "08:00", close: "19:00" },
      tuesday:   { open: "08:00", close: "19:00" },
      wednesday: { open: "08:00", close: "19:00" },
      thursday:  { open: "08:00", close: "19:00" },
      friday:    { open: "08:00", close: "20:00" },
      saturday:  { open: "09:00", close: "20:00" },
      sunday:    { open: "10:00", close: "17:00" },
    },
  },
];

const STAFF = [
  {
    firstName: "Alice",
    lastName: "Wanjiku",
    email: "alice.manager@orbit.co.ke",
    phoneNo: "+254700000011",
    password: "OrbitManager@1",
    role: "manager",
    storeIndex: 0,
    storeRole: "manager",
  },
  {
    firstName: "Brian",
    lastName: "Otieno",
    email: "brian.cashier@orbit.co.ke",
    phoneNo: "+254700000012",
    password: "OrbitCashier@1",
    role: "cashier",
    storeIndex: 0,
    storeRole: "cashier",
  },
  {
    firstName: "Cynthia",
    lastName: "Akinyi",
    email: "cynthia.manager@orbit.co.ke",
    phoneNo: "+254700000021",
    password: "OrbitManager@2",
    role: "manager",
    storeIndex: 1,
    storeRole: "manager",
  },
  {
    firstName: "Daniel",
    lastName: "Mwenda",
    email: "daniel.staff@orbit.co.ke",
    phoneNo: "+254700000022",
    password: "OrbitStaff@1",
    role: "staff",
    storeIndex: 1,
    storeRole: "staff",
  },
];

const CATEGORIES = [
  { name: "gaming peripherals", slug: "gaming-peripherals", description: "Gaming mice, keyboards, headsets and controllers" },
  { name: "laptops",            slug: "laptops",            description: "Gaming and productivity laptops" },
  { name: "desktops",           slug: "desktops",           description: "Desktop computers and workstations" },
  { name: "monitors",           slug: "monitors",           description: "PC monitors and displays" },
  { name: "networking",         slug: "networking",         description: "Routers, switches and cables" },
  { name: "accessories",        slug: "accessories",        description: "General computer accessories" },
];

const PRODUCTS = [
  {
    name: "Logitech G502 HERO Mouse",
    sku: "LGT-G502-HERO",
    category: "gaming-peripherals",
    price: 8500,
    costPrice: 5800,
    stock: 45,
    minStock: 10,
    description: "High-performance gaming mouse with HERO sensor, 11 programmable buttons and RGB lighting.",
    brand: "Logitech",
    weight: "121g",
    productType: "gaming",
    status: "active",
    isFeatured: true,
    tags: ["gaming", "mouse", "logitech"],
    images: [{ displayUrl: "https://storage.googleapis.com/orbit-test/logitech-g502.jpg", gcsFileName: "logitech-g502.jpg", isPrimary: true }],
  },
  {
    name: "HyperX Cloud II Headset",
    sku: "HYP-CLOUD2-RED",
    category: "gaming-peripherals",
    price: 12000,
    costPrice: 8200,
    stock: 22,
    minStock: 5,
    description: "7.1 virtual surround sound gaming headset with noise-cancelling microphone.",
    brand: "HyperX",
    weight: "320g",
    productType: "gaming",
    status: "active",
    isFeatured: true,
    tags: ["gaming", "headset", "hyperx"],
    images: [{ displayUrl: "https://storage.googleapis.com/orbit-test/hyperx-cloud2.jpg", gcsFileName: "hyperx-cloud2.jpg", isPrimary: true }],
  },
  {
    name: "Corsair K95 RGB Platinum Keyboard",
    sku: "CRS-K95-RGB-PLAT",
    category: "gaming-peripherals",
    price: 18500,
    costPrice: 13000,
    stock: 15,
    minStock: 5,
    description: "Mechanical gaming keyboard with Cherry MX Speed switches and RGB backlighting.",
    brand: "Corsair",
    weight: "1200g",
    productType: "gaming",
    status: "active",
    isFeatured: false,
    tags: ["gaming", "keyboard", "corsair", "mechanical"],
    images: [{ displayUrl: "https://storage.googleapis.com/orbit-test/corsair-k95.jpg", gcsFileName: "corsair-k95.jpg", isPrimary: true }],
  },
  {
    name: 'ASUS TUF Gaming A15 Laptop',
    sku: "ASUS-TUF-A15-RX",
    category: "laptops",
    price: 125000,
    costPrice: 98000,
    stock: 8,
    minStock: 2,
    description: '15.6" FHD 144Hz gaming laptop with AMD Ryzen 7, RTX 3060, 16GB RAM, 512GB SSD.',
    brand: "ASUS",
    weight: "2.3kg",
    productType: "gaming",
    status: "active",
    isFeatured: true,
    tags: ["laptop", "gaming", "asus", "amd"],
    images: [{ displayUrl: "https://storage.googleapis.com/orbit-test/asus-tuf-a15.jpg", gcsFileName: "asus-tuf-a15.jpg", isPrimary: true }],
  },
  {
    name: "Dell Inspiron 15 3000",
    sku: "DELL-INS15-3511",
    category: "laptops",
    price: 68000,
    costPrice: 52000,
    stock: 12,
    minStock: 3,
    description: '15.6" FHD laptop with Intel Core i5-11th Gen, 8GB RAM, 256GB SSD, Windows 11.',
    brand: "Dell",
    weight: "1.83kg",
    productType: "general",
    status: "active",
    isFeatured: false,
    tags: ["laptop", "dell", "intel", "business"],
    images: [{ displayUrl: "https://storage.googleapis.com/orbit-test/dell-inspiron-15.jpg", gcsFileName: "dell-inspiron-15.jpg", isPrimary: true }],
  },
  {
    name: "LG 27GP850-B 27\" IPS Monitor",
    sku: "LG-27GP850-B",
    category: "monitors",
    price: 42000,
    costPrice: 32000,
    stock: 10,
    minStock: 3,
    description: '27" QHD IPS gaming monitor, 165Hz, 1ms response time, HDR400, AMD FreeSync.',
    brand: "LG",
    weight: "5.4kg",
    productType: "gaming",
    status: "active",
    isFeatured: true,
    tags: ["monitor", "lg", "ips", "gaming"],
    images: [{ displayUrl: "https://storage.googleapis.com/orbit-test/lg-27gp850.jpg", gcsFileName: "lg-27gp850.jpg", isPrimary: true }],
  },
  {
    name: "TP-Link Archer AX73 WiFi 6 Router",
    sku: "TPL-AX73-V1",
    category: "networking",
    price: 14500,
    costPrice: 10200,
    stock: 18,
    minStock: 5,
    description: "AX5400 dual-band WiFi 6 router with 4 external antennas, 5 GbE ports.",
    brand: "TP-Link",
    weight: "795g",
    productType: "general",
    status: "active",
    isFeatured: false,
    tags: ["router", "wifi6", "tp-link", "networking"],
    images: [{ displayUrl: "https://storage.googleapis.com/orbit-test/tplink-ax73.jpg", gcsFileName: "tplink-ax73.jpg", isPrimary: true }],
  },
  {
    name: "Seagate Portable 2TB HDD",
    sku: "SGT-STGX2000400",
    category: "accessories",
    price: 7200,
    costPrice: 5100,
    stock: 30,
    minStock: 8,
    description: "2TB portable external hard drive, USB 3.0, compatible with PC, Mac and PS4.",
    brand: "Seagate",
    weight: "159g",
    productType: "general",
    status: "active",
    isFeatured: false,
    tags: ["storage", "hdd", "seagate", "portable"],
    images: [{ displayUrl: "https://storage.googleapis.com/orbit-test/seagate-2tb.jpg", gcsFileName: "seagate-2tb.jpg", isPrimary: true }],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

const seed = async () => {
  console.log("\n🚀 Seeding Orbit test data...\n");

  // ── 1. Ensure roles exist ─────────────────────────────────────────────────
  const roleCount = await countRoles();
  if (roleCount === 0) {
    throw new Error("No roles found — run `npm run seed:roles` first, then retry.");
  }

  // ── 2. Ensure a Professional plan exists ─────────────────────────────────
  let plan = await PlanTemplate.findOne({ slug: "professional" });
  if (!plan) {
    plan = await PlanTemplate.create({
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
      features: ["Up to 10 stores", "Up to 25 users", "Advanced analytics", "Priority support", "API access"],
    });
    console.log("💳 Created Professional plan template");
  } else {
    console.log("💳 Professional plan already exists — skipping");
  }

  // ── 3. Check if Orbit business already exists ────────────────────────────
  const existingBusiness = await Business.findOne({ businessEmail: BUSINESS.businessEmail });
  if (existingBusiness) {
    throw new Error(
      `Orbit business already exists (${existingBusiness._id}). Run with --force to wipe and reseed.`,
    );
  }

  // ── 4. Bootstrap business with placeholder refs ───────────────────────────
  // Business requires both `owner` and `subscription` up front.
  // User requires `businessId`. Subscription requires `business`.
  // Resolution: create business with placeholder ObjectIds, then create the
  // real documents, then backfill both references in a single save.
  const placeholder = new mongoose.Types.ObjectId();
  const business = await Business.create({ ...BUSINESS, owner: placeholder, subscription: placeholder });
  console.log(`🏢 Business created: ${business.businessName} (${business._id})`);

  // ── 5. Create owner ───────────────────────────────────────────────────────
  const hashedOwnerPassword = await bcrypt.hash(OWNER.password, 12);
  const owner = await User.create({ ...OWNER, password: hashedOwnerPassword, businessId: business._id });
  console.log(`👤 Owner created: ${OWNER.email}`);

  // ── 6. Create subscription ────────────────────────────────────────────────
  const periodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const subscription = await Subscription.create({
    business: business._id,
    plan: plan._id,
    planSlug: plan.slug,
    billingCycle: "annual",
    status: "active",
    pricePaid: plan.annualPrice,
    currency: "KES",
    currentPeriodStart: new Date(),
    currentPeriodEnd: periodEnd,
    nextBillingDate: periodEnd,
    isTrialUsed: true,
    limits: { maxStores: plan.maxStores, maxUsers: plan.maxUsers, maxBusinesses: plan.maxBusinesses },
  });

  // Backfill real references
  business.owner = owner._id;
  business.subscription = subscription._id;
  await business.save();
  console.log(`💳 Subscription created: Professional · annual · active`);

  // ── 7. Create stores ──────────────────────────────────────────────────────
  const stores = [];
  for (const storeData of STORES) {
    const store = await Store.create({ ...storeData, businessId: business._id, status: "active" });
    stores.push(store);
    console.log(`🏪 Store created: ${store.name} (${store.code})`);
  }

  // Link owner to all stores
  owner.assignedStore = stores[0]._id;
  owner.storeRoles = stores.map((s) => ({ store: s._id, role: "manager" }));
  owner.storePermissions = stores.map((s) => ({
    store: s._id,
    canView: true,
    canEdit: true,
    canSell: true,
    canManage: true,
  }));
  await owner.save();

  // ── 8. Create staff ───────────────────────────────────────────────────────
  console.log("\n👥 Creating staff...");
  for (const staffData of STAFF) {
    const { storeIndex, storeRole, password, ...userData } = staffData;
    const assignedStore = stores[storeIndex];
    const permsMap = {
      manager: { canView: true, canEdit: true, canSell: true, canManage: true },
      cashier:  { canView: true, canEdit: false, canSell: true, canManage: false },
      staff:    { canView: true, canEdit: false, canSell: false, canManage: false },
    };
    const hashed = await bcrypt.hash(password, 12);
    await User.create({
      ...userData,
      password: hashed,
      businessId: business._id,
      assignedStore: assignedStore._id,
      storeRoles: [{ store: assignedStore._id, role: storeRole }],
      storePermissions: [{ store: assignedStore._id, ...permsMap[storeRole] }],
      isActive: true,
    });
    console.log(`   ✅ ${staffData.role.padEnd(10)} ${staffData.email}  /  ${password}`);
  }

  // ── 9. Create categories ──────────────────────────────────────────────────
  // Category.name has a global unique index, so use upsert to avoid conflicts
  // with categories that may already exist from other businesses' seeds.
  console.log("\n🏷️  Creating categories...");
  const createdCategories = [];
  for (const cat of CATEGORIES) {
    const created = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $setOnInsert: { ...cat, businessId: business._id } },
      { upsert: true, new: true },
    );
    createdCategories.push(created);
    console.log(`   ✅ ${created.name}`);
  }

  // ── 10. Create products ───────────────────────────────────────────────────
  console.log("\n📦 Creating products...");
  for (const prod of PRODUCTS) {
    await createProduct({ ...prod, businessId: business._id });
    console.log(`   ✅ ${prod.name}`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Orbit test seed complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Business   : ${business.businessName}
Business ID: ${business._id}

Owner login
  Email    : ${OWNER.email}
  Password : ${OWNER.password}
  Role     : superadmin

Staff logins
  alice.manager@orbit.co.ke   /  OrbitManager@1  (manager  · Westlands)
  brian.cashier@orbit.co.ke   /  OrbitCashier@1  (cashier  · Westlands)
  cynthia.manager@orbit.co.ke /  OrbitManager@2  (manager  · CBD)
  daniel.staff@orbit.co.ke    /  OrbitStaff@1    (staff    · CBD)

Stores     : ${STORES.map((s) => s.name).join(", ")}
Categories : ${CATEGORIES.length}
Products   : ${PRODUCTS.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
};

// ─────────────────────────────────────────────────────────────────────────────
// FORCE WIPE (--force flag)
// ─────────────────────────────────────────────────────────────────────────────

const wipe = async () => {
  console.log("🗑️  Wiping Orbit test data...");

  // Always remove the owner by email (handles partial previous runs)
  await User.deleteMany({ email: OWNER.email });

  const business = await Business.findOne({ businessEmail: BUSINESS.businessEmail });
  if (!business) {
    console.log("   Business not found — cleared owner user only.");
    return;
  }

  const businessId = business._id;
  const [users, stores, cats, prods, subs] = await Promise.all([
    User.deleteMany({ businessId }),
    Store.deleteMany({ businessId }),
    Category.deleteMany({ businessId }),
    deleteProductsByFilter({ businessId }),
    Subscription.deleteMany({ business: businessId }),
  ]);
  await Business.deleteOne({ _id: businessId });
  console.log(`   Deleted: ${users.deletedCount + 1} users, ${stores.deletedCount} stores, ${cats.deletedCount} categories, ${prods.deletedCount} products, ${subs.deletedCount} subscriptions, 1 business`);
};

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  (async () => {
    try {
      await connectDb();
      console.log(`📦 Connected: ${mongoose.connection.host}/${mongoose.connection.db?.databaseName}`);

      const args = process.argv.slice(2);
      const force = args.includes("--force") || args.includes("-f");

      if (force) await wipe();
      await seed();

      await mongoose.connection.close();
      console.log("🔌 Connection closed");
      process.exit(0);
    } catch (error) {
      if (error.message && error.message.includes("already exists")) {
        console.log(`\n⏭️  ${error.message}\n`);
        await mongoose.connection.close();
        process.exit(0);
      }
      console.error("\n💥 Seed failed:", error.message);
      if (process.env.DEBUG) console.error(error.stack);
      process.exit(1);
    }
  })();
}

module.exports = { seed, wipe };
