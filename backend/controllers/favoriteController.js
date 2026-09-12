const Favorite = require("../models/Favorite");
const Listing = require("../models/Listing");

// @desc    Add a listing to favorites (toggle — adds if not there, removes if already there)
// @route   POST /api/favorites/:listingId
// @access  Private
const toggleFavorite = async (req, res) => {
    try {
        const { listingId } = req.params;
        const userId = req.user._id;

        // Check the listing actually exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Check if already favorited
        const existing = await Favorite.findOne({ userId, listingId });

        if (existing) {
            // Already favorited → remove it
            await existing.deleteOne();
            return res.json({ message: "Removed from favorites", favorited: false });
        } else {
            // Not favorited → add it
            await Favorite.create({ userId, listingId });
            return res.json({ message: "Added to favorites", favorited: true });
        }
    } catch (error) {
        console.error("Error in toggleFavorite:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all favorites for the logged-in user
// @route   GET /api/favorites
// @access  Private
const getMyFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user._id })
            .populate({
                path: "listingId",
                populate: { path: "sellerId", select: "name Reg_No" },
            })
            .sort({ createdAt: -1 });

        // Extract just the listing data (strip the wrapper)
        const listings = favorites
            .filter((f) => f.listingId !== null) // Guard against deleted listings
            .map((f) => f.listingId);

        res.json({ count: listings.length, listings });
    } catch (error) {
        console.error("Error in getMyFavorites:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { toggleFavorite, getMyFavorites };
