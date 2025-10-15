const mongoose = require("mongoose");

// schema for action items (e.g., follow-ups, tasks)
const ActionItemSchema = new mongoose.Schema({
  text: String,
  owner: String,
  dueDate: Date,
  completed: { type: Boolean, default: false },
});

// main schema for meeting
const MeetingSchema = new mongoose.Schema({
  title: String,
  filename: String,
  originalName: String,
  uploadDate: { type: Date, default: Date.now },
  audioPath: String,
  transcript: String,
  summary: String,
  decisions: [String],
  actionItems: [ActionItemSchema],
  status: { 
    type: String, 
    enum: ["uploaded", "transcribing", "transcribed", "summarizing", "completed", "failed"],
    default: "uploaded" 
  },
  error: String,
  metadata: {
    language: String,
    duration: Number,
    keyTopics: [String],
    participants: [String],
    nextSteps: [String]
  }
});

// export the model
module.exports = mongoose.model("Meeting", MeetingSchema);
