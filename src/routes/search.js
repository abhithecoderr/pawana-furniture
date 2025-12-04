import express from "express";
import FurnitureItem from "../models/FurnitureItem.js";
import FurnitureSet from "../models/FurnitureSet.js";

const router = express.Router();

// GET /api/search?q=<query> - Search items and sets
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ items: [], sets: [] });
    }

    // Create case-insensitive regex
    const searchRegex = new RegExp(q.trim(), "i");

    // Search items by name, code, style, type, room
    const items = await FurnitureItem.find({
      $or: [
        { name: searchRegex },
        { code: searchRegex },
        { style: searchRegex },
        { type: searchRegex },
        { room: searchRegex }
      ]
    }).limit(10).select("name slug code style type room images");

    // Search sets by name, code, style, room
    const sets = await FurnitureSet.find({
      $or: [
        { name: searchRegex },
        { code: searchRegex },
        { style: searchRegex },
        { room: searchRegex }
      ]
    }).limit(10).select("name slug code style room images");

    res.json({ items, sets });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
