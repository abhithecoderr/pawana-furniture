import express from "express";
import FurnitureItem from "../models/FurnitureItem.js";
import FurnitureSet from "../models/FurnitureSet.js";

const router = express.Router();

// GET /catalogue - Display all items and sets with filters
router.get("/", async (req, res) => {
  try {
    const { style, room, type, view } = req.query;

    // Fetch ALL items and sets (no filtering on server side - let client handle it)
    const items = await FurnitureItem.find({}).sort({ createdAt: -1 });
    const sets = await FurnitureSet.find({}).sort({ createdAt: -1 });

    // Get unique values for filters
    const allRooms = await FurnitureItem.distinct("room");
    const allStyles = ["Royal", "Modern", "Traditional"];
    const allTypes = await FurnitureItem.distinct("type");

    res.render("pages/catalogue", {
      title: "Collection",
      items,
      sets,
      allRooms,
      allStyles,
      allTypes,
      filters: { style, room, type, view: view || "all" },
    });
  } catch (error) {
    console.error("Error loading catalogue page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
