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

async function addShowpiecesTypeCodes() {
  console.log("🚀 Adding showpiecesTypeCodes to SiteSettings...\n");

  // Connect to database
  console.log("📡 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected.\n");

  try {
    // Update existing settings to add showpiecesTypeCodes
    const result = await SiteSettings.updateOne(
      { "home.showpiecesTypeCodes": { $exists: false } },
      {
        $set: {
          "home.showpiecesTypeCodes": {
            "Cabinet": "SR-033",
            "Console": "ST-048",
            "Fireplace": "SR-089"
          }
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log("✅ Added showpiecesTypeCodes to SiteSettings!");
    } else {
      console.log("ℹ️  showpiecesTypeCodes already exists or no settings document found.");
    }

    // Verify
    const settings = await SiteSettings.getSettings();
    console.log("\n📋 Current showpiecesTypeCodes:");
    console.log(settings.home?.showpiecesTypeCodes || "Not set");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("\n📡 Disconnected from MongoDB.");
  }
}

addShowpiecesTypeCodes().catch(console.error);
