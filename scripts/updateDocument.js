import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import FurnitureItem from "../src/models/FurnitureItem.js";
import FurnitureSet from "../src/models/FurnitureSet.js";
import Room from "../src/models/Room.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URL = process.env.DB_URI;

// ==========================================
// CONFIGURATION - Edit these for your update
// ==========================================

// Target document - use ONE of these identifiers
const TARGET = {
  collection: "FurnitureItem",  // "FurnitureItem" | "FurnitureSet" | "Room"
  findBy: "code",               // "code" | "slug" | "name" | "_id"
  value: "LR-001",              // The value to search for
};

// Fields to update
// - Set a field to update/add it
// - Remove a field from this object to leave it unchanged
// - NOTE: Changing "name" will automatically update "slug" via model hooks
const UPDATE_FIELDS = {
  // name: "New Display Name",
  // description: "Updated description text",
  // price: 25000,
  // customField: "any value",
};

// ==========================================
// COLLECTION MAPPING
// ==========================================

const COLLECTIONS = {
  FurnitureItem: FurnitureItem,
  FurnitureSet: FurnitureSet,
  Room: Room,
};

// ==========================================
// UPDATE FUNCTION
// ==========================================

async function updateDocument() {
  console.log("🚀 Document Update Script\n");

  // Validate configuration
  if (!COLLECTIONS[TARGET.collection]) {
    console.error(`❌ Invalid collection: ${TARGET.collection}`);
    console.log("   Valid options: FurnitureItem, FurnitureSet, Room");
    process.exit(1);
  }

  if (Object.keys(UPDATE_FIELDS).length === 0) {
    console.error("❌ No fields to update. Add fields to UPDATE_FIELDS object.");
    process.exit(1);
  }

  console.log("Configuration:");
  console.log(`  Collection: ${TARGET.collection}`);
  console.log(`  Find by: ${TARGET.findBy} = "${TARGET.value}"`);
  console.log(`  Fields to update:`, UPDATE_FIELDS);

  // Connect to database
  console.log("\n📡 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected.\n");

  const Model = COLLECTIONS[TARGET.collection];

  // Build query
  const query = {};
  if (TARGET.findBy === "_id") {
    query._id = TARGET.value;
  } else {
    query[TARGET.findBy] = TARGET.value;
  }

  // Find the document
  const doc = await Model.findOne(query);

  if (!doc) {
    console.error(`❌ No document found in ${TARGET.collection} where ${TARGET.findBy} = "${TARGET.value}"`);
    await mongoose.connection.close();
    process.exit(1);
  }

  console.log("📄 Found document:");
  console.log(`   Name: ${doc.name}`);
  console.log(`   Slug: ${doc.slug}`);
  if (doc.code) console.log(`   Code: ${doc.code}`);
  console.log(`   _id: ${doc._id}`);

  // Show before/after for each field
  console.log("\n📝 Changes to apply:");
  console.log("-".repeat(50));

  for (const [field, newValue] of Object.entries(UPDATE_FIELDS)) {
    const oldValue = doc[field];
    console.log(`   ${field}:`);
    console.log(`     Before: ${JSON.stringify(oldValue)}`);
    console.log(`     After:  ${JSON.stringify(newValue)}`);

    // Apply the change
    doc[field] = newValue;
  }

  console.log("-".repeat(50));

  // Save the document (this triggers pre-validate hooks for slug)
  await doc.save();

  // Reload to show final state
  const updated = await Model.findById(doc._id);

  console.log("\n✅ Document updated successfully!");
  console.log("\n📄 Final document state:");
  console.log(`   Name: ${updated.name}`);
  console.log(`   Slug: ${updated.slug}`);
  if (updated.code) console.log(`   Code: ${updated.code}`);

  // Show updated fields
  for (const field of Object.keys(UPDATE_FIELDS)) {
    if (!["name", "slug", "code"].includes(field)) {
      console.log(`   ${field}: ${JSON.stringify(updated[field])}`);
    }
  }

  // Close connection
  await mongoose.connection.close();
  console.log("\n👋 Done.\n");
}

// Run the script
updateDocument().catch((err) => {
  console.error("❌ Error:", err);
  mongoose.connection.close();
  process.exit(1);
});
