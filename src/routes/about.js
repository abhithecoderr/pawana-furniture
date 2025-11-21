import express from "express";

const router = express.Router();

// GET /about - Display about page
router.get("/", async (req, res) => {
  try {
    res.render("pages/about", {
      title: "About Pawana Furniture",
    });
  } catch (error) {
    console.error("Error loading about page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
