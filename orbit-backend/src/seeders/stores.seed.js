const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Store model
const Store = require('../stores/store.model');

// Gaming stores in Nairobi
const gamingStores = [
    {
        name: "Mega Gamers Central",
        code: "MG001",
        address: {
            street: "Kenyatta Avenue",
            building: "Hilton Plaza",
            floor: "Ground Floor, Shop 12",
            city: "Nairobi",
            county: "Nairobi"
        },
        phone: "+254 700 111 001",
        email: "central@megagamers.co.ke",
        openingHours: {
            monday: { open: "09:00", close: "20:00" },
            tuesday: { open: "09:00", close: "20:00" },
            wednesday: { open: "09:00", close: "20:00" },
            thursday: { open: "09:00", close: "20:00" },
            friday: { open: "09:00", close: "21:00" },
            saturday: { open: "10:00", close: "22:00" },
            sunday: { open: "11:00", close: "19:00" }
        },
        status: "active"
    },
    {
        name: "Westlands Gaming Hub",
        code: "MG002",
        address: {
            street: "Westlands Road",
            building: "Sarit Centre",
            floor: "1st Floor, Shop 45",
            city: "Nairobi",
            county: "Nairobi"
        },
        phone: "+254 700 111 002",
        email: "westlands@megagamers.co.ke",
        openingHours: {
            monday: { open: "10:00", close: "20:00" },
            tuesday: { open: "10:00", close: "20:00" },
            wednesday: { open: "10:00", close: "20:00" },
            thursday: { open: "10:00", close: "20:00" },
            friday: { open: "10:00", close: "21:00" },
            saturday: { open: "10:00", close: "21:00" },
            sunday: { open: "12:00", close: "18:00" }
        },
        status: "active"
    },
    {
        name: "Gaming Arena Kilimani",
        code: "MG003",
        address: {
            street: "Ngong Road",
            building: "Yaya Centre",
            floor: "2nd Floor, Shop 23",
            city: "Nairobi",
            county: "Nairobi"
        },
        phone: "+254 700 111 003",
        email: "kilimani@megagamers.co.ke",
        openingHours: {
            monday: { open: "09:30", close: "19:30" },
            tuesday: { open: "09:30", close: "19:30" },
            wednesday: { open: "09:30", close: "19:30" },
            thursday: { open: "09:30", close: "19:30" },
            friday: { open: "09:30", close: "20:30" },
            saturday: { open: "10:00", close: "21:00" },
            sunday: { open: "11:00", close: "18:00" }
        },
        status: "active"
    },
    {
        name: "Karen Console Center",
        code: "MG004",
        address: {
            street: "Karen Road",
            building: "Karen Waterfront",
            floor: "Shop 8",
            city: "Nairobi",
            county: "Nairobi"
        },
        phone: "+254 700 111 004",
        email: "karen@megagamers.co.ke",
        openingHours: {
            monday: { open: "10:00", close: "19:00" },
            tuesday: { open: "10:00", close: "19:00" },
            wednesday: { open: "10:00", close: "19:00" },
            thursday: { open: "10:00", close: "19:00" },
            friday: { open: "10:00", close: "20:00" },
            saturday: { open: "10:00", close: "20:00" },
            sunday: { open: "12:00", close: "17:00" }
        },
        status: "active"
    },
    {
        name: "Eastleigh Gaming World",
        code: "MG005",
        address: {
            street: "Eastleigh 1st Avenue",
            building: "Garissa Lodge Plaza",
            floor: "Ground Floor, Shop 5",
            city: "Nairobi",
            county: "Nairobi"
        },
        phone: "+254 700 111 005",
        email: "eastleigh@megagamers.co.ke",
        openingHours: {
            monday: { open: "08:00", close: "20:00" },
            tuesday: { open: "08:00", close: "20:00" },
            wednesday: { open: "08:00", close: "20:00" },
            thursday: { open: "08:00", close: "20:00" },
            friday: { open: "08:00", close: "21:00" },
            saturday: { open: "09:00", close: "21:00" },
            sunday: { open: "10:00", close: "19:00" }
        },
        status: "active"
    },
    {
        name: "Thika Road Gamers Den",
        code: "MG006",
        address: {
            street: "Thika Road",
            building: "Thika Road Mall (TRM)",
            floor: "1st Floor, Shop 32",
            city: "Nairobi",
            county: "Nairobi"
        },
        phone: "+254 700 111 006",
        email: "thika@megagamers.co.ke",
        openingHours: {
            monday: { open: "09:00", close: "20:00" },
            tuesday: { open: "09:00", close: "20:00" },
            wednesday: { open: "09:00", close: "20:00" },
            thursday: { open: "09:00", close: "20:00" },
            friday: { open: "09:00", close: "21:00" },
            saturday: { open: "09:00", close: "21:00" },
            sunday: { open: "10:00", close: "19:00" }
        },
        status: "active"
    },
    {
        name: "Runda PC Gaming Zone",
        code: "MG007",
        address: {
            street: "Runda Drive",
            building: "Runda Shopping Centre",
            floor: "Shop 15",
            city: "Nairobi",
            county: "Nairobi"
        },
        phone: "+254 700 111 007",
        email: "runda@megagamers.co.ke",
        openingHours: {
            monday: { open: "10:00", close: "19:00" },
            tuesday: { open: "10:00", close: "19:00" },
            wednesday: { open: "10:00", close: "19:00" },
            thursday: { open: "10:00", close: "19:00" },
            friday: { open: "10:00", close: "20:00" },
            saturday: { open: "10:00", close: "20:00" },
            sunday: { open: "11:00", close: "18:00" }
        },
        status: "active"
    },
    {
        name: "CBD Gaming Express",
        code: "MG008",
        address: {
            street: "Moi Avenue",
            building: "Nakumatt Lifestyle",
            floor: "Ground Floor, Shop 7",
            city: "Nairobi",
            county: "Nairobi"
        },
        phone: "+254 700 111 008",
        email: "cbd@megagamers.co.ke",
        openingHours: {
            monday: { open: "08:00", close: "21:00" },
            tuesday: { open: "08:00", close: "21:00" },
            wednesday: { open: "08:00", close: "21:00" },
            thursday: { open: "08:00", close: "21:00" },
            friday: { open: "08:00", close: "22:00" },
            saturday: { open: "09:00", close: "22:00" },
            sunday: { open: "10:00", close: "20:00" }
        },
        status: "active"
    }
];

