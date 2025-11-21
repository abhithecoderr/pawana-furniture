import express from "express";
import Room from "../models/Room.js";
import FurnitureSet from "../models/FurnitureSet.js";
import FurnitureItem from "../models/FurnitureItem.js";

const router = express.Router();

// GET /room/:slug - Display room with sets and individual items
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const room = await Room.findOne({ slug });

    if (!room) {
      return res.status(404).send("Room not found");
    }

    // Get all sets for this room
    const sets = await FurnitureSet.find({ room: room.name }).populate("items");

    // Get all individual items for this room
    const items = await FurnitureItem.find({ room: room.name });

    res.render("pages/room", {
      title: room.name,
      room,
      sets,
      items,
    });
  } catch (error) {
    console.error("Error loading room page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
