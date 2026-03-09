#!/usr/bin/env node

const mongoose = require("mongoose");
const connectDb = require("../config/db.connection");
const Category = require("../products/model/category.model");

const categories = [
  "gaming-pcs",
  "gaming-laptops",
  "consoles",
  "gaming-monitors",
  "gaming-headsets",
  "mechanical-keyboards",
  "gaming-mice",
  "games",
  "gaming-chairs",
  "streaming-gear",
  "storage",
  "memory",
  "cables",
  "routers",
  "servers",
  "Wiring & Cables",
  "Switches & Sockets",
  "Lighting Solutions",
  "Ventilation Systems",
  "gaming-speakers",
  "cameras",
  "Energy Management",
  "Security Systems",
  "Automation",
  "Solar Products",
];

const seedCategories = async () => {
  try {
    console.log("🌱 Seeding categories...");

    for (const categoryName of categories) {
      const slug = categoryName
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/&/g, "and");

      const exists = await Category.findOne({ name: categoryName });

      if (!exists) {
        await Category.create({
          name: categoryName,
          slug: slug,
          description: `${categoryName} products`,
        });

        console.log(`✅ Added: ${categoryName}`);
      } else {
        console.log(`⚠️ Already exists: ${categoryName}`);
      }
    }

    console.log("🎉 Categories seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
  }
};

(async () => {
  try {
    await connectDb();

    const dbName = mongoose.connection.db?.databaseName;
    console.log(`📦 Connected to MongoDB: ${dbName}`);

    await seedCategories();

    await mongoose.connection.close();
    console.log("🔌 Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("💥 Seeder failed:", error.message);
    process.exit(1);
  }
})();
