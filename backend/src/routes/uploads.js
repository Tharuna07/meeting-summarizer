const express = require("express");
const multer = require("multer");
const path = require("path");
const Meeting = require("../models/Meeting");
const { addToQueue } = require("../workers/queue");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// POST /api/uploads
router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const { title } = req.body;

    // Save meeting metadata
    const meeting = new Meeting({
      title: title || req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      audioPath: req.file.path,
    });
    await meeting.save();

    // Add transcription job to the queue
    addToQueue({ meetingId: meeting._id, filePath: req.file.path });

    res
      .status(201)
      .json({ message: "Audio uploaded & queued for transcription", meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
