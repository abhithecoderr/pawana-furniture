import express from "express";
import FurnitureSet from "../models/FurnitureSet.js";

const router = express.Router();

// GET /set/:slug - Display furniture set with individual items
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const set = await FurnitureSet.findOne({ slug }).populate("items");

    if (!set) {
      return res.status(404).send("Set not found");
    }

    // Get style variants (same room, different styles)
    const styleVariants = await FurnitureSet.find({
      room: set.room,
      _id: { $ne: set._id },
    }).populate("items");

    // Get related sets (different room)
    const relatedSets = await FurnitureSet.find({
      room: { $ne: set.room },
    }).limit(3);

    res.render("pages/set", {
      title: set.name,
      set,
      styleVariants,
      relatedSets,
    });
  } catch (error) {
    console.error("Error loading set page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
