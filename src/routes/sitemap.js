import express from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import FurnitureItem from "../models/FurnitureItem.js";
import FurnitureSet from "../models/FurnitureSet.js";
import Room from "../models/Room.js";

const router = express.Router();

const SITE_URL = 'https://pawanafurniture.com';

// GET /sitemap.xml - Generate dynamic XML sitemap
router.get("/", async (req, res) => {
  try {
    // Static pages with high priority
    const staticPages = [
      { url: '/', changefreq: 'weekly', priority: 1.0 },
      { url: '/catalogue', changefreq: 'daily', priority: 0.9 },
      { url: '/about', changefreq: 'monthly', priority: 0.7 },
      { url: '/services', changefreq: 'monthly', priority: 0.7 },
      { url: '/contact', changefreq: 'monthly', priority: 0.8 },
    ];

    // Fetch all rooms
    const rooms = await Room.find().lean();
    const roomPages = rooms.map(room => ({
      url: `/room/${room.slug}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: room.updatedAt?.toISOString().split('T')[0]
    }));

    // Fetch all room types (for room-type pages)
    const roomTypePages = [];
    for (const room of rooms) {
      const types = await FurnitureItem.find({ room: room.name }).distinct("type");
      for (const type of types) {
        roomTypePages.push({
          url: `/room/${room.slug}/${type.toLowerCase()}`,
          changefreq: 'weekly',
          priority: 0.7
        });
      }
    }

    // Fetch all furniture items
    const items = await FurnitureItem.find().select('slug updatedAt').lean();
    const itemPages = items.map(item => ({
      url: `/item/${item.slug}`,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: item.updatedAt?.toISOString().split('T')[0]
    }));

    // Fetch all furniture sets
    const sets = await FurnitureSet.find().select('slug updatedAt').lean();
    const setPages = sets.map(set => ({
      url: `/set/${set.slug}`,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: set.updatedAt?.toISOString().split('T')[0]
    }));

    // Combine all pages
    const allPages = [
      ...staticPages,
      ...roomPages,
      ...roomTypePages,
      ...itemPages,
      ...setPages
    ];

    // Create sitemap stream
    const stream = new SitemapStream({ hostname: SITE_URL });

    // Generate sitemap XML
    const data = await streamToPromise(
      Readable.from(allPages).pipe(stream)
    );

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(data.toString());
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
