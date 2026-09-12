const Message = require("../models/Message");
const mongoose = require("mongoose");

// @desc    Send a message to another user (about a listing)
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, listingId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ message: "receiverId and content are required" });
        }

        // Prevent messaging yourself
        if (receiverId === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot message yourself" });
        }

        const message = await Message.create({
            senderId: req.user._id,
            receiverId,
            listingId: listingId || null,
            content,
        });

        res.status(201).json(message);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all conversations for the logged-in user
//          Returns the latest message per unique contact
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get the most recent message from each unique conversation partner
        const conversations = await Message.aggregate([
            {
                // Match all messages involving this user
                $match: {
                    $or: [
                        { senderId: new mongoose.Types.ObjectId(userId) },
                        { receiverId: new mongoose.Types.ObjectId(userId) },
                    ],
                },
            },
            {
                // Create a stable "conversationKey" regardless of who sent first
                $addFields: {
                    conversationKey: {
                        $cond: {
                            if: { $lt: ["$senderId", "$receiverId"] },
                            then: { $concat: [{ $toString: "$senderId" }, "_", { $toString: "$receiverId" }] },
                            else: { $concat: [{ $toString: "$receiverId" }, "_", { $toString: "$senderId" }] },
                        },
                    },
                },
            },
            { $sort: { createdAt: -1 } },
            // Keep only the latest message per conversation
            { $group: { _id: "$conversationKey", lastMessage: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$lastMessage" } },
            // Populate sender and receiver info
            {
                $lookup: {
                    from: "users",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "sender",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "receiver",
                },
            },
            {
                $project: {
                    content: 1,
                    createdAt: 1,
                    isRead: 1,
                    listingId: 1,
                    "sender._id": 1,
                    "sender.name": 1,
                    "receiver._id": 1,
                    "receiver.name": 1,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);

        res.json(conversations);
    } catch (error) {
        console.error("Error in getConversations:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all messages between the logged-in user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getMessageThread = async (req, res) => {
    try {
        const myId = req.user._id;
        const { userId: otherId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: otherId },
                { senderId: otherId, receiverId: myId },
            ],
        })
            .populate("senderId", "name")
            .populate("receiverId", "name")
            .sort({ createdAt: 1 }); // Oldest first (chat order)

        // Mark all unread messages sent TO me as read
        await Message.updateMany(
            { senderId: otherId, receiverId: myId, isRead: false },
            { isRead: true }
        );

        res.json(messages);
    } catch (error) {
        console.error("Error in getMessageThread:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { sendMessage, getConversations, getMessageThread };
