import express from "express";
import FurnitureSet from "../models/FurnitureSet.js";
import SiteSettings from "../models/SiteSettings.js";
import { getOrSet } from "../utils/cache.js";

const router = express.Router();

// GET /set/:slug - Display furniture set with individual items
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Cache set data by slug (5 min TTL)
    const setData = await getOrSet(`set:${slug}`, async () => {
      const set = await FurnitureSet.findOne({ slug }).populate("items").lean();
      if (!set) return null;

      const [settings, similarSets, youMayAlsoLikeSetsRaw] = await Promise.all([
        SiteSettings.findOne().lean(),
        FurnitureSet.find({
          room: set.room,
          style: set.style,
          _id: { $ne: set._id },
        }).populate("items").limit(6).lean(),
        FurnitureSet.find({
          room: set.room,
          style: { $ne: set.style },
          _id: { $ne: set._id },
        }).populate("items").lean()
      ]);

      return { set, settings, similarSets, youMayAlsoLikeSetsRaw };
    }, 300);

    if (!setData || !setData.set) {
      return res.status(404).send("Set not found");
    }

    const { set, settings, similarSets, youMayAlsoLikeSetsRaw } = setData;

    // Randomize and limit to 9 (done after cache so each request varies)
    const youMayAlsoLikeSets = [...youMayAlsoLikeSetsRaw].sort(() => Math.random() - 0.5).slice(0, 9);

    res.render("pages/set", {
      title: set.name,
      set,
      similarSets,
      youMayAlsoLikeSets,
      contactSettings: settings ? settings.contact : {},
    });
  } catch (error) {
    console.error("Error loading set page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
