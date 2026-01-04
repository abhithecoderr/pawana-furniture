import Room from "../models/Room.js";
import FurnitureItem from "../models/FurnitureItem.js";
import { getOrSet } from "../utils/cache.js";

// Middleware to fetch navigation data for the header dropdown
export const navDataMiddleware = async (req, res, next) => {
  try {
    // Cache navigation data for 5 minutes (runs on every request)
    const roomsWithTypes = await getOrSet('nav:rooms', async () => {
      // Fetch all rooms as plain objects
      const rooms = await Room.find()
        .select("name slug")
        .lean();

      // Define custom room order
      const roomOrder = ['Living Room', 'Dining Room', 'Bedroom', 'Office', 'Showpieces'];

      // Sort rooms based on custom order
      rooms.sort((a, b) => {
        const indexA = roomOrder.indexOf(a.name);
        const indexB = roomOrder.indexOf(b.name);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      // Fetch distinct types for each room
      return await Promise.all(
        rooms.map(async (room) => {
          const types = await FurnitureItem.find({ room: room.name }).distinct("type");
          types.sort();
          return { ...room, types };
        })
      );
    }, 300);

    // Make data available to all views
    res.locals.navRooms = roomsWithTypes;
    next();
  } catch (error) {
    console.error("Error fetching navigation data:", error);
    res.locals.navRooms = [];
    next();
  }
};
