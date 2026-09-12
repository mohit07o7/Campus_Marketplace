const User = require("../models/User");
const Listing = require("../models/Listing");
const generateToken = require("../utils/generateToken");

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, Reg_No } = req.body;

        if (!name || !email || !password || !Reg_No) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password, Reg_No });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                Reg_No: user.Reg_No,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                Reg_No: user.Reg_No,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Error in authUser:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            Reg_No: user.Reg_No,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Only update fields that were sent — leave others unchanged
        user.name   = req.body.name   || user.name;
        user.Reg_No = req.body.Reg_No || user.Reg_No;

        // If a new password is sent, the pre-save hook in User.js will hash it
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            Reg_No: updatedUser.Reg_No,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all listings belonging to the logged-in user
// @route   GET /api/users/my-listings
// @access  Private
const getMyListings = async (req, res) => {
    try {
        const listings = await Listing.find({ sellerId: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            count: listings.length,
            listings,
        });
    } catch (error) {
        console.error("Error in getMyListings:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getMyListings,
};
