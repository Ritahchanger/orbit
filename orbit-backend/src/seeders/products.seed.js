const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../products/products.model');

// Load environment variables
dotenv.config();

// Gaming products with realistic data
const gamingProducts = [
    {
        name: "ASUS ROG Strix G15 Gaming Laptop",
        sku: "GAM-LAP-001",
        category: "gaming-laptops",
        price: 125000,
        costPrice: 98000,
        stock: 15,
        minStock: 3,
        description: "Powerful gaming laptop with AMD Ryzen 9 processor, NVIDIA RTX 3060, 16GB RAM, 1TB SSD, 144Hz display. Perfect for gaming and streaming.",
        features: [
            "AMD Ryzen 9 5900HX Processor",
            "NVIDIA GeForce RTX 3060 6GB GDDR6",
            "16GB DDR4 RAM (Upgradable to 32GB)",
            "1TB NVMe SSD Storage",
            "15.6-inch Full HD IPS 144Hz Display",
            "RGB Backlit Keyboard",
            "Windows 11 Pro",
            "2-Year International Warranty"
        ],
        specifications: [
            "Processor: AMD Ryzen 9 5900HX (3.3GHz, up to 4.6GHz)",
            "Graphics: NVIDIA GeForce RTX 3060 6GB",
            "Memory: 16GB DDR4 3200MHz",
            "Storage: 1TB NVMe PCIe SSD",
            "Display: 15.6-inch FHD (1920x1080) 144Hz IPS",
            "OS: Windows 11 Pro",
            "Ports: USB-C, USB 3.2, HDMI, Ethernet",
            "Battery: 90Wh, up to 8 hours"
        ],
        weight: "2.3kg",
        dimensions: "36.0 x 25.9 x 2.3 cm",
        brand: "ASUS",
        warranty: "2 Years",
        tags: ["laptop", "gaming", "rtx3060", "portable", "rog"],
        images: [
            {
                displayUrl: "https://example.com/images/asus-rog-g15-1.jpg",
                gcsFileName: "asus-rog-g15-1.jpg",
                isPrimary: true
            },
            {
                displayUrl: "https://example.com/images/asus-rog-g15-2.jpg",
                gcsFileName: "asus-rog-g15-2.jpg",
                isPrimary: false
            }
        ],
        status: "In Stock",
        isFeatured: true,
        productType: "gaming",
        model: "G513QR",
        color: "Black",
        connectivity: "Wi-Fi 6, Bluetooth 5.2, Ethernet",
        powerConsumption: "230W Adapter"
    },
    {
        name: "Sony PlayStation 5 Console",
        sku: "GAM-CON-001",
        category: "consoles",
        price: 75000,
        costPrice: 62000,
        stock: 8,
        minStock: 2,
        description: "Next-gen gaming console with ultra-high speed SSD, ray tracing, 4K gaming at 120fps support. Includes DualSense wireless controller.",
        features: [
            "4K Gaming at 120fps",
            "Ray Tracing Support",
            "Ultra-High Speed SSD",
            "Backward Compatible with PS4 Games",
            "8K Output Ready",
            "Tempest 3D AudioTech",
            "DualSense Wireless Controller",
            "825GB SSD Storage"
        ],
        specifications: [
            "CPU: 8x Zen 2 Cores at 3.5GHz",
            "GPU: 10.28 TFLOPs, 36 CUs at 2.23GHz",
            "Memory: 16GB GDDR6",
            "Storage: 825GB Custom SSD",
            "Optical Drive: 4K UHD Blu-ray",
            "Video Out: HDMI 2.1",
            "Audio: Tempest 3D AudioTech",
            "Networking: Ethernet, Wi-Fi 6"
        ],
        weight: "4.5kg",
        dimensions: "39.0 x 10.4 x 26.0 cm",
        brand: "Sony",
        warranty: "1 Year",
        tags: ["console", "playstation", "ps5", "4k", "gaming"],
        images: [
            {
                displayUrl: "https://example.com/images/ps5-1.jpg",
                gcsFileName: "ps5-1.jpg",
                isPrimary: true
            }
        ],
        status: "In Stock",
        isFeatured: true,
        productType: "gaming",
        model: "CFI-1015A",
        color: "White/Black",
        connectivity: "Wi-Fi 6, Bluetooth 5.1, Ethernet, USB",
        powerConsumption: "350W"
    },
    {
        name: "Razer Huntsman Mini Gaming Keyboard",
        sku: "GAM-KEY-001",
        category: "mechanical-keyboards",
        price: 15000,
        costPrice: 11500,
        stock: 25,
        minStock: 5,
        description: "60% compact mechanical gaming keyboard with Razer Optical Switches, customizable RGB lighting, and aluminum frame.",
        features: [
            "Razer Optical Switches (Linear)",
            "60% Compact Form Factor",
            "Doubleshot PBT Keycaps",
            "Customizable RGB Chroma Lighting",
            "Aluminum Top Frame",
            "Onboard Memory for Profiles",
            "Detachable USB-C Cable",
            "Razer Synapse 3 Compatible"
        ],
        specifications: [
            "Switch Type: Razer Optical Linear",
            "Actuation Force: 40g",
            "Keycap Material: Doubleshot PBT",
            "Lighting: Razer Chroma RGB",
            "Connectivity: USB-C Detachable",
            "Polling Rate: 1000Hz",
            "Dimensions: 29.5 x 10.3 x 3.9 cm",
            "Weight: 0.6kg"
        ],
        weight: "0.6kg",
        dimensions: "29.5 x 10.3 x 3.9 cm",
        brand: "Razer",
        warranty: "2 Years",
        tags: ["keyboard", "mechanical", "rgb", "compact", "gaming"],
        images: [
            {
                displayUrl: "https://example.com/images/razer-keyboard-1.jpg",
                gcsFileName: "razer-keyboard-1.jpg",
                isPrimary: true
            }
        ],
        status: "In Stock",
        isFeatured: false,
        productType: "gaming",
        model: "RZ03-0358",
        color: "Black",
        connectivity: "USB-C",
        powerConsumption: "USB powered"
    },
    {
        name: "Logitech G Pro X Wireless Gaming Headset",
        sku: "GAM-HEA-001",
        category: "gaming-headsets",
        price: 18500,
        costPrice: 14500,
        stock: 18,
        minStock: 4,
        description: "Professional-grade wireless gaming headset with Blue VO!CE microphone technology, PRO-G 50mm drivers, and DTS Headphone:X 2.0 surround sound.",
        features: [
            "LIGHTSPEED Wireless Technology",
            "Blue VO!CE Microphone Technology",
            "PRO-G 50mm Drivers",
            "DTS Headphone:X 2.0 Surround Sound",
            "20+ Hour Battery Life",
            "Memory Foam Earpads",
            "Detachable Microphone",
            "Compatible with PC, PS4, PS5"
        ],
        specifications: [
            "Driver: 50mm PRO-G",
            "Frequency Response: 20Hz-20kHz",
            "Impedance: 35 Ohms",
            "Microphone: Cardioid (Blue VO!CE)",
            "Wireless Range: Up to 15m",
            "Battery: 20+ hours",
            "Weight: 350g",
            "Connectivity: USB Wireless, 3.5mm"
        ],
        weight: "350g",
        dimensions: "19.0 x 17.0 x 9.0 cm",
        brand: "Logitech",
        warranty: "2 Years",
        tags: ["headset", "wireless", "gaming", "audio", "pro"],
        images: [
            {
                displayUrl: "https://example.com/images/logitech-headset-1.jpg",
                gcsFileName: "logitech-headset-1.jpg",
                isPrimary: true
            }
        ],
        status: "In Stock",
        isFeatured: true,
        productType: "gaming",
        model: "981-000809",
        color: "Black",
        connectivity: "Wireless USB, 3.5mm",
        powerConsumption: "USB charging"
    },
    {
        name: "Secretlab Titan EVO Gaming Chair",
        sku: "GAM-CHA-001",
        category: "gaming-chairs",
        price: 45000,
        costPrice: 35000,
        stock: 6,
        minStock: 2,
        description: "Premium gaming chair with 4D armrests, magnetic memory foam pillows, multi-tilt mechanism, and premium cold-cure foam for maximum comfort.",
        features: [
            "Magnetic Memory Foam Pillows",
            "4D Armrests (Up/Down, Forward/Back, Left/Right, Pivot)",
            "Multi-Tilt Mechanism (85°-165°)",
            "Premium Cold-Cure Foam",
            "Class-4 Hydraulic Gas Lift",
            "Steel Reinforced Frame",
            "5-Year Warranty",
            "NEO Hybrid Leatherette"
        ],
        specifications: [
            "Material: NEO Hybrid Leatherette",
            "Frame: Steel Reinforced",
            "Base: Aluminum Alloy",
            "Gas Lift: Class-4 Hydraulic",
            "Weight Capacity: 130kg",
            "Recline: 85° to 165°",
            "Armrests: 4D Adjustable",
            "Warranty: 5 Years"
        ],
        weight: "33kg",
        dimensions: "75.0 x 67.0 x 135.0 cm",
        brand: "Secretlab",
        warranty: "5 Years",
        tags: ["chair", "gaming", "ergonomic", "premium", "office"],
        images: [
            {
                displayUrl: "https://example.com/images/secretlab-chair-1.jpg",
                gcsFileName: "secretlab-chair-1.jpg",
                isPrimary: true
            }
        ],
        status: "In Stock",
        isFeatured: true,
        productType: "gaming",
        model: "Titan EVO 2022",
        color: "Charcoal Blue",
        connectivity: "N/A",
        powerConsumption: "N/A"
    },
    {
        name: "Samsung Odyssey G7 Gaming Monitor",
        sku: "GAM-MON-001",
        category: "gaming-monitors",
        price: 65000,
        costPrice: 52000,
        stock: 12,
        minStock: 3,
        description: "32-inch QHD gaming monitor with 240Hz refresh rate, 1ms response time, Quantum Dot technology, and 1000R curved screen for immersive gaming.",
        features: [
            "32-inch QHD (2560x1440) Display",
            "240Hz Refresh Rate",
            "1ms Response Time (GtG)",
            "1000R Curved Screen",
            "Quantum Dot Technology",
            "G-Sync and FreeSync Premium Pro",
            "HDR600 Certified",
            "Infinity Core Lighting"
        ],
        specifications: [
            "Screen Size: 32-inch",
            "Resolution: 2560 x 1440 (QHD)",
            "Panel: VA, 1000R Curved",
            "Refresh Rate: 240Hz",
            "Response Time: 1ms GtG",
            "Brightness: 600 cd/m²",
            "Contrast: 2500:1",
            "Ports: HDMI, DisplayPort, USB"
        ],
        weight: "7.7kg",
        dimensions: "71.5 x 47.5 x 27.5 cm",
        brand: "Samsung",
        warranty: "3 Years",
        tags: ["monitor", "gaming", "curved", "240hz", "qhd"],
        images: [
            {
                displayUrl: "https://example.com/images/samsung-monitor-1.jpg",
                gcsFileName: "samsung-monitor-1.jpg",
                isPrimary: true
            }
        ],
        status: "In Stock",
        isFeatured: false,
        productType: "gaming",
        model: "LC32G75TQSNXZA",
        color: "Black",
        connectivity: "HDMI 2.0, DisplayPort 1.4, USB",
        powerConsumption: "65W"
    },
    {
        name: "Elgato Stream Deck MK.2",
        sku: "GAM-STR-001",
        category: "streaming-gear",
        price: 12000,
        costPrice: 9500,
        stock: 20,
        minStock: 4,
        description: "15-key customizable streaming controller with LCD keys for controlling apps, tools, and platforms during live streams and content creation.",
        features: [
            "15 Customizable LCD Keys",
            "Multi-Action Support",
            "Plugin and Integration Support",
            "Adjustable Stand Included",
            "Stream Deck Software",
            "Works with OBS, Twitch, YouTube",
            "USB-C Connectivity",
            "Compact and Portable"
        ],
        specifications: [
            "Keys: 15 Customizable LCD",
            "Display: LCD (128x128 per key)",
            "Connectivity: USB-C",
            "Software: Stream Deck 5.0+",
            "Dimensions: 11.8 x 8.4 x 3.4 cm",
            "Weight: 350g",
            "OS: Windows 10+, macOS 10.15+",
            "Plugins: 100+ Available"
        ],
        weight: "350g",
        dimensions: "11.8 x 8.4 x 3.4 cm",
        brand: "Elgato",
        warranty: "2 Years",
        tags: ["streaming", "controller", "content", "creator", "tools"],
        images: [
            {
                displayUrl: "https://example.com/images/elgato-streamdeck-1.jpg",
                gcsFileName: "elgato-streamdeck-1.jpg",
                isPrimary: true
            }
        ],
        status: "In Stock",
        isFeatured: false,
        productType: "gaming",
        model: "20GAA9901",
        color: "Black",
        connectivity: "USB-C",
        powerConsumption: "USB powered"
    },
    {
        name: "NVIDIA GeForce RTX 4070 Ti GPU",
        sku: "GAM-PC-001",
        category: "gaming-pcs",
        price: 115000,
        costPrice: 92000,
        stock: 7,
        minStock: 2,
        description: "High-performance graphics card with 12GB GDDR6X memory, DLSS 3 technology, ray tracing cores, and AI acceleration for 4K gaming.",
        features: [
            "NVIDIA Ada Lovelace Architecture",
            "12GB GDDR6X Memory",
            "7680 CUDA Cores",
            "DLSS 3 Technology",
            "3rd Gen Ray Tracing Cores",
            "4th Gen Tensor Cores",
            "AV1 Encoder",
            "PCI Express 4.0 Support"
        ],
        specifications: [
            "GPU: NVIDIA GeForce RTX 4070 Ti",
            "Memory: 12GB GDDR6X",
            "Memory Interface: 192-bit",
            "CUDA Cores: 7680",
            "Boost Clock: 2610 MHz",
            "Power: 285W",
            "Recommended PSU: 700W",
            "Outputs: 3x DisplayPort, 1x HDMI"
        ],
        weight: "1.8kg",
        dimensions: "30.0 x 13.0 x 6.0 cm",
        brand: "NVIDIA",
        warranty: "3 Years",
        tags: ["gpu", "graphics", "rtx", "pc", "gaming"],
        images: [
            {
                displayUrl: "https://example.com/images/nvidia-4070ti-1.jpg",
                gcsFileName: "nvidia-4070ti-1.jpg",
                isPrimary: true
            }
        ],
        status: "Low Stock",
        isFeatured: true,
        productType: "gaming",
        model: "RTX 4070 Ti",
        color: "Black/Silver",
        connectivity: "PCIe 4.0 x16",
        powerConsumption: "285W"
    },
    {
        name: "SteelSeries Aerox 5 Wireless Gaming Mouse",
        sku: "GAM-MOU-001",
        category: "gaming-mice",
        price: 8500,
        costPrice: 6500,
        stock: 22,
        minStock: 5,
        description: "Ultra-lightweight wireless gaming mouse with 9 programmable buttons, Quantum 2.0 Wireless, TrueMove Air sensor, and 200+ hour battery life.",
        features: [
            "Ultra-Lightweight (74g)",
            "Quantum 2.0 Wireless (2.4GHz & Bluetooth)",
            "TrueMove Air Sensor (18,000 CPI)",
            "9 Programmable Buttons",
            "200+ Hour Battery Life",
            "IP54 Water & Dust Resistant",
            "Gold-Plated Micro Switches",
            "Onboard Memory Profiles"
        ],
        specifications: [
            "Sensor: TrueMove Air Optical",
            "CPI: 100-18,000",
            "IPS: 400+",
            "Acceleration: 40G",
            "Buttons: 9 Programmable",
            "Weight: 74g",
            "Battery: 200+ hours",
            "Connectivity: 2.4GHz, Bluetooth 5.0"
        ],
        weight: "74g",
        dimensions: "12.7 x 6.8 x 4.0 cm",
        brand: "SteelSeries",
        warranty: "2 Years",
        tags: ["mouse", "wireless", "gaming", "lightweight", "rgb"],
        images: [
            {
                displayUrl: "https://example.com/images/steelseries-mouse-1.jpg",
                gcsFileName: "steelseries-mouse-1.jpg",
                isPrimary: true
            }
        ],
        status: "In Stock",
        isFeatured: false,
        productType: "gaming",
        model: "62551",
        color: "Ghost",
        connectivity: "2.4GHz Wireless, Bluetooth",
        powerConsumption: "USB charging"
    },
    {
        name: "Seagate FireCuda 530 SSD 2TB",
        sku: "GAM-STR-002",
        category: "storage",
        price: 28000,
        costPrice: 22500,
        stock: 14,
        minStock: 4,
        description: "High-performance NVMe PCIe Gen4 SSD with speeds up to 7300MB/s, optimized for gaming, content creation, and high-end workstations.",
        features: [
            "PCIe Gen4 x4 NVMe 1.4",
            "Read Speeds up to 7300MB/s",
            "Write Speeds up to 6900MB/s",
            "2TB Capacity",
            "3D TLC NAND",
            "Included Heatsink",
            "5-Year Warranty",
            "Rescue Data Recovery Services"
        ],
        specifications: [
            "Capacity: 2TB",
            "Interface: PCIe Gen4 x4, NVMe 1.4",
            "Sequential Read: 7300 MB/s",
            "Sequential Write: 6900 MB/s",
            "Random Read: 1,000K IOPS",
            "Random Write: 1,000K IOPS",
            "Endurance: 2550 TBW",
            "Warranty: 5 Years"
        ],
        weight: "0.1kg",
        dimensions: "8.0 x 2.2 x 0.2 cm",
        brand: "Seagate",
        warranty: "5 Years",
        tags: ["ssd", "storage", "nvme", "gaming", "fast"],
        images: [
            {
                displayUrl: "https://example.com/images/seagate-ssd-1.jpg",
                gcsFileName: "seagate-ssd-1.jpg",
                isPrimary: true
            }
        ],
        status: "In Stock",
        isFeatured: false,
        productType: "gaming",
        model: "ZP2000GM3A013",
        color: "Black/Silver",
        connectivity: "M.2 2280",
        powerConsumption: "8.25W"
    }
];

