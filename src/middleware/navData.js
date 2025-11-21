import Room from "../models/Room.js";

// Middleware to fetch navigation data for the header dropdown
export const navDataMiddleware = async (req, res, next) => {
  try {
    // Fetch all rooms
    const rooms = await Room.find()
      .select("name slug")
      .sort({ name: 1 });

    // Make data available to all views
    res.locals.navRooms = rooms;

    next();
  } catch (error) {
    console.error("Error fetching navigation data:", error);
    // Continue even if there's an error, just with empty arrays
    res.locals.navRooms = [];
    next();
  }
};
