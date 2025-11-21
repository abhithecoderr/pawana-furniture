import express from "express";

const router = express.Router();

// GET /contact - Display contact page
router.get("/", async (req, res) => {
  try {
    res.render("pages/contact", {
      title: "Contact Us",
    });
  } catch (error) {
    console.error("Error loading contact page:", error);
    res.status(500).send("Server Error");
  }
});

export default router;
