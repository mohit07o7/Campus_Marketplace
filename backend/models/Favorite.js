const mongoose = require("mongoose");

// A Favorite is simply a (user, listing) pair.
// We add a unique compound index so a user can't favorite the same listing twice.
const favoriteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        listingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent duplicate favorites from the same user for the same listing
favoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
