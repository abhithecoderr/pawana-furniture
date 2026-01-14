import express from "express";
import SiteSettings from "../models/SiteSettings.js";

const router = express.Router();

// GET /services - Display services page
router.get("/", async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    const servicesSettings = settings.services || {};
    const siteUrl = settings.seo?.siteUrl || 'https://pawanafurniture.com';

    res.render("pages/services", {
      pageTitle: "Our Services | Custom Furniture & Interior Design | Pawana® Furniture",
      pageDescription: "Comprehensive furniture services: custom furniture design, interior consultation, home styling, and more. Serving Rajpura, Punjab and all of India.",
      canonicalUrl: `${siteUrl}/services`,
      servicesSettings,
    });
  } catch (error) {
    console.error("Error loading services page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
