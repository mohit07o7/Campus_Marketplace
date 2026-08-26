const express = require("express");
const {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing,
} = require("../controllers/listingController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public routes (anyone can view listings)
router.get("/", getListings);
router.get("/:id", getListingById);

// Protected routes
// upload.array("images", 5) runs BEFORE the controller
// It parses multipart/form-data and populates req.files
router.post("/", protect, upload.array("images", 5), createListing);
router.put("/:id", protect, upload.array("images", 5), updateListing);
router.delete("/:id", protect, deleteListing);

module.exports = router;
