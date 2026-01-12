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

// Default stats data
const defaultStats = [
  { number: "45+", label: "Years Crafting" },
  { number: "200+", label: "Trusted Customers" },
  { number: "100%", label: "Handmade" }
];

async function seedStats() {
  console.log("🚀 Seeding Hero Stats...\n");

  // Connect to database
  console.log("📡 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected.\n");

  try {
    // Get current settings
    const settings = await SiteSettings.getSettings();

    // Check if stats are already populated
    if (settings.home?.hero?.stats && settings.home.hero.stats.length > 0) {
      console.log("ℹ️  Stats already exist:");
      settings.home.hero.stats.forEach((stat, i) => {
        console.log(`   ${i + 1}. ${stat.number} - ${stat.label}`);
      });
      console.log("\n✨ No changes needed.");
    } else {
      // Seed the stats
      console.log("📝 Seeding default stats...");
      await SiteSettings.updateSettings({
        'home.hero.stats': defaultStats
      });

      console.log("✅ Stats seeded successfully!");
      defaultStats.forEach((stat, i) => {
        console.log(`   ${i + 1}. ${stat.number} - ${stat.label}`);
      });
    }

  } catch (error) {
    console.error("❌ Error seeding stats:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("\n📡 Disconnected from MongoDB.");
  }
}

// Run the seeding
seedStats().catch(console.error);
