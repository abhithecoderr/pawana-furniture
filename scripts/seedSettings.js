import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import SiteSettings from "../src/models/SiteSettings.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URL = process.env.DB_URI;

// ==========================================
// INITIAL SETTINGS DATA
// Extracted from current hardcoded values
// ==========================================

const initialSettings = {
  home: {
    hero: {
      tagline: "Only The Finest Furniture",
      badges: ["Workshop In Rajpura", "Since 1980"],
      stats: [
        { number: "45+", label: "Years Crafting" },
        { number: "200+", label: "Trusted Customers" },
        { number: "100%", label: "Handmade" }
      ]
    },
    featuredCodes: {
      // Signature Pieces carousel
      signatureItems: [
        "LR-04", "BR-28", "DR-05", "SM-039", "LR-06", "LR-008",
        "BR-23", "LR-012", "ST-053", "BR-21", "SR-039", "DR-17",
        "DR-03", "SR-024", "SR-066"
      ],
      // Featured Items carousel
      featuredItems: [
        "LM-011", "ST-011", "LR-011", "LM-018", "SR-060", "LR-004",
        "ST-051", "LT-010", "LR-010", "SR-062", "LT-008", "SR-085"
      ],
      // Featured Sets carousel
      featuredSets: [
        "OT-02", "LR-01", "BT-27", "DM-01", "OT-08",
        "BR-06", "BT-13", "DM-09", "LR-02", "DR-06"
      ]
    },
    browseByRoomCodes: {
      'Living Room': 'LT-04',
      'Dining Room': 'DR-04',
      'Bedroom': 'BR-09',
      'Office': 'OT-02',
      'Showpieces': 'SR-044'
    }
  },
  contact: {
    phone1: "+91 8360550271",
    phone2: "+91 6239811718",
    whatsappEnquiry: "918360550271",
    email: "pawanafurniture07@gmail.com",
    formEmail: "pawanafurniture07@gmail.com",
    address: {
      line1: "Pawana Furniture by Pawan Kumar",
      line2: "Liberty Chowk, Rajpura",
      line3: "Patiala Road, NH 7, Punjab 140401",
      country: "India"
    },
    businessHours: {
      weekday: "M-S: 8:00 AM - 7:30 PM",
      weekend: "Sunday: 8:00 AM - 6:30 PM"
    }
  }
};

// ==========================================
// SEED FUNCTION
// ==========================================

async function seedSettings() {
  console.log("🚀 Starting Site Settings Seeding...\n");

  // Connect to database
  console.log("📡 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected.\n");

  try {
    // Clear existing settings
    await SiteSettings.deleteMany({});
    console.log("🗑️  Cleared existing settings");

    // Create new settings document
    const settings = await SiteSettings.create(initialSettings);
    console.log("✅ Site settings created successfully!\n");

    // Display created settings
    console.log("📋 Settings Summary:");
    console.log("─".repeat(50));
    console.log(`   Hero Tagline: ${settings.home.hero.tagline}`);
    console.log(`   Hero Badges: ${settings.home.hero.badges.join(", ")}`);
    console.log(`   Hero Stats: ${settings.home.hero.stats.length} items`);
    console.log(`   Signature Items: ${settings.home.featuredCodes.signatureItems.length} codes`);
    console.log(`   Featured Items: ${settings.home.featuredCodes.featuredItems.length} codes`);
    console.log(`   Featured Sets: ${settings.home.featuredCodes.featuredSets.length} codes`);
    console.log("─".repeat(50));
    console.log(`   Phone 1: ${settings.contact.phone1}`);
    console.log(`   Phone 2: ${settings.contact.phone2}`);
    console.log(`   WhatsApp Enquiry: ${settings.contact.whatsappEnquiry}`);
    console.log(`   Email: ${settings.contact.email}`);
    console.log(`   Form Email: ${settings.contact.formEmail}`);
    console.log("─".repeat(50));

    console.log("\n✨ Seeding complete!");

  } catch (error) {
    console.error("❌ Error seeding settings:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB.");
  }
}

// Run the seeding
seedSettings().catch(console.error);
