require("dotenv").config();
const connectDB = require("./config/db");

const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/users", require("./routes/authRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));

app.get("/", (req, res) => {
    res.send("Campus Marketplace API Running");
});

// ── Global Error Handler (must be LAST, after all routes) ─────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();