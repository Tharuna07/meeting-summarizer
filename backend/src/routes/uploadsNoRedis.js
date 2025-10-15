const express = require("express");
const multer = require("multer");
const path = require("path");
const Meeting = require("../models/Meeting");
const { MockTranscriptionService, MockSummarizationService } = require("../services/mockServices");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
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
      status: 'uploaded'
    });
    await meeting.save();

    // Process immediately without queue (for demo)
    res.status(201).json({ 
      message: "Audio uploaded successfully", 
      meeting: meeting,
      note: "Processing will start automatically"
    });

    // Process in background
    setTimeout(async () => {
      try {
        console.log(`🔄 Processing meeting ${meeting._id}...`);
        
        // Update status to transcribing
        await Meeting.findByIdAndUpdate(meeting._id, { status: 'transcribing' });

        // Step 1: Transcribe audio
        console.log(`🎤 Transcribing audio...`);
        const transcriptionResult = await MockTranscriptionService.transcribeAudio(req.file.path);
        
        // Update with transcript
        await Meeting.findByIdAndUpdate(meeting._id, {
          transcript: transcriptionResult.text,
          status: 'transcribed'
        });

        // Step 2: Generate summary
        console.log(`📝 Generating summary...`);
        const summaryResult = await MockSummarizationService.generateSummary(transcriptionResult.text);
        
        // Save final results
        const updateData = {
          summary: summaryResult.summary,
          decisions: summaryResult.keyDecisions || [],
          actionItems: summaryResult.actionItems || [],
          status: 'completed',
          metadata: {
            language: transcriptionResult.language,
            duration: transcriptionResult.duration,
            keyTopics: summaryResult.keyTopics || [],
            participants: summaryResult.participants || [],
            nextSteps: summaryResult.nextSteps || []
          }
        };

        await Meeting.findByIdAndUpdate(meeting._id, updateData);
        console.log(`✅ Successfully processed meeting ${meeting._id}`);

        // Clean up audio file
        try {
          const fs = require('fs');
          fs.unlinkSync(req.file.path);
          console.log(`🗑️ Cleaned up audio file`);
        } catch (cleanupError) {
          console.warn(`⚠️ Could not clean up audio file: ${cleanupError.message}`);
        }

      } catch (error) {
        console.error(`❌ Failed to process meeting ${meeting._id}:`, error.message);
        await Meeting.findByIdAndUpdate(meeting._id, {
          status: 'failed',
          error: error.message
        });
      }
    }, 1000); // Start processing after 1 second

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
