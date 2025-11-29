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

    // Get similar sets (same room, same style) for the carousel
    const similarSets = await FurnitureSet.find({
      room: set.room,
      style: set.style,
      _id: { $ne: set._id },
    }).populate("items");

    // Get "You may also like" sets (same room, different styles - mixed from other two styles)
    let youMayAlsoLikeSets = await FurnitureSet.find({
      room: set.room,
      style: { $ne: set.style }, // Exclude current style to get mixed styles
      _id: { $ne: set._id },
    }).populate("items");

    // Randomize and limit to 6
    youMayAlsoLikeSets = youMayAlsoLikeSets.sort(() => Math.random() - 0.5).slice(0, 6);

    res.render("pages/set", {
      title: set.name,
      set,
      similarSets,
      youMayAlsoLikeSets,
    });
  } catch (error) {
    console.error("Error loading set page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
