import express from "express";
import Room from "../models/Room.js";
import FurnitureSet from "../models/FurnitureSet.js";
import FurnitureItem from "../models/FurnitureItem.js";
import { getOrSet } from "../utils/cache.js";

const router = express.Router();

// GET /room/:slug/:type - Display specific furniture type in a room
router.get("/:slug/:type", async (req, res) => {
  try {
    const { slug, type } = req.params;

    // Cache room-type data (5 min TTL)
    const roomTypeData = await getOrSet(`room:${slug}:${type}`, async () => {
      const room = await Room.findOne({ slug }).lean();
      if (!room) return null;

      const items = await FurnitureItem.find({
        room: room.name,
        type: new RegExp(`^${type}$`, 'i')
      }).lean();

      return { room, items };
    }, 300);

    if (!roomTypeData || !roomTypeData.room) {
      return res.status(404).send("Room not found");
    }

    const { room } = roomTypeData;
    // Randomize items after cache (so each request varies)
    const items = [...roomTypeData.items].sort(() => Math.random() - 0.5);

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

    // Cache room data (5 min TTL)
    const roomData = await getOrSet(`room:${slug}`, async () => {
      const room = await Room.findOne({ slug }).lean();
      if (!room) return null;

      const [sets, items] = await Promise.all([
        FurnitureSet.find({ room: room.name }).populate("items").lean(),
        FurnitureItem.find({ room: room.name }).lean()
      ]);

      return { room, sets, items };
    }, 300);

    if (!roomData || !roomData.room) {
      return res.status(404).send("Room not found");
    }

    const { room } = roomData;
    // Randomize after cache
    const sets = [...roomData.sets].sort(() => Math.random() - 0.5);
    const items = [...roomData.items].sort(() => Math.random() - 0.5);

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
