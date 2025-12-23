import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import FurnitureItem from "../src/models/FurnitureItem.js";
import FurnitureSet from "../src/models/FurnitureSet.js";
import Room from "../src/models/Room.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MONGO_URL = process.env.DB_URI;

// ==========================================
// CONFIGURATION - Edit these to control upload
// ==========================================
const CONFIG = {
  rooms: {
    livingRoom: true,     // Set to false to skip
    diningRoom: false,    // Enable when folder exists
    bedroom: false,       // Enable when folder exists
    office: false,        // Enable when folder exists
    showpieces: false,    // Enable when folder exists
  },
  overwriteCloudinary: true,   // Overwrite existing images in Cloudinary
  basePath: path.join(__dirname, "../public/Pawana Furniture"),
  cloudinaryBaseFolder: "pawana",  // Base folder in Cloudinary
};

// Room folder mappings
const ROOM_FOLDERS = {
  livingRoom: "living-room",
  diningRoom: "dining-room",
  bedroom: "bedroom",
  office: "office",
  showpieces: "showpieces",
};

const ROOM_NAMES = {
  livingRoom: "Living Room",
  diningRoom: "Dining Room",
  bedroom: "Bedroom",
  office: "Office",
  showpieces: "Showpieces",
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Find all image files in a directory
 */
function findImageFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const extensions = [".jpg", ".jpeg", ".png", ".webp", ".PNG", ".JPG", ".JPEG"];
  const files = fs.readdirSync(dirPath);

  return files.filter(file => {
    const ext = path.extname(file);
    return extensions.includes(ext);
  });
}

/**
 * Upload a single image to Cloudinary
 */
async function uploadToCloudinary(filePath, cloudinaryFolder, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: cloudinaryFolder,
      public_id: publicId,
      overwrite: CONFIG.overwriteCloudinary,
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error(`    ❌ Upload failed: ${error.message}`);
    return null;
  }
}

/**
 * Process items for a style
 */
async function processItems(roomFolder, styleFolderName, styleName, roomName, cloudinaryBase) {
  const itemsPath = path.join(roomFolder, styleFolderName, "items");

  if (!fs.existsSync(itemsPath)) {
    console.log(`    ⚠️  No items folder found at: ${itemsPath}`);
    return 0;
  }

  let uploadCount = 0;
  const types = fs.readdirSync(itemsPath).filter(f =>
    fs.statSync(path.join(itemsPath, f)).isDirectory()
  );

  for (const type of types) {
    const typePath = path.join(itemsPath, type);
    const imageFiles = findImageFiles(typePath);

    for (const imageFile of imageFiles) {
      const code = path.parse(imageFile).name;
      const filePath = path.join(typePath, imageFile);

      // Find document by code
      const doc = await FurnitureItem.findOne({ code, room: roomName });

      if (!doc) {
        console.log(`    ⚠️  No document found for code: ${code}`);
        continue;
      }

      console.log(`    📤 Uploading: ${code} (${doc.name})`);

      const cloudinaryFolder = `${cloudinaryBase}/${styleFolderName}/items/${type}`;
      const imageData = await uploadToCloudinary(filePath, cloudinaryFolder, code);

      if (imageData) {
        doc.images = [imageData];
        await doc.save();
        console.log(`       ✔ Uploaded & saved`);
        uploadCount++;
      }
    }
  }

  return uploadCount;
}

/**
 * Process sets for a style
 */
async function processSets(roomFolder, styleFolderName, styleName, roomName, cloudinaryBase) {
  const setsPath = path.join(roomFolder, styleFolderName, "sets");

  if (!fs.existsSync(setsPath)) {
    console.log(`    ⚠️  No sets folder found at: ${setsPath}`);
    return 0;
  }

  let uploadCount = 0;
  const imageFiles = findImageFiles(setsPath);

  for (const imageFile of imageFiles) {
    const code = path.parse(imageFile).name;
    const filePath = path.join(setsPath, imageFile);

    // Find document by code
    const doc = await FurnitureSet.findOne({ code, room: roomName });

    if (!doc) {
      console.log(`    ⚠️  No document found for code: ${code}`);
      continue;
    }

    console.log(`    📤 Uploading: ${code} (${doc.name})`);

    const cloudinaryFolder = `${cloudinaryBase}/${styleFolderName}/sets`;
    const imageData = await uploadToCloudinary(filePath, cloudinaryFolder, code);

    if (imageData) {
      doc.images = [imageData];
      await doc.save();
      console.log(`       ✔ Uploaded & saved`);
      uploadCount++;
    }
  }

  return uploadCount;
}

