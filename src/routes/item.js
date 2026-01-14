import express from "express";
import FurnitureItem from "../models/FurnitureItem.js";
import SiteSettings from "../models/SiteSettings.js";
import { getOrSet } from "../utils/cache.js";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateSchemaScript
} from "../utils/seoHelper.js";

const router = express.Router();

// GET /item/:slug - Display individual furniture item
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Cache item data by slug (5 min TTL)
    const itemData = await getOrSet(`item:${slug}`, async () => {
      const item = await FurnitureItem.findOne({ slug }).lean();
      if (!item) return null;

      const [settings, styleVariants, similarItems] = await Promise.all([
        SiteSettings.findOne().lean(),
        FurnitureItem.find({
          room: item.room,
          type: item.type,
          _id: { $ne: item._id },
        }).lean(),
        FurnitureItem.find({
          room: item.room,
          type: item.type,
          style: item.style,
          _id: { $ne: item._id },
        }).limit(6).lean()
      ]);

      return { item, settings, styleVariants, similarItems };
    }, 300);

    if (!itemData || !itemData.item) {
      return res.status(404).send("Item not found");
    }

    const { item, settings, styleVariants, similarItems } = itemData;

    // Build a set of IDs to exclude (current item + all similar items)
    const excludeIds = [
      item._id,
      ...similarItems.map(s => s._id)
    ];

    // Get related items (same type, random mix of other styles) for "You may also like"
    const relatedItems = await FurnitureItem.aggregate([
      {
        $match: {
          type: item.type,
          style: { $ne: item.style },
          _id: { $nin: excludeIds },
        }
      },
      { $sample: { size: 6 } }
    ]);

    // SEO data for product page
    const siteUrl = settings.seo?.siteUrl || 'https://pawanafurniture.com';
    const productSchema = generateProductSchema(item, siteUrl);
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: item.room, url: `/room/${item.room.toLowerCase().replace(/\s+/g, '-')}` },
      { name: item.name }
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs, siteUrl);
    const structuredData = generateSchemaScript({ '@context': 'https://schema.org', '@graph': [productSchema, breadcrumbSchema] });

    res.render("pages/item", {
      pageTitle: `${item.name} | ${item.room} Furniture | Pawana® Furniture`,
      pageDescription: `${item.name} - ${item.style} style ${item.type.toLowerCase()} for your ${item.room.toLowerCase()}. Code: ${item.code}. Handcrafted premium furniture in Rajpura, Punjab.`,
      canonicalUrl: `${siteUrl}/item/${item.slug}`,
      ogImage: item.images?.[0]?.url,
      ogType: 'product',
      structuredData,
      item,
      styleVariants,
      similarItems,
      relatedItems,
      contactSettings: settings.contact,
    });
  } catch (error) {
    console.error("Error loading item page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
