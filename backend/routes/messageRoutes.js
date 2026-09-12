const express = require("express");
const { sendMessage, getConversations, getMessageThread } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All message routes require authentication
router.post("/", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/:userId", protect, getMessageThread);

module.exports = router;
