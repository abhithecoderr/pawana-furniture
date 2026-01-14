import express from "express";
import SiteSettings from "../models/SiteSettings.js";
import {
  generateLocalBusinessSchema,
  generateSchemaScript
} from "../utils/seoHelper.js";

const router = express.Router();

// GET /contact - Display contact page
router.get("/", async (req, res) => {
  try {
    // Fetch contact settings from database
    const settings = await SiteSettings.getSettings();

    // Generate LocalBusiness schema for local SEO
    const localBusinessSchema = generateLocalBusinessSchema(settings);
    const structuredData = generateSchemaScript(localBusinessSchema);

    const siteUrl = settings.seo?.siteUrl || 'https://pawanafurniture.com';

    res.render("pages/contact", {
      pageTitle: "Contact Us | Pawana® Furniture Rajpura",
      pageDescription: "Visit Pawana Furniture showroom in Rajpura, Punjab. Call +91 8360550271 or WhatsApp for custom furniture quotes. Open 7 days a week.",
      canonicalUrl: `${siteUrl}/contact`,
      structuredData,
      contactSettings: settings.contact,
    });
  } catch (error) {
    console.error("Error loading contact page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