async function seedProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/megagamers', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Insert products
        let created = 0;
        let updated = 0;

        for (let productData of gamingProducts) {
            const existingProduct = await Product.findOne({ sku: productData.sku });

            if (existingProduct) {
                console.log(`⚠️  Product ${productData.sku} already exists - updating`);
                await Product.findOneAndUpdate(
                    { sku: productData.sku },
                    productData,
                    { upsert: true, new: true, runValidators: true }
                );
                updated++;
            } else {
                // Create new product
                await Product.create(productData);
                console.log(`✅ Created product: ${productData.name} (${productData.sku})`);
                created++;
            }
        }

        // Verify the data
        const productCount = await Product.countDocuments();
        const gamingCount = await Product.countDocuments({ productType: "gaming" });
        const featuredCount = await Product.countDocuments({ isFeatured: true });
        const lowStockCount = await Product.countDocuments({ status: "Low Stock" });

        console.log(`\n📊 Product Statistics:`);
        console.log(`   Total products in database: ${productCount}`);
        console.log(`   Gaming products: ${gamingCount}`);
        console.log(`   Featured products: ${featuredCount}`);
        console.log(`   Low stock products: ${lowStockCount}`);
        console.log(`   Created: ${created}, Updated: ${updated}`);

        // List all products with basic info
        console.log('\n🛍️  List of products:');
        const allProducts = await Product.find({}).select('name sku category price stock status -_id');
        allProducts.forEach(product => {
            const stockStatus = product.stock === 0 ? '🔴' : product.stock <= product.minStock ? '🟡' : '🟢';
            console.log(`   ${stockStatus} ${product.name} (${product.sku}) - KSh ${product.price.toLocaleString()} - Stock: ${product.stock}`);
        });

        console.log('\n🎮 Gaming products seeded successfully!');

    } catch (error) {
        console.error('❌ Error seeding products:', error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`   - ${key}: ${error.errors[key].message}`);
            });
        }
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
Product Seeder for Mega Gamers
==============================

