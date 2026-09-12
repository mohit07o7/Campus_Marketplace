const Listing = require("../models/Listing");
const cloudinary = require("../config/cloudinary");

// ─── Phase 4: Helper — Upload a single Buffer to Cloudinary ──────────────────
// Cloudinary's Node SDK works with streams, not raw Buffers directly.
// So we wrap it in a Promise and pipe the Buffer through upload_stream.
const uploadToCloudinary = (fileBuffer, mimetype) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "campus-marketplace",
                resource_type: "image",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url); // Return the live HTTPS URL
            }
        );
        uploadStream.end(fileBuffer); // Push the Buffer into the stream
    });
};

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res) => {
    try {
        const { title, description, price, category } = req.body;

        if (!title || !description || !price || !category) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // ── Phase 4: Upload each file Buffer to Cloudinary ──────────────────
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) =>
                uploadToCloudinary(file.buffer, file.mimetype)
            );
            imageUrls = await Promise.all(uploadPromises); // Wait for all uploads
        }

        // ── Phase 5: Save the returned Cloudinary URLs into MongoDB ─────────
        const listing = new Listing({
            title,
            description,
            price,
            category,
            images: imageUrls,         // Array of secure Cloudinary URLs
            sellerId: req.user._id,
        });

        const createdListing = await listing.save();
        res.status(201).json(createdListing);
    } catch (error) {
        console.error("Error creating listing:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Fetch all listings with search, filter, sort, and pagination
// @route   GET /api/listings
// @access  Public
// Supports: ?search= &category= &minPrice= &maxPrice= &sort= &page= &limit=
const getListings = async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 20,
        } = req.query;

        // ── Phase 1: Build the query object ───────────────────────────────────
        const query = {};

        // Phase 1 — Text search across title AND description (case-insensitive)
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // Phase 2 — Category filter (exact match)
        if (category) {
            query.category = category;
        }

        // Phase 3 — Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // ── Phase 4: Sort options ─────────────────────────────────────────────
        let sortOption = {};
        switch (sort) {
            case "oldest":
                sortOption = { createdAt: 1 };
                break;
            case "price_asc":
                sortOption = { price: 1 };
                break;
            case "price_desc":
                sortOption = { price: -1 };
                break;
            case "newest":
            default:
                sortOption = { createdAt: -1 }; // Default: newest first
        }

        // ── Phase 5: Pagination math ──────────────────────────────────────────
        const pageNum  = Math.max(1, Number(page));    // Can't be less than 1
        const limitNum = Math.min(100, Math.max(1, Number(limit))); // Between 1–100
        const skip     = (pageNum - 1) * limitNum;

        // ── Phase 6: Run the query with everything combined ───────────────────
        const [listings, total] = await Promise.all([
            Listing.find(query)
                .populate("sellerId", "name Reg_No")
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum),
            Listing.countDocuments(query), // Total count for pagination metadata
        ]);

        res.json({
            listings,
            pagination: {
                total,                          // Total matching documents
                page: pageNum,                  // Current page
                pages: Math.ceil(total / limitNum), // Total number of pages
                limit: limitNum,
            },
        });
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Fetch single listing
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate("sellerId", "name Reg_No");

        if (listing) {
            res.json(listing);
        } else {
            res.status(404).json({ message: "Listing not found" });
        }
    } catch (error) {
        console.error("Error fetching listing by id:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res) => {
    try {
        const { title, description, price, category } = req.body;

        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        if (listing.sellerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to update this listing" });
        }

        // ── Phase 4 + 5: Upload new images if provided ──────────────────────
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) =>
                uploadToCloudinary(file.buffer, file.mimetype)
            );
            const newUrls = await Promise.all(uploadPromises);
            listing.images = newUrls; // Replace old images with new ones
        }

        listing.title = title || listing.title;
        listing.description = description || listing.description;
        listing.price = price || listing.price;
        listing.category = category || listing.category;

        const updatedListing = await listing.save();
        res.json(updatedListing);
    } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        if (listing.sellerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this listing" });
        }

        await listing.deleteOne();
        res.json({ message: "Listing removed successfully" });
    } catch (error) {
        console.error("Error deleting listing:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing,
};

