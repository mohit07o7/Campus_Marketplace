const express = require("express");
const {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getMyListings,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../middleware/validationMiddleware");

const router = express.Router();

// Public routes
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, authUser);

// Private routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/my-listings", protect, getMyListings);

module.exports = router;