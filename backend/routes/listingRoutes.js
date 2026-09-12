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
const { validateListing } = require("../middleware/validationMiddleware");

const router = express.Router();

// Public
router.get("/", getListings);
router.get("/:id", getListingById);

// Private (upload runs before validation so req.body is populated from form-data)
router.post("/", protect, upload.array("images", 5), validateListing, createListing);
router.put("/:id", protect, upload.array("images", 5), validateListing, updateListing);
router.delete("/:id", protect, deleteListing);

module.exports = router;