async function seedStores() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/megagamers', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Clear existing stores (optional - remove if you want to keep existing)
        // await Store.deleteMany({});
        // console.log('🗑️  Cleared existing stores');

        // Insert stores
        for (let store of gamingStores) {
            const existingStore = await Store.findOne({ code: store.code });

            if (existingStore) {
                console.log(`⚠️  Store ${store.code} already exists - updating`);
                // Update existing store
                await Store.findOneAndUpdate(
                    { code: store.code },
                    store,
                    { upsert: true, new: true }
                );
            } else {
                // Create new store
                await Store.create(store);
                console.log(`✅ Created store: ${store.name} (${store.code})`);
            }
        }

        // Verify the data
        const storeCount = await Store.countDocuments();
        console.log(`\n📊 Total stores in database: ${storeCount}`);

        // List all stores
        const allStores = await Store.find({}).select('name code address.city address.street status -_id');
        console.log('\n🏪 List of stores:');
        allStores.forEach(store => {
            console.log(`   • ${store.name} (${store.code}) - ${store.address.street}, ${store.address.city} - ${store.status}`);
        });

        console.log('\n🎮 Gaming stores seeded successfully!');

    } catch (error) {
        console.error('❌ Error seeding stores:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Add command line arguments handling
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Store Seeder for Mega Gamers
============================

Usage: node scripts/seed-stores.js [options]

Options:
  --help, -h     Show this help message
  --force, -f    Force recreate all stores (delete existing)
  --list, -l     List existing stores
  --count        Show store count only

Examples:
  node scripts/seed-stores.js          # Seed stores (skip existing)
  node scripts/seed-stores.js --force  # Delete all and reseed
  node scripts/seed-stores.js --list   # List existing stores
  `);
    process.exit(0);
}

if (args.includes('--list') || args.includes('-l')) {
    (async () => {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/megagamers');
        const stores = await Store.find({}).select('name code address.city phone email status createdAt');
        console.log('\n🏪 Existing Stores:');
        stores.forEach((store, index) => {
            console.log(`\n${index + 1}. ${store.name} (${store.code})`);
            console.log(`   📍 ${store.address.city}`);
            console.log(`   📞 ${store.phone}`);
            console.log(`   📧 ${store.email}`);
            console.log(`   📊 Status: ${store.status}`);
            console.log(`   📅 Created: ${store.createdAt.toLocaleDateString()}`);
        });
        await mongoose.connection.close();
        process.exit(0);
    })();
} else if (args.includes('--count')) {
    (async () => {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/megagamers');
        const count = await Store.countDocuments();
        console.log(`Total stores: ${count}`);
        await mongoose.connection.close();
        process.exit(0);
    })();
} else {
    // Main seeding logic with force option
    if (args.includes('--force') || args.includes('-f')) {
        (async () => {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/megagamers');
            await Store.deleteMany({});
            console.log('🗑️  All stores deleted (force mode)');
            await mongoose.connection.close();
            seedStores();
        })();
    } else {
        seedStores();
    }
}