/**
 * Process a single room
 */
async function processRoom(roomKey) {
  const folderName = ROOM_FOLDERS[roomKey];
  const roomName = ROOM_NAMES[roomKey];
  const roomPath = path.join(CONFIG.basePath, folderName);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📦 Processing: ${roomName}`);
  console.log(`   Path: ${roomPath}`);
  console.log("=".repeat(60));

  if (!fs.existsSync(roomPath)) {
    console.log(`❌ Folder not found: ${roomPath}`);
    return { items: 0, sets: 0 };
  }

  let totalItems = 0;
  let totalSets = 0;

  // Get all style folders
  const styleFolders = fs.readdirSync(roomPath).filter(f =>
    fs.statSync(path.join(roomPath, f)).isDirectory()
  );

  const cloudinaryBase = `${CONFIG.cloudinaryBaseFolder}/${folderName}`;

  for (const styleFolderName of styleFolders) {
    console.log(`\n  📂 Style: ${styleFolderName}`);

    // Map folder name to style name
    const styleName = styleFolderName.charAt(0).toUpperCase() + styleFolderName.slice(1);

    // Process items
    const itemCount = await processItems(roomPath, styleFolderName, styleName, roomName, cloudinaryBase);
    totalItems += itemCount;

    // Process sets
    const setCount = await processSets(roomPath, styleFolderName, styleName, roomName, cloudinaryBase);
    totalSets += setCount;
  }

  console.log(`\n  📊 Room Total: ${totalItems} items, ${totalSets} sets`);
  return { items: totalItems, sets: totalSets };
}

/**
 * Upload room images (for the Room collection itself)
 */
async function uploadRoomImages() {
  console.log(`\n${"=".repeat(60)}`);
  console.log("📦 Processing Room Collection Images");
  console.log("=".repeat(60));

  const roomImagesPath = path.join(CONFIG.basePath, "rooms");

  if (!fs.existsSync(roomImagesPath)) {
    console.log(`⚠️  No rooms folder found at: ${roomImagesPath}`);
    return 0;
  }

  const imageFiles = findImageFiles(roomImagesPath);
  let uploadCount = 0;

  for (const imageFile of imageFiles) {
    const slug = path.parse(imageFile).name;
    const filePath = path.join(roomImagesPath, imageFile);

    const doc = await Room.findOne({ slug });

    if (!doc) {
      console.log(`  ⚠️  No Room document found for slug: ${slug}`);
      continue;
    }

    console.log(`  📤 Uploading: ${slug} (${doc.name})`);

    const cloudinaryFolder = `${CONFIG.cloudinaryBaseFolder}/rooms`;
    const imageData = await uploadToCloudinary(filePath, cloudinaryFolder, slug);

    if (imageData) {
      doc.images = [imageData];
      await doc.save();
      console.log(`     ✔ Uploaded & saved`);
      uploadCount++;
    }
  }

  return uploadCount;
}

/**
 * Main upload function
 */
async function uploadAllImages() {
  console.log("🚀 Starting Image Upload Process...\n");
  console.log("Configuration:");
  console.log(`  Base Path: ${CONFIG.basePath}`);
  console.log(`  Cloudinary Folder: ${CONFIG.cloudinaryBaseFolder}`);
  console.log(`  Overwrite: ${CONFIG.overwriteCloudinary}`);
  console.log("  Rooms:", Object.entries(CONFIG.rooms)
    .map(([k, v]) => `${k}=${v}`)
    .join(", "));

  // Connect to database
  console.log("\n📡 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected.");

  let grandTotalItems = 0;
  let grandTotalSets = 0;

  // Process each enabled room
  for (const [roomKey, enabled] of Object.entries(CONFIG.rooms)) {
    if (!enabled) {
      console.log(`\n⏭️  Skipping: ${roomKey} (disabled in config)`);
      continue;
    }

    const { items, sets } = await processRoom(roomKey);
    grandTotalItems += items;
    grandTotalSets += sets;
  }

  // Also check for room images
  const roomImageCount = await uploadRoomImages();

  // Summary
  console.log("\n\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(60));
  console.log(`✔ Total Item Images Uploaded: ${grandTotalItems}`);
  console.log(`✔ Total Set Images Uploaded: ${grandTotalSets}`);
  console.log(`✔ Total Room Images Uploaded: ${roomImageCount}`);

  // Close connection
  await mongoose.connection.close();
  console.log("\n✅ Image upload complete! 🎉\n");
}

// Run the script
uploadAllImages().catch((err) => {
  console.error("❌ Error during upload:", err);
  mongoose.connection.close();
  process.exit(1);
});
