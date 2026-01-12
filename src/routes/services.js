import express from "express";
import SiteSettings from "../models/SiteSettings.js";

const router = express.Router();

// GET /services - Display services page
router.get("/", async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    const servicesSettings = settings.services || {};

    res.render("pages/services", {
      title: "Our Services",
      servicesSettings,
    });
  } catch (error) {
    console.error("Error loading services page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
