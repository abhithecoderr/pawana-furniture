import express from "express";
import FurnitureItem from "../models/FurnitureItem.js";
import FurnitureSet from "../models/FurnitureSet.js";
import Room from "../models/Room.js";
import SiteSettings from "../models/SiteSettings.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Fetch site settings from database
    const settings = await SiteSettings.getSettings();

    // Get featured codes from settings
    const SIGNATURE_ITEMS_CODES = settings.home.featuredCodes.signatureItems;
    const FEATURED_ITEMS_CODES = settings.home.featuredCodes.featuredItems;
    const FEATURED_SETS_CODES = settings.home.featuredCodes.featuredSets;

    const featuredItemsRaw = await FurnitureItem.find({
      code: { $in: SIGNATURE_ITEMS_CODES },
    });
    // Sort items to match SIGNATURE_ITEMS_CODES order
    const featuredItems = SIGNATURE_ITEMS_CODES.map(code =>
      featuredItemsRaw.find(item => item.code === code)
    ).filter(Boolean);

    const carouselItemsRaw = await FurnitureItem.find({
      code: { $in: FEATURED_ITEMS_CODES },
    });
    // Sort items to match FEATURED_ITEMS_CODES order
    const carouselItems = FEATURED_ITEMS_CODES.map(code =>
      carouselItemsRaw.find(item => item.code === code)
    ).filter(Boolean);

    const carouselSetsRaw = await FurnitureSet.find({
      code: { $in: FEATURED_SETS_CODES },
    });
    // Sort sets to match FEATURED_SETS_CODES order
    const carouselSets = FEATURED_SETS_CODES.map(code =>
      carouselSetsRaw.find(set => set.code === code)
    ).filter(Boolean);

    // Fetch all furniture items
    const allItems = await FurnitureItem.find().sort({ createdAt: -1 });

    // Group items by type
    const groupedItems = allItems.reduce((acc, item) => {
      const key = item.type.toLowerCase(); // e.g., 'Bed' -> 'bed'
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    // Fetch all rooms for Browse by Rooms section
    const rooms = await Room.find();

    // Get browse by rooms codes from settings
    const browseByRoomCodes = settings.home.browseByRoomCodes || {};

    // Fetch items for browse by rooms images and update room images
    const roomsWithCustomImages = await Promise.all(
      rooms.map(async (room) => {
        const roomObj = room.toObject();
        const productCode = browseByRoomCodes[room.name];

        if (productCode) {
          // Try to find item or set with this code
          let productWithImage = await FurnitureItem.findOne({ code: productCode });
          if (!productWithImage) {
            productWithImage = await FurnitureSet.findOne({ code: productCode });
          }

          // If found, use its image
          if (productWithImage && productWithImage.images && productWithImage.images.length > 0) {
            roomObj.images = productWithImage.images;
          }
        }

        return roomObj;
      })
    );

    res.render("pages/home", {
      title: "Home",
      pageClass: "page-home",
      featuredItems,
      carouselItems,
      carouselSets,
      groupedItems,
      rooms: roomsWithCustomImages,
      heroContent: settings.home.hero,
      contactSettings: settings.contact,
    });
  } catch (error) {
    console.error("Error loading home page:", error);
    res.status(500).send("Server Error");
  }
});


export default router;

