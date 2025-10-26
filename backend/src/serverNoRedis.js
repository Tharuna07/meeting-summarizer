require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// routes
const uploadsRoute = require("./routes/uploadsNoRedis");
const meetingsRoute = require("./routes/meetings");

const app = express();
app.use(cors());
app.use(express.json());

// serve uploaded audio files (for dev/testing)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// API routes
app.use("/api/uploads", uploadsRoute);
app.use("/api/meetings", meetingsRoute);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
}
start();
