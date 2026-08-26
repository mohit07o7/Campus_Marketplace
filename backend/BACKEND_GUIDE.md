# Campus Marketplace Backend Guide

This document outlines the step-by-step implementation for the remaining features of the MVP. Follow these instructions to build out the system module by module.

---

## Phase 4: Listings Module (Core CRUD)
This phase allows users to create and manage their marketplace items.

### 1. Controller (`controllers/listingController.js`)
Create the following route handlers:

- **Create Listing (`POST`)**
  - Extract `title`, `description`, `price`, `category`, and `images` from `req.body`. 
  - Use `req.user._id` (available from the `protect` middleware) as the `sellerId`. 
  - Save to the database using `Listing.create()`.

- **Get All Listings (`GET`)**
  - Use `Listing.find({})` to return all available items.

- **Get Single Listing (`GET`)**
  - Use `Listing.findById(req.params.id)`. 
  - Populate the `sellerId` field to return the seller's name and college: `.populate("sellerId", "name college")`.

- **Update Listing (`PUT`)**
  - Find the listing by ID. 
  - **Crucial check:** Ensure `listing.sellerId.toString() === req.user._id.toString()` before updating to prevent users from editing other people's listings.

- **Delete Listing (`DELETE`)**
  - Similar to update, verify ownership before calling `.deleteOne()` or `.findByIdAndDelete()`.

### 2. Routes (`routes/listingRoutes.js`)
- Import express router and the controller functions.
- Define your endpoints:
  - `router.post("/", protect, createListing)`
  - `router.get("/", getListings)`
  - `router.get("/:id", getListingById)`
  - `router.put("/:id", protect, updateListing)`
  - `router.delete("/:id", protect, deleteListing)`

### 3. Server Integration (`server.js`)
- Mount the routes: `app.use("/api/listings", require("./routes/listingRoutes"));`

---

## Phase 5: Image Uploads (Cloudinary)
You need images before you can fully finish the Listing creation endpoint.

### 1. Setup Dependencies
Run: `npm install cloudinary multer multer-storage-cloudinary`

### 2. Configure Cloudinary (`config/cloudinary.js`)
- Import `v2` from `cloudinary`.
- Use `cloudinary.config()` to pass your `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` from your `.env` file.
- Set up `multer` storage using `CloudinaryStorage`, specifying the allowed formats (e.g., `jpg`, `png`) and the folder name in your Cloudinary dashboard.

### 3. Integration
- **Option A:** Create a dedicated `POST /api/upload` endpoint that uploads the image and returns a URL string (which the frontend then passes to the `POST /api/listings` endpoint).
- **Option B:** Inject the multer middleware directly into your `POST /api/listings` route so image upload and listing creation happen in one request.

---

## Phase 6 & 9: Search, Filter, and Pagination
Modify your `Get All Listings` controller function in `listingController.js` to handle query strings dynamically.

### 1. Search & Filter Logic
- Extract `req.query.search` and `req.query.category`.
- Build a dynamic query object:
  ```javascript
  const query = {};
  if (req.query.category) {
      query.category = req.query.category;
  }
  if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" }; // Case-insensitive search
  }
  ```

### 2. Pagination Logic
- Extract `page` (default to 1) and `limit` (default to 10) from `req.query`.
- Calculate the `skip` value: `const skip = (page - 1) * limit;`
- Apply to your mongoose query: `Listing.find(query).skip(skip).limit(Number(limit))`

---

## Phase 8: Security Best Practices
Before you deploy, lock down the API to prevent spam and vulnerabilities.

### 1. Setup Dependencies
Run: `npm install helmet express-rate-limit`

### 2. Implementation (`server.js`)
- **Helmet:** Add `app.use(helmet())` near the top of your middleware stack to secure HTTP headers.
- **Rate Limiting:** Configure rate limiting to prevent spam (especially on auth routes):
  ```javascript
  const rateLimit = require("express-rate-limit");
  const limiter = rateLimit({ 
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use("/api", limiter); // Apply to all API routes
  ```

---

*This guide serves as a reference point. If you encounter any bugs or need help implementing a specific function, just refer back here or ask for assistance!*
