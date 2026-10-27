#!/usr/bin/env node

// One-off migration: category names and slugs used to be unique across the
// whole platform, so a second business couldn't create e.g. "laptops". The
// model now makes them unique per business. This drops the old global
// indexes (name_1, slug_1) and builds the new per-business ones.
//
// Run once per environment:  node src/seeders/sync-category-indexes.js
// It fails without changing anything if a business already has two
// categories with the same name or slug; merge or rename those first.

const mongoose = require("mongoose");
const connectDb = require("../config/db.connection");
const Category = require("../products/models/category.model");

(async () => {
  try {
    await connectDb();

    const dbName = mongoose.connection.db?.databaseName;
    console.log(`📦 Connected to MongoDB: ${dbName}`);

    const before = (await Category.collection.indexes()).map((i) => i.name);
    console.log("Indexes before:", before.join(", "));

    const dropped = await Category.syncIndexes();
    console.log("Dropped:", dropped.length ? dropped.join(", ") : "none");

    const after = (await Category.collection.indexes()).map((i) => i.name);
    console.log("Indexes after:", after.join(", "));
  } catch (error) {
    console.error("❌ Failed to sync category indexes:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
})();
