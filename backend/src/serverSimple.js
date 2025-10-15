const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory storage for demo
let meetings = [];

// API routes
app.get("/api/meetings", (req, res) => {
  res.json({ meetings });
});

app.post("/api/uploads", (req, res) => {
  // Simulate file upload
  const meeting = {
    _id: Date.now().toString(),
    title: "Demo Meeting",
    status: "uploaded",
    uploadDate: new Date().toISOString(),
    transcript: "This is a demo transcript for testing purposes.",
    summary:
      "This was a demo meeting to test the Meeting Summarizer application.",
    decisions: ["Test the application", "Verify functionality"],
    actionItems: [
      {
        _id: "1",
        text: "Complete application testing",
        owner: "Demo User",
        dueDate: "2024-10-20",
        completed: false,
      },
    ],
    metadata: {
      language: "en-US",
      duration: 300,
      keyTopics: ["Testing", "Demo"],
      participants: ["Demo User"],
      nextSteps: ["Continue testing"],
    },
  };

  meetings.unshift(meeting);

  res.json({
    message: "Demo meeting created successfully!",
    meeting: meeting,
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Simple server running at http://localhost:${PORT}`);
  console.log(`📝 Demo mode - no database required!`);
});
