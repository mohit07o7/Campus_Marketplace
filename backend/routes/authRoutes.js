const express = require("express");
const { registerUser, authUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login a user
router.post("/login", authUser);

// Protected profile route (just as an example/test)
router.get("/profile", protect, (req, res) => {
    res.json(req.user);
});

module.exports = router;