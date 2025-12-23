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
// CONFIGURATION - Edit these to control seeding
// ==========================================
const CONFIG = {
  rooms: {
    livingRoom: true,     // Set to false to skip
    diningRoom: false,    // Enable when data is ready
    bedroom: false,       // Enable when data is ready
    office: false,        // Enable when data is ready
    showpieces: false,    // Enable when data is ready
  },
  seedRoomDocuments: true, // Set to true to also seed/update Room collection
};

// ==========================================
// ROOM DATA STRUCTURES
// Each room follows the same pattern as living room
// ==========================================

const roomData = {
  // ─────────────────────────────────────────
  // LIVING ROOM
  // ─────────────────────────────────────────
  livingRoom: {
    roomName: "Living Room",
    folderName: "living-room",
    hasIndividualItems: true,
    styles: {
      royal: {
        styleCode: "LR",
        styleName: "Royal",
        sets: [
          { code: "LR-01", name: "Classic Leather Loveseat" },
          { code: "LR-02", name: "Light Tufted Chesterfield" },
          { code: "LR-03", name: "Minimalist Floating Sofa" },
          { code: "LR-04", name: "Regal Gold Carved" },
          { code: "LR-05", name: "Sleek Gray Sectional" },
          { code: "LR-06", name: "Tufted Chaise Lounge" },
          { code: "LR-07", name: "Velvet Button Settee" },
        ],
        items: {
          Chair: [
            { code: "LR-001", name: "Baroque Gilded Throne" },
            { code: "LR-002", name: "French Floral Fauteuil" },
            { code: "LR-003", name: "Gilded Velvet Cabriole" },
            { code: "LR-004", name: "Ornate Gold Damask" },
            { code: "LR-005", name: "Rococo Cane Chair" },
          ],
          Sofa: [
            { code: "LR-006", name: "Baroque Leather Chesterfield" },
            { code: "LR-007", name: "Bold Patina Armchair" },
            { code: "LR-008", name: "Classic Cognac Tufted" },
            { code: "LR-009", name: "Distressed Club Sofa" },
            { code: "LR-010", name: "Gilded Neoclassic Settee" },
            { code: "LR-011", name: "Ornate Damask Traditional" },
            { code: "LR-012", name: "Regal Black Velvet" },
            { code: "LR-013", name: "Tufted Empire Lounge" },
          ],
          Table: [
            { code: "LR-014", name: "Carved Marble Glass" },
            { code: "LR-015", name: "Emerald Baroque Console" },
            { code: "LR-016", name: "Grand Marble Console" },
            { code: "LR-017", name: "Imperial Gold Cabriole" },
            { code: "LR-018", name: "Marquetry Rococo Square" },
            { code: "LR-019", name: "Ornate Pedestal Entry" },
            { code: "LR-020", name: "Square Gilded Mirror" },
          ],
        },
      },
      traditional: {
        styleCode: "LT",
        styleName: "Traditional",
        sets: [
          { code: "LT-01", name: "Burgundy Tufted Settee" },
          { code: "LT-02", name: "Classic Linen Roll" },
          { code: "LT-03", name: "Formal Scroll Arm" },
          { code: "LT-04", name: "Sleek Chaise Lounge" },
        ],
        items: {
          Chair: [
            { code: "LT-001", name: "Aged Leather Club" },
            { code: "LT-002", name: "Baroque Gold Accent" },
            { code: "LT-003", name: "Classic Cognac Tufted1" },
            { code: "LT-004", name: "Classic Roll Arm" },
            { code: "LT-005", name: "French Cane Bergère" },
            { code: "LT-006", name: "Louis Oval Back" },
            { code: "LT-007", name: "Rococo Rose Tapestry" },
            { code: "LT-008", name: "Sleek Velvet Transitional" },
            { code: "LT-009", name: "Tropical Woven Accent" },
            { code: "LT-010", name: "Victorian Shell Back" },
          ],
          Sofa: [
            { code: "LT-011", name: "Contemporary Panel Sofa" },
            { code: "LT-012", name: "Grand Formal Scroll" },
            { code: "LT-013", name: "Modern Cigar Chesterfield" },
            { code: "LT-014", name: "Neoclassic Tufted Trim" },
            { code: "LT-015", name: "Sleek Gray Modular" },
            { code: "LT-016", name: "Traditional Carved Frame" },
          ],
          Table: [
            { code: "LT-017", name: "Clean White Modular" },
            { code: "LT-018", name: "Geometric Gold Glass" },
            { code: "LT-019", name: "Industrial Metal Grid" },
            { code: "LT-020", name: "Leather Inset Walnut" },
            { code: "LT-021", name: "Marble Drum Accent" },
            { code: "LT-022", name: "Modern Oval Leg" },
            { code: "LT-023", name: "Rococo Gilded Glass" },
            { code: "LT-024", name: "Vintage Storage Rectangle" },
          ],
        },
      },
      modern: {
        styleCode: "LM",
        styleName: "Modern",
        sets: [
          { code: "LM-01", name: "Crimson Accent Sofa" },
          { code: "LM-02", name: "Mid-Century Forest Sofa" },
          { code: "LM-03", name: "Velvet Modern Transitional" },
        ],
        items: {
          Chair: [
            { code: "LM-001", name: "Classic Carved Arm" },
            { code: "LM-002", name: "Elegant Tall Back" },
            { code: "LM-003", name: "Formal Estate Chair" },
            { code: "LM-004", name: "Leather Nailhead Club" },
            { code: "LM-005", name: "Modern Cognac Frame" },
            { code: "LM-006", name: "Natural Wood Lounge" },
          ],
          Sofa: [
            { code: "LM-007", name: "Classic Tufted Settee" },
            { code: "LM-008", name: "Cozy Velvet Lounge" },
            { code: "LM-009", name: "Glamorous Tufted Sofa" },
            { code: "LM-010", name: "Modern Panel Sofa" },
            { code: "LM-011", name: "Regal Tufted Chesterfield" },
          ],
          Table: [
            { code: "LM-012", name: "Curved Open Shelf" },
            { code: "LM-013", name: "Elevated Open Storage" },
            { code: "LM-014", name: "Floating Modern Walnut" },
            { code: "LM-015", name: "Geometric Inlay Storage" },
            { code: "LM-016", name: "Industrial Metal Leg" },
            { code: "LM-017", name: "Nordic Storage Rectangle" },
            { code: "LM-018", name: "Rounded Base Cabinet" },
            { code: "LM-019", name: "Squared Drawer Design" },
          ],
        },
      },
    },
  },

  // ─────────────────────────────────────────
  // DINING ROOM - Add data when ready
  // ─────────────────────────────────────────
  diningRoom: {
    roomName: "Dining Room",
    folderName: "dining-room",
    hasIndividualItems: false, // Dining room has sets only
    styles: {
      // Add styles here when ready, following the same pattern
    },
  },

  // ─────────────────────────────────────────
  // BEDROOM - Add data when ready
  // ─────────────────────────────────────────
  bedroom: {
    roomName: "Bedroom",
    folderName: "bedroom",
    hasIndividualItems: true,
    styles: {
      // Add styles here when ready
      // Items would be: Side Table, Bench
    },
  },

  // ─────────────────────────────────────────
  // OFFICE - Add data when ready
  // ─────────────────────────────────────────
  office: {
    roomName: "Office",
    folderName: "office",
    hasIndividualItems: true,
    styles: {
      // Add styles here when ready
      // Items would be: Boss Chair, Visitor Chair, Visitor Sofa
    },
  },

  // ─────────────────────────────────────────
  // SHOWPIECES - Add data when ready
  // ─────────────────────────────────────────
  showpieces: {
    roomName: "Showpieces",
    folderName: "showpieces",
    hasIndividualItems: true,
    styles: {
      // Add styles here when ready
      // Items would be: Console, Cabinet
    },
  },
};