Usage: node scripts/seed-products.js [options]

Options:
  --help, -h     Show this help message
  --force, -f    Force recreate all products (delete existing)
  --list, -l     List existing products
  --stats        Show product statistics only
  --low-stock    Show low stock products only

Examples:
  node scripts/seed-products.js          # Seed products (skip existing)
  node scripts/seed-products.js --force  # Delete all and reseed
  node scripts/seed-products.js --list   # List existing products
  node scripts/seed-products.js --stats  # Show statistics
  node scripts/seed-products.js --low-stock  # Show low stock products
  `);
    process.exit(0);
}

if (args.includes('--list') || args.includes('-l')) {
    (async () => {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/megagamers');
        const products = await Product.find({}).select('name sku category price costPrice stock minStock status isFeatured');
        console.log('\n🛍️  Existing Products:');
        products.forEach((product, index) => {
            const profit = product.price - product.costPrice;
            const profitMargin = ((profit / product.costPrice) * 100).toFixed(1);
            const stockIcon = product.stock === 0 ? '🔴' : product.stock <= product.minStock ? '🟡' : '🟢';
            console.log(`\n${index + 1}. ${product.name} (${product.sku})`);
            console.log(`   Category: ${product.category}`);
            console.log(`   Price: KSh ${product.price.toLocaleString()} | Cost: KSh ${product.costPrice.toLocaleString()}`);
            console.log(`   Profit: KSh ${profit.toLocaleString()} (${profitMargin}%)`);
            console.log(`   Stock: ${stockIcon} ${product.stock} units (Min: ${product.minStock})`);
            console.log(`   Status: ${product.status} ${product.isFeatured ? '⭐ Featured' : ''}`);
        });
        await mongoose.connection.close();
        process.exit(0);
    })();
} else if (args.includes('--stats')) {
    (async () => {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/megagamers');
        const total = await Product.countDocuments();
        const gaming = await Product.countDocuments({ productType: "gaming" });
        const featured = await Product.countDocuments({ isFeatured: true });
        const lowStock = await Product.countDocuments({ status: "Low Stock" });
        const outOfStock = await Product.countDocuments({ status: "Out of Stock" });

        // Calculate total inventory value
        const products = await Product.find({});
        let totalInventoryValue = 0;
        let totalPotentialRevenue = 0;

        products.forEach(product => {
            totalInventoryValue += product.costPrice * product.stock;
            totalPotentialRevenue += product.price * product.stock;
        });

        console.log('\n📊 Product Statistics:');
        console.log(`   Total Products: ${total}`);
        console.log(`   Gaming Products: ${gaming}`);
        console.log(`   Featured Products: ${featured}`);
        console.log(`   Low Stock Products: ${lowStock}`);
        console.log(`   Out of Stock Products: ${outOfStock}`);
        console.log(`   Total Inventory Value: KSh ${totalInventoryValue.toLocaleString()}`);
        console.log(`   Total Potential Revenue: KSh ${totalPotentialRevenue.toLocaleString()}`);
        console.log(`   Potential Profit: KSh ${(totalPotentialRevenue - totalInventoryValue).toLocaleString()}`);

        await mongoose.connection.close();
        process.exit(0);
    })();
} else if (args.includes('--low-stock')) {
    (async () => {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/megagamers');
        const lowStockProducts = await Product.find({
            $expr: { $lte: ["$stock", "$minStock"] }
        }).select('name sku stock minStock category');

        console.log('\n⚠️  Low Stock Products:');
        if (lowStockProducts.length === 0) {
            console.log('   ✅ No low stock products!');
        } else {
            lowStockProducts.forEach((product, index) => {
                console.log(`\n${index + 1}. ${product.name} (${product.sku})`);
                console.log(`   Category: ${product.category}`);
                console.log(`   Current Stock: ${product.stock} units`);
                console.log(`   Minimum Stock: ${product.minStock} units`);
                console.log(`   Need to order: ${product.minStock - product.stock} units`);
            });
        }

        await mongoose.connection.close();
        process.exit(0);
    })();
} else {
    // Main seeding logic with force option
    if (args.includes('--force') || args.includes('-f')) {
        (async () => {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/megagamers');
            await Product.deleteMany({});
            console.log('🗑️  All products deleted (force mode)');
            await mongoose.connection.close();
            seedProducts();
        })();
    } else {
        seedProducts();
    }
}