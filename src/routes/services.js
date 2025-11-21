import express from "express";

const router = express.Router();

// GET /services - Display services page
router.get("/", async (req, res) => {
  try {
    res.render("pages/services", {
      title: "Our Services",
    });
  } catch (error) {
    console.error("Error loading services page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
