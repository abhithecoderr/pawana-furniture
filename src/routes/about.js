import express from "express";
import SiteSettings from "../models/SiteSettings.js";

const router = express.Router();

// GET /about - Display about page
router.get("/", async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    const aboutSettings = settings.about || {};

    res.render("pages/about", {
      title: "About Pawana Furniture",
      aboutSettings,
    });
  } catch (error) {
    console.error("Error loading about page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
