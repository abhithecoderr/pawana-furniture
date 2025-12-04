import express from "express";

const router = express.Router();

// GET /wishlist - Render wishlist page
router.get("/", (req, res) => {
  res.render("pages/wishlist", {
    title: "My Wishlist"
  });
});

export default router;
