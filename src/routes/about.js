import express from "express";
import SiteSettings from "../models/SiteSettings.js";

const router = express.Router();

// GET /about - Display about page
router.get("/", async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    const aboutSettings = settings.about || {};
    const siteUrl = settings.seo?.siteUrl || 'https://pawanafurniture.com';

    res.render("pages/about", {
      pageTitle: "About Pawana Furniture | Handcrafted Since 1980",
      pageDescription: "Discover the story of Pawana Furniture - crafting premium furniture since 1980. Master craftsmanship, sustainable practices, and timeless designs from Rajpura, Punjab.",
      canonicalUrl: `${siteUrl}/about`,
      aboutSettings,
    });
  } catch (error) {
    console.error("Error loading about page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
