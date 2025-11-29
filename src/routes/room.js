import express from "express";
import Room from "../models/Room.js";
import FurnitureSet from "../models/FurnitureSet.js";
import FurnitureItem from "../models/FurnitureItem.js";

const router = express.Router();

// GET /room/:slug/:type - Display specific furniture type in a room (e.g., Living Room Chairs)
router.get("/:slug/:type", async (req, res) => {
  try {
    const { slug, type } = req.params;
    const room = await Room.findOne({ slug });

    if (!room) {
      return res.status(404).send("Room not found");
    }

    // Get items filtered by room and type
    let items = await FurnitureItem.find({
      room: room.name,
      type: new RegExp(`^${type}$`, 'i') // Case-insensitive match
    });

    // Randomize items
    items = items.sort(() => Math.random() - 0.5);

    // Format type for display (e.g., "chair" -> "Chairs")
    const typeDisplay = type.charAt(0).toUpperCase() + type.slice(1) +
                       (type.endsWith('s') ? '' : 's');

    res.render("pages/room-type", {
      title: `${room.name} ${typeDisplay}`,
      room,
      type: typeDisplay,
      typeSlug: type,
      items,
    });
  } catch (error) {
    console.error("Error loading room-type page:", error);
    res.status(500).send("Server Error");
  }
});

// GET /room/:slug - Display room with sets and individual items
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const room = await Room.findOne({ slug });

    if (!room) {
      return res.status(404).send("Room not found");
    }

    // Get all sets for this room
    let sets = await FurnitureSet.find({ room: room.name }).populate("items");
    sets = sets.sort(() => Math.random() - 0.5);

    // Get all individual items for this room
    let items = await FurnitureItem.find({ room: room.name });
    items = items.sort(() => Math.random() - 0.5);

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
