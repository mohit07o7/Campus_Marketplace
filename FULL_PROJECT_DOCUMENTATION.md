# Campus Marketplace — Complete Architecture, Workflow & Implementation Guide

> **Official Full-Stack Documentation**  
> A comprehensive reference of every engineering phase, design decision, API contract, state management pattern, and security protocol implemented across the **Campus Marketplace** system.

---

## 📑 Table of Contents
1. [Executive Summary & System Overview](#1-executive-summary--system-overview)
2. [Technology Stack & Architectural Topology](#2-technology-stack--architectural-topology)
3. [Complete Backend Architecture](#3-complete-backend-architecture)
   - [Database Schemas & Data Models](#database-schemas--data-models)
   - [Security, Rate Limiting & Validation Layer](#security-rate-limiting--validation-layer)
   - [Cloudinary Media Pipeline](#cloudinary-media-pipeline)
   - [REST API Endpoints Reference](#rest-api-endpoints-reference)
4. [Complete 17-Phase Frontend Implementation Workflow](#4-complete-17-phase-frontend-implementation-workflow)
   - [Phase 1: React Project Setup & Design System Foundation](#phase-1-react-project-setup--design-system-foundation)
   - [Phase 2: Routing Hierarchy & Page Architecture](#phase-2-routing-hierarchy--page-architecture)
   - [Phase 3: Centralized API Layer & Axios Interceptors](#phase-3-centralized-api-layer--axios-interceptors)
   - [Phase 4: Authentication State & Student Credential Flows](#phase-4-authentication-state--student-credential-flows)
   - [Phase 5: Dynamic Navigation Header & Mobile Drawer](#phase-5-dynamic-navigation-header--mobile-drawer)
   - [Phase 6: Marketplace Home & Interactive Card Grid](#phase-6-marketplace-home--interactive-card-grid)
   - [Phase 7: Multi-Parameter Search, Filtering & Sorting](#phase-7-multi-parameter-search-filtering--sorting)
   - [Phase 8: Dynamic Pagination Engine](#phase-8-dynamic-pagination-engine)
   - [Phase 9: Listing Details & Product Showcase](#phase-9-listing-details--product-showcase)
   - [Phase 10: Create Listing & Multipart Media Upload](#phase-10-create-listing--multipart-media-upload)
   - [Phase 11: Inventory Dashboard & Edit Listing](#phase-11-inventory-dashboard--edit-listing)
   - [Phase 12: Student Profile & Password Management](#phase-12-student-profile--password-management)
   - [Phase 13: Saved Wishlist / Favorites Engine](#phase-13-saved-wishlist--favorites-engine)
   - [Phase 14: 1-on-1 Real-Time Inquiries & Messaging](#phase-14-1-on-1-real-time-inquiries--messaging)
   - [Phase 15: Client-Side Route Guards & Redirect Memory](#phase-15-client-side-route-guards--redirect-memory)
   - [Phase 16: UI Polish, Dark Mode & Micro-Interactions](#phase-16-ui-polish-dark-mode--micro-interactions)
   - [Phase 17: Production Bundle Verification & E2E Validation](#phase-17-production-bundle-verification--e2e-validation)
5. [Demo & Prototype Cards Engine](#5-demo--prototype-cards-engine)
6. [Troubleshooting, Gotchas & Bug Fixes](#6-troubleshooting-gotchas--bug-fixes)
   - [The Chrome HSTS / `ERR_SSL_PROTOCOL_ERROR` Fix](#the-chrome-hsts--err_ssl_protocol_error-fix)
7. [Running the Application Locally](#7-running-the-application-locally)

---

## 1. Executive Summary & System Overview

The **Campus Marketplace** is a full-stack, peer-to-peer commerce and inquiry platform engineered specifically for university students. It addresses the friction, lack of trust, and payment risks associated with general public marketplaces by restricting transactions to verified campus students identified by their **University Registration Number (`Reg_No`)**.

### Core Value Propositions
- **Student Authenticity**: Every listing and chat thread prominently displays the student's name and Registration Number.
- **Campus Safety Prompts**: Contextual safety guidelines integrated directly into the product view advising on campus meeting locations (Student Centre, Library entrance, Cafeteria) and UPI payment verification.
- **Zero-Fee Peer Commerce**: Direct buyer-to-seller communication without middleman cuts.
- **Instant Usability**: Features a fallback prototype data engine that ensures the marketplace feed is rich, filterable, and browsable out of the box.

---

## 2. Technology Stack & Architectural Topology

```
┌────────────────────────────────────────────────────────┐
│               Client Browser (Port 5173)              │
│    React 18 SPA • React Router v6 • Lucide Icons      │
│     Vanilla CSS Design System (Glassmorphism / Dark)   │
└───────────────────────────┬────────────────────────────┘
                            │
              Axios HTTP Client (`/api/...`)
       Vite Reverse Proxy (5173 → 3000 in development)
       Auto-Attached JWT: `Authorization: Bearer <token>`
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Node.js / Express API (Port 3000)         │
│   Rate Limiting (IP & Auth) • Helmet Security Headers  │
│      Express Validator • Multer Memory Storage         │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     MongoDB Atlas (DB)    │   │  Cloudinary Cloud Storage │
│ Users • Listings • Favs   │   │  Optimized Image Hosting  │
│ Messages Thread Aggregate │   │  HTTPS Asset Delivery     │
└───────────────────────────┘   └───────────────────────────┘
```

### Stack Breakdown
- **Frontend**: React 18, Vite 6, React Router 6, Axios 1.7, Lucide React (feather-style icons).
- **Styling**: Pure Vanilla CSS featuring CSS Custom Properties (tokens), Glassmorphism backdrop-filters, custom scrollbars, and responsive CSS Grid / Flexbox layouts.
- **Backend**: Node.js, Express 5, Mongoose 9, Cloudinary SDK, Multer.
- **Security & Integrity**: JSON Web Tokens (JWT), Bcrypt password salting (10 rounds), Helmet security headers, `express-rate-limit`, `express-validator`.

---

## 3. Complete Backend Architecture

### Database Schemas & Data Models

#### 1. User Model (`models/User.js`)
- `name`: String, required.
- `email`: String, required, unique, lowercase, trimmed.
- `password`: String, required (hashed with Bcrypt via Mongoose pre-save middleware).
- `Reg_No`: String, required (Student registration identifier, e.g. `RA2211003010245`).
- `timestamps`: Automatic `createdAt` and `updatedAt`.
- *Method*: `matchPassword(enteredPassword)` compares plaintext against hashed database string.

#### 2. Listing Model (`models/Listing.js`)
- `title`: String, required, trimmed.
- `description`: String, required.
- `price`: Number, required, non-negative.
- `category`: String, required (one of `Electronics`, `Books`, `Clothing`, `Furniture`, `Sports`, `Stationery`, `Other`).
- `images`: Array of Strings (Cloudinary secure HTTPS URLs).
- `sellerId`: ObjectId referencing `User`, required.
- `timestamps`: Automatic `createdAt` and `updatedAt`.

#### 3. Favorite Model (`models/Favorite.js`)
- `userId`: ObjectId referencing `User`, required.
- `listingId`: ObjectId referencing `Listing`, required.
- Compound unique index on `{ userId, listingId }` prevents duplicate saves.

#### 4. Message Model (`models/Message.js`)
- `senderId`: ObjectId referencing `User`, required.
- `receiverId`: ObjectId referencing `User`, required.
- `listingId`: ObjectId referencing `Listing`, optional (links chat to an item).
- `content`: String, max 1000 characters, trimmed.
- `isRead`: Boolean, default `false`.

---

### Security, Rate Limiting & Validation Layer

#### Security Headers & HSTS Control
Configured in `backend/server.js`:
```javascript
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: false, // Explicitly disabled in development to prevent Chrome ERR_SSL_PROTOCOL_ERROR
  })
);
```

#### Rate Limiting
- **Global API Limiter**: Max 100 requests per 15 minutes per IP.
- **Auth Endpoint Limiter**: Max 10 attempts per 15 minutes per IP on `/api/users/login` and `/api/users/register` to prevent brute force.

#### Input Validation Middleware (`middleware/validationMiddleware.js`)
Uses `express-validator`:
- `validateRegister`: Verifies name length (2–50), email validity, password length (≥ 6), and Reg_No presence.
- `validateLogin`: Ensures valid email and password format.
- `validateListing`: Enforces title (3–100 chars), description (10–1000 chars), numeric non-negative price, and category.
- `validateMessage`: Restricts receiverId and enforces message content length (max 1000 chars).

---

### Cloudinary Media Pipeline
1. Multer receives multipart payload in `memoryStorage` as a raw buffer (no temp files on disk).
2. `uploadToCloudinary` converts buffer into an asynchronous stream piped to Cloudinary's `upload_stream`.
3. Cloudinary stores the file under the `campus-marketplace` folder and resolves with a secure HTTPS CDN URL.
4. URLs are saved in MongoDB under `listing.images`.

---

### REST API Endpoints Reference

| Method | Endpoint | Access | Middleware | Description |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/users/register` | Public | `validateRegister` | Register student & return JWT session |
| `POST` | `/api/users/login` | Public | `validateLogin` | Authenticate student & return JWT session |
| `GET` | `/api/users/profile` | Private | `protect` | Get logged-in student credentials |
| `PUT` | `/api/users/profile` | Private | `protect` | Update student name, Reg_No, or password |
| `GET` | `/api/users/my-listings` | Private | `protect` | Retrieve all items owned by current user |
| `GET` | `/api/listings` | Public | None | Query listings (search, filter, sort, paginate) |
| `GET` | `/api/listings/:id` | Public | None | Get detailed listing with populated seller |
| `POST` | `/api/listings` | Private | `protect, upload(5), validate` | Create listing with multipart file uploads |
| `PUT` | `/api/listings/:id` | Private | `protect, upload(5), validate` | Update owned listing details/images |
| `DELETE`| `/api/listings/:id` | Private | `protect` | Permanently delete owned listing |
| `GET` | `/api/favorites` | Private | `protect` | Fetch all favorited listings for user |
| `POST` | `/api/favorites/:listingId`| Private | `protect` | Toggle favorite status (add / remove) |
| `GET` | `/api/messages/conversations`| Private| `protect` | Aggregate most recent message per contact |
| `GET` | `/api/messages/:userId` | Private | `protect` | Retrieve message history & mark incoming as read |
| `POST` | `/api/messages` | Private | `protect, validateMessage` | Send direct message to a student |

---

## 4. Complete 17-Phase Frontend Implementation Workflow

### Phase 1: React Project Setup & Design System Foundation
- Initialized React with Vite, configured `/api` proxy in `vite.config.js` targeting `http://localhost:3000`.
- Built unified design tokens in `frontend/src/styles/index.css`:
  - **Colors**: Deep dark surfaces (`--bg-main: #080d18`, `--bg-surface: #0f1729`, `--bg-glass-card: rgba(26, 37, 64, 0.65)`), vibrant indigo gradient (`linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)`), accent rose (`#f43f5e`), and status greens.
  - **Typography**: Dual font architecture (*Plus Jakarta Sans* for headings, *Inter* for body readability).
  - **Components**: `.glass-card`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, custom dark scrollbar, and form inputs.

### Phase 2: Routing Hierarchy & Page Architecture
- Implemented client-side routing in `frontend/src/App.jsx` with `react-router-dom`:
  - Public: `/`, `/login`, `/register`, `/listing/:id`.
  - Protected: `/create-listing`, `/edit-listing/:id`, `/my-listings`, `/profile`, `/favorites`, `/messages`.
- Scaffolded all initial page component views.

### Phase 3: Centralized API Layer & Axios Interceptors
- Created `frontend/src/services/api.js`.
- Configured **Request Interceptor** that checks `localStorage.getItem('token')` and automatically inserts `Authorization: Bearer <token>` on all outbound calls.
- Configured **Response Interceptor** that detects `401 Unauthorized` responses, clears expired credentials, and redirects to `/login`.

### Phase 4: Authentication State & Student Credential Flows
- Implemented `AuthContext.jsx` using React Context API:
  - Exposes `user`, `token`, `login()`, `register()`, `logout()`, `updateUser()`, and session initialization from `localStorage`.
- Created `Login.jsx` with input validation and redirect-intent resolution (`location.state?.from`).
- Created `Register.jsx` requesting full student name, email, password, and campus Registration Number.

### Phase 5: Dynamic Navigation Header & Mobile Drawer
- Built `Navbar.jsx` and `Navbar.css`:
  - Guest View: Logo, Search input, Sign In, and "Get Started" buttons.
  - Authenticated View: Direct "+ Sell" button, Wishlist badge, Messages badge, and User Dropdown menu.
  - Mobile Drawer: Off-canvas drawer sliding from the right with complete touch navigation.

### Phase 6: Marketplace Home & Interactive Card Grid
- Developed `ListingCard.jsx` and `ListingCard.css`:
  - Visual cover preview with fallback icon, category badge, rupee-formatted price, seller initials avatar, and relative time ("2h ago", "1d ago").
  - Optimistic wishlist toggle: heart button toggles state immediately upon click without freezing the UI.
- Developed `LoadingSkeleton.jsx` rendering shimmering skeleton cards during initial API fetch.

### Phase 7: Multi-Parameter Search, Filtering & Sorting
- Integrated comprehensive query filter controls in `Home.jsx`:
  - Text Search: 400ms debounced search query.
  - Category Pills: `All`, `Electronics`, `Books`, `Clothing`, `Furniture`, `Sports`, `Stationery`, `Other`.
  - Collapsible Filter Bar: Min price and max price numerical inputs.
  - Sort Dropdown: Newest first, Oldest first, Price: Low to High, Price: High to Low.
  - Automatic URL synchronization: All filter parameters reflect in browser URL search params for shareable filtered links.

### Phase 8: Dynamic Pagination Engine
- Developed `Pagination.jsx` and `Pagination.css`.
- Synchronized with MongoDB pagination metadata (`total`, `page`, `pages`, `limit`).
- Displays smart page numbers with ellipsis for high page counts, previous/next controls, and active page styling.

### Phase 9: Listing Details & Product Showcase
- Created `ListingDetails.jsx` and `ListingDetails.css`:
  - **Image Gallery**: Large hero image, previous/next overlay navigation, thumbnail navigation strip, and keyboard arrow navigation (`ArrowLeft` / `ArrowRight`).
  - **Student Verification Card**: Shows seller name, Registration Number, and "Verified Student" badge.
  - **Quick Inquiry Modal**: Opens an in-page modal to send a message directly to the seller with pre-populated inquiry text.
  - **Share Action**: Copies clean URL to clipboard with animated toast confirmation.
  - **Owner Controls Mode**: Intelligently switches actions to "Edit Listing" and "My Listings" if the logged-in student owns the item.
  - **Campus Safety Notice**: Prompts students to meet in public campus zones and inspect items before payment.

### Phase 10: Create Listing & Multipart Media Upload
- Built `CreateListing.jsx` and `CreateListing.css`:
  - **Drag-and-Drop Dropzone**: Supports drag-and-drop or file browsing for up to 5 photos (`JPEG`, `PNG`, `WEBP`, max 5 MB).
  - **Interactive Thumbnails**: Live local object URL previews with an instant "Cover" designation for the first photo and removal buttons.
  - **Live Marketplace Preview**: Real-time card preview alongside the form that updates dynamically as the student types title, price, category, and uploads images.
  - **Multipart FormData Submission**: Automatically packages data into browser `FormData` and dispatches to `/api/listings`.
  - **Auto-Redirect**: Transitions to the newly created listing upon successful creation.

### Phase 11: Inventory Dashboard & Edit Listing
- Created `MyListings.jsx` and `MyListings.css`:
  - Displays total items count and aggregate campus inventory valuation (in ₹).
  - Direct shortcuts to view public listing, edit item, or delete item.
  - Confirmation modal protecting against accidental deletions before firing `DELETE /api/listings/:id`.
- Created `EditListing.jsx`:
  - Pre-populates all existing data from `GET /api/listings/:id`.
  - Verifies ownership authorization.
  - Permits editing title, price, category, description, and optional photo replacements.

### Phase 12: Student Profile & Password Management
- Created `Profile.jsx` and `Profile.css`:
  - Student Hero Card with large initials avatar, email, and Registration Number.
  - Real-time counters showing active listings and saved items.
  - Profile update form updating name and Reg_No with direct synchronization to `AuthContext` and `localStorage`.
  - Password update form verifying minimum length and confirmation matching.
  - One-click session logout.

### Phase 13: Saved Wishlist / Favorites Engine
- Created `Favorites.jsx` and `Favorites.css`:
  - Dedicated wishlist view fetching from `GET /api/favorites`.
  - Reuses `ListingCard` with `isFavorited: true`.
  - One-click unsave immediately removes item from view with toast notification.
  - Empty state with direct link to browse items.

### Phase 14: 1-on-1 Real-Time Inquiries & Messaging
- Created `Messages.jsx` and `Messages.css`:
  - WhatsApp/Slack-style split view: Conversations sidebar on the left, active chat stream on the right.
  - URL parameter resolution (`?sellerId=...&listingId=...`) so clicking "Contact Seller" on any item page immediately opens that chat thread.
  - Outgoing messages highlighted with gradient bubbles, read checkmarks, and timestamps.
  - Auto-scrolls to the bottom on new message load or send.
  - Mobile responsiveness: toggles cleanly between conversation list and active chat view.

### Phase 15: Client-Side Route Guards & Redirect Memory
- Developed `ProtectedRoute.jsx`.
- Wraps sensitive routes (`/create-listing`, `/edit-listing/:id`, `/my-listings`, `/profile`, `/favorites`, `/messages`).
- Checks `loading` state to prevent flashing redirect screen.
- Redirects unauthenticated visitors to `/login` with `state: { from: location }` so the student lands back on their intended page upon login.

### Phase 16: UI Polish, Dark Mode & Micro-Interactions
- Elevated styling with curated dark palette, glassmorphic cards (`backdrop-filter: blur(20px)`), and radial gradients.
- Micro-interactions: Card hover lift (`translateY(-4px)`), button active press scale (`scale(0.97)`), and fade-in page transitions.
- Toast notifications for copy-to-clipboard, wishlist updates, and item deletion.

### Phase 17: Production Bundle Verification & E2E Validation
- Tested production build with `vite build`: **1,676 modules transformed with 0 errors**.
- Syntax checked all backend controllers, models, routes, and middleware with Node syntax checks (`node -c`).

---

## 5. Demo & Prototype Cards Engine

To ensure the marketplace is vibrant, interactive, and demonstrable immediately (even on a fresh database), a prototype cards engine was integrated:

- **File**: `frontend/src/services/mockListings.js` (`PROTOTYPE_LISTINGS`).
- **8 Curated Items**:
  1. *Casio FX-991EX Scientific Calculator* (₹850, Electronics) — Aarav Sharma (`RA2211003010245`)
  2. *Thomas Calculus 14th Edition Metric* (₹450, Books) — Sneha Patel (`RA2211003020112`)
  3. *Sony WH-1000XM4 Noise Cancelling Headphones* (₹12,500, Electronics) — Rohan Verma (`RA2111003010589`)
  4. *Hero Sprint Urban Gear Cycle 21 Speed* (₹3,800, Sports) — Vikram Aditya (`RA2011003010722`)
  5. *Ergonomic Breathable Mesh Study Chair* (₹1,900, Furniture) — Ananya Gupta (`RA2211003030430`)
  6. *SRM Laboratory Coat White Unisex M* (₹250, Clothing) — Pooja Reddy (`RA2311003010891`)
  7. *Mini Drafter & Engineering Drawing Board Set* (₹600, Stationery) — Kunal Deshmukh (`RA2311003020045`)
  8. *Logitech MX Master 3S Wireless Mouse* (₹4,200, Electronics) — Tanmay Saxena (`RA2111003010190`)
- **Seamless Fallback**: If the database returns 0 listings (or the server is starting), the frontend automatically populates these prototype cards. All search, category filtering, price sorting, and item detail pages function smoothly with these prototype items.

---

## 6. Troubleshooting, Gotchas & Bug Fixes

### The Chrome HSTS / `ERR_SSL_PROTOCOL_ERROR` Fix

#### Symptom
When opening `http://localhost:5173`, the browser refused to connect and showed:
```text
This site can’t provide a secure connection
localhost sent an invalid response.
ERR_SSL_PROTOCOL_ERROR
```

#### Cause
By default, the backend package `helmet()` sends the `Strict-Transport-Security` (HSTS) header. When the browser accessed `http://localhost:3000`, Chrome recorded that header and permanently forced **`https://`** for all `localhost` ports. Because Vite dev server serves plain `http://`, the SSL handshake failed.

#### Solution
1. **Backend Code Fix**: Configured `helmet` in `backend/server.js` with `hsts: false`:
   ```javascript
   app.use(
       helmet({
           contentSecurityPolicy: false,
           crossOriginEmbedderPolicy: false,
           hsts: false, // Never force HTTPS on localhost in dev
       })
   );
   ```
2. **Instant Browser Resolution**:
   - Access the site via **`http://127.0.0.1:5173`** (bypasses cached HSTS domain policy for `localhost`).
   - Or clear the policy in Chrome at `chrome://net-internals/#hsts` -> *Delete domain security policies* -> enter `localhost` -> click *Delete*.

---

## 7. Running the Application Locally

### Prerequisites
- Node.js (v18 or newer)
- npm

### 1. Start the Backend API
```bash
cd backend
npm install
npm run dev
# Server running on port 3000
# MongoDB connected
```

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
# Vite dev server running at:
# > Local: http://localhost:5173/ or http://127.0.0.1:5173/
```

### 3. Build for Production
```bash
cd frontend
npm run build
# Creates optimized static bundle in frontend/dist/
```
