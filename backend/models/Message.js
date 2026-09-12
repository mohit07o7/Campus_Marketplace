const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        // Who sent the message
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Who receives the message
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Which listing this conversation is about (optional)
        listingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
