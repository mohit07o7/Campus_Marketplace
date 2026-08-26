const multer = require("multer");

// Use memory storage — files are stored in memory as Buffer objects
// We'll pass them to Cloudinary manually in Phase 4
const storage = multer.memoryStorage();

// File filter — only allow image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Only JPEG, PNG, and WEBP images are allowed"), false); // Reject
    }
};

// Configure Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max per file
        files: 5,                  // Maximum 5 files per request
    },
});

module.exports = upload;
