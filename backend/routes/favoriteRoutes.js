const express = require("express");
const { toggleFavorite, getMyFavorites } = require("../controllers/favoriteController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMyFavorites);
router.post("/:listingId", protect, toggleFavorite);

module.exports = router;
