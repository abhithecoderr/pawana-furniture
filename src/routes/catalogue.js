import express from "express";
import FurnitureItem from "../models/FurnitureItem.js";
import FurnitureSet from "../models/FurnitureSet.js";
import SiteSettings from "../models/SiteSettings.js";
import { getOrSet } from "../utils/cache.js";

const router = express.Router();

// GET /catalogue - Display all items and sets with filters
router.get("/", async (req, res) => {
  try {
    const { style, room, type, view } = req.query;

    // Fetch ALL items and sets with caching (5 min TTL)
    const catalogueData = await getOrSet('catalogue:all', async () => {
      let [items, sets] = await Promise.all([
        FurnitureItem.find({}).lean(),
        FurnitureSet.find({}).lean()
      ]);
      return { items, sets };
    }, 300);

    // Randomize the order (done after cache so each request gets different order)
    let { items, sets } = catalogueData;
    items = [...items].sort(() => Math.random() - 0.5);
    sets = [...sets].sort(() => Math.random() - 0.5);

    // Get unique values for filters (run in parallel)
    const [roomsFromItems, roomsFromSets, allTypes] = await Promise.all([
      FurnitureItem.distinct("room"),
      FurnitureSet.distinct("room"),
      FurnitureItem.distinct("type")
    ]);
    const allRooms = [...new Set([...roomsFromItems, ...roomsFromSets])];
    const allStyles = ["Royal", "Modern", "Traditional"];

    const settings = await SiteSettings.getSettings();

    const siteUrl = settings.seo?.siteUrl || 'https://pawanafurniture.com';

    res.render("pages/catalogue", {
      pageTitle: "Furniture Collection | Premium Handcrafted Furniture | Pawana® Furniture",
      pageDescription: "Browse our complete collection of handcrafted furniture. Living room, bedroom, dining, office furniture & showpieces. Crafted in Rajpura, Punjab since 1980.",
      canonicalUrl: `${siteUrl}/catalogue`,
      items,
      sets,
      allRooms,
      allStyles,
      allTypes,
      filters: { style, room, type, view: view || "all" },
      catalogueSettings: settings.catalogue,
    });
  } catch (error) {
    console.error("Error loading catalogue page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
