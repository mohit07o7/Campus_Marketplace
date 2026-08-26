// ─── Global Error Handler ─────────────────────────────────────────────────────
// This middleware catches ALL errors thrown in the app.
// It must have 4 parameters (err, req, res, next) — that's how Express
// identifies it as an error handler.

const errorHandler = (err, req, res, next) => {
    // ── Multer-specific errors ────────────────────────────────────────────────
    if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "File too large. Maximum size is 5MB per image.",
            });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                message: "Too many files. Maximum is 5 images per listing.",
            });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                message: "Unexpected field name. Use 'images' as the field name.",
            });
        }
        return res.status(400).json({ message: err.message });
    }

    // ── Custom file filter error (wrong file type) ────────────────────────────
    if (err.message === "Only JPEG, PNG, and WEBP images are allowed") {
        return res.status(400).json({ message: err.message });
    }

    // ── Mongoose CastError (invalid MongoDB ObjectId) ─────────────────────────
    // e.g. GET /api/listings/not-a-valid-id
    if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid resource ID format." });
    }

    // ── Mongoose Validation Error ─────────────────────────────────────────────
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: messages.join(", ") });
    }

    // ── MongoDB Duplicate Key Error (e.g. duplicate email) ────────────────────
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            message: `${field} already exists. Please use a different value.`,
        });
    }

    // ── JWT Errors ────────────────────────────────────────────────────────────
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token." });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired. Please log in again." });
    }

    // ── Generic fallback ──────────────────────────────────────────────────────
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
    });
};

module.exports = errorHandler;
