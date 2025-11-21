import express from "express";
import FurnitureItem from "../models/FurnitureItem.js";

const router = express.Router();

// GET /item/:slug - Display individual furniture item
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const item = await FurnitureItem.findOne({ slug });

    if (!item) {
      return res.status(404).send("Item not found");
    }

    // Get style variants (same room and type, different styles)
    const styleVariants = await FurnitureItem.find({
      room: item.room,
      type: item.type,
      _id: { $ne: item._id }, // Exclude current item
    });

    // Get related items (same room, different type)
    const relatedItems = await FurnitureItem.find({
      room: item.room,
      type: { $ne: item.type },
    }).limit(6);

    res.render("pages/item", {
      title: item.name,
      item,
      styleVariants,
      relatedItems,
    });
  } catch (error) {
    console.error("Error loading item page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
