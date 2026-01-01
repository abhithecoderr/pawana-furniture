import Room from "../models/Room.js";
import FurnitureItem from "../models/FurnitureItem.js";

// Middleware to fetch navigation data for the header dropdown
export const navDataMiddleware = async (req, res, next) => {
  try {
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

      // If room not in custom order, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

    // Fetch distinct types for each room
    const roomsWithTypes = await Promise.all(
      rooms.map(async (room) => {
        // Get unique types for this room (e.g., ['Sofa', 'Chair', 'Table'])
        const types = await FurnitureItem.find({ room: room.name }).distinct("type");

        // Sort types alphabetically
        types.sort();

        return { ...room, types };
      })
    );

    // Make data available to all views
    res.locals.navRooms = roomsWithTypes;

    next();
  } catch (error) {
    console.error("Error fetching navigation data:", error);
    // Continue even if there's an error, just with empty arrays
    res.locals.navRooms = [];
    next();
  }
};
