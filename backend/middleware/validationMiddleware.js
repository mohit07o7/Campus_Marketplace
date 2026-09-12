const { body, validationResult } = require("express-validator");

// ── Helper: Run validation and return errors if any ──────────────────────────
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

// ── Auth Validators ───────────────────────────────────────────────────────────
const validateRegister = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email"),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

    body("Reg_No")
        .trim()
        .notEmpty().withMessage("Registration number is required"),

    validate,
];

const validateLogin = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email"),

    body("password")
        .notEmpty().withMessage("Password is required"),

    validate,
];

// ── Listing Validators ────────────────────────────────────────────────────────
const validateListing = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 3, max: 100 }).withMessage("Title must be 3–100 characters"),

    body("description")
        .trim()
        .notEmpty().withMessage("Description is required")
        .isLength({ min: 10, max: 1000 }).withMessage("Description must be 10–1000 characters"),

    body("price")
        .notEmpty().withMessage("Price is required")
        .isNumeric().withMessage("Price must be a number")
        .custom((val) => val >= 0).withMessage("Price cannot be negative"),

    body("category")
        .trim()
        .notEmpty().withMessage("Category is required"),

    validate,
];

// ── Message Validator ─────────────────────────────────────────────────────────
const validateMessage = [
    body("receiverId")
        .notEmpty().withMessage("receiverId is required"),

    body("content")
        .trim()
        .notEmpty().withMessage("Message content is required")
        .isLength({ max: 1000 }).withMessage("Message cannot exceed 1000 characters"),

    validate,
];

module.exports = {
    validateRegister,
    validateLogin,
    validateListing,
    validateMessage,
};