// ==========================================
// SEEDING FUNCTIONS
// ==========================================

/**
 * Seed a single room's data (items + sets)
 */
async function seedRoom(roomKey, roomConfig) {
  const { roomName, styles, hasIndividualItems } = roomConfig;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📦 Seeding: ${roomName}`);
  console.log("=".repeat(60));

  // Delete existing data for this room
  const deletedItems = await FurnitureItem.deleteMany({ room: roomName });
  const deletedSets = await FurnitureSet.deleteMany({ room: roomName });
  console.log(`🗑️  Cleared ${deletedItems.deletedCount} items, ${deletedSets.deletedCount} sets`);

  let totalItems = 0;
  let totalSets = 0;

  // Process each style
  for (const [styleKey, styleData] of Object.entries(styles)) {
    console.log(`\n  📂 Style: ${styleData.styleName} (${styleData.styleCode})`);

    // Seed Items
    if (hasIndividualItems && styleData.items) {
      for (const [type, items] of Object.entries(styleData.items)) {
        for (const item of items) {
          const itemDoc = new FurnitureItem({
            room: roomName,
            type: type,
            style: styleData.styleName,
            name: item.name,
            code: item.code,
            images: [],
            description: `${item.name} - ${styleData.styleName} style ${type} for the ${roomName}.`,
          });

          await itemDoc.save();
          totalItems++;
        }
        console.log(`     ✔ ${type}: ${items.length} items`);
      }
    }

    // Seed Sets
    if (styleData.sets && styleData.sets.length > 0) {
      for (const set of styleData.sets) {
        const setDoc = new FurnitureSet({
          room: roomName,
          style: styleData.styleName,
          name: set.name,
          code: set.code,
          items: [],
          images: [],
          description: `${set.name} - ${styleData.styleName} style set for the ${roomName}.`,
        });

        await setDoc.save();
        totalSets++;
      }
      console.log(`     ✔ Sets: ${styleData.sets.length} sets`);
    }
  }

  console.log(`\n  📊 Total: ${totalItems} items, ${totalSets} sets`);
  return { items: totalItems, sets: totalSets };
}

/**
 * Seed Room documents (the Room collection itself)
 */
async function seedRoomDocuments() {
  console.log(`\n${"=".repeat(60)}`);
  console.log("📦 Seeding Room Documents");
  console.log("=".repeat(60));

  // Clear existing rooms
  await Room.deleteMany({});
  console.log("🗑️  Cleared existing Room documents");

  const roomsToCreate = [
    { name: "Living Room", hasIndividualItems: true },
    { name: "Dining Room", hasIndividualItems: false },
    { name: "Bedroom", hasIndividualItems: true },
    { name: "Office", hasIndividualItems: true },
    { name: "Showpieces", hasIndividualItems: true },
  ];

  for (const roomInfo of roomsToCreate) {
    const roomDoc = new Room({
      name: roomInfo.name,
      hasIndividualItems: roomInfo.hasIndividualItems,
      images: [],
      description: `${roomInfo.name} furniture collection.`,
    });
    await roomDoc.save();
    console.log(`  ✔ Created: ${roomInfo.name}`);
  }

  console.log(`\n  📊 Total: ${roomsToCreate.length} rooms`);
}

/**
 * Main seeding function
 */
async function seedAllData() {
  console.log("🚀 Starting Data Seeding Process...\n");
  console.log("Configuration:");
  console.log(JSON.stringify(CONFIG, null, 2));

  // Connect to database
  console.log("\n📡 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected.\n");

  let grandTotalItems = 0;
  let grandTotalSets = 0;

  // Seed Room documents if enabled
  if (CONFIG.seedRoomDocuments) {
    await seedRoomDocuments();
  }

  // Process each enabled room
  for (const [roomKey, enabled] of Object.entries(CONFIG.rooms)) {
    if (!enabled) {
      console.log(`\n⏭️  Skipping: ${roomKey} (disabled in config)`);
      continue;
    }

    const roomConfig = roomData[roomKey];
    if (!roomConfig) {
      console.log(`\n⚠️  No data found for: ${roomKey}`);
      continue;
    }

    // Check if room has actual style data
    if (Object.keys(roomConfig.styles).length === 0) {
      console.log(`\n⚠️  ${roomConfig.roomName}: No styles defined yet, skipping`);
      continue;
    }

    const { items, sets } = await seedRoom(roomKey, roomConfig);
    grandTotalItems += items;
    grandTotalSets += sets;
  }

  // Summary
  console.log("\n\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(60));
  console.log(`✔ Total Items Created: ${grandTotalItems}`);
  console.log(`✔ Total Sets Created: ${grandTotalSets}`);

  // Close connection
  await mongoose.connection.close();
  console.log("\n✅ Data seeding complete! 🎉\n");
}

// Run the script
seedAllData().catch((err) => {
  console.error("❌ Error during seeding:", err);
  mongoose.connection.close();
  process.exit(1);
});
