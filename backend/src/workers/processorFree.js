require('dotenv').config();
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const mongoose = require('mongoose');

// Import mock services (no external API calls)
const { MockTranscriptionService, MockSummarizationService } = require('../services/mockServices');

// Import models
const Meeting = require('../models/Meeting');

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function processAudioJob(job) {
  const { meetingId, filePath } = job.data;
  
  try {
    console.log(`🔄 Processing meeting ${meetingId} with FREE services...`);
    
    // Update meeting status to transcribing
    await Meeting.findByIdAndUpdate(meetingId, { 
      status: 'transcribing' 
    });

    // Step 1: Transcribe audio using mock service
    console.log(`🎤 Transcribing audio for meeting ${meetingId}...`);
    const transcriptionResult = await MockTranscriptionService.transcribeAudio(filePath);
    
    // Update meeting with transcript
    await Meeting.findByIdAndUpdate(meetingId, {
      transcript: transcriptionResult.text,
      status: 'transcribed'
    });

    // Step 2: Generate summary using mock service
    console.log(`📝 Generating summary for meeting ${meetingId}...`);
    const summaryResult = await MockSummarizationService.generateSummary(transcriptionResult.text);
    
    // Step 3: Save final results
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

    await Meeting.findByIdAndUpdate(meetingId, updateData);
    
    console.log(`✅ Successfully processed meeting ${meetingId} using FREE services`);
    
    // Clean up the audio file (optional)
    try {
      const fs = require('fs');
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up audio file: ${filePath}`);
    } catch (cleanupError) {
      console.warn(`⚠️ Could not clean up audio file: ${cleanupError.message}`);
    }

    return { success: true, meetingId };
    
  } catch (error) {
    console.error(`❌ Failed to process meeting ${meetingId}:`, error.message);
    
    // Update meeting status to failed
    await Meeting.findByIdAndUpdate(meetingId, {
      status: 'failed',
      error: error.message
    });
    
    throw error;
  }
}

// Create worker
const worker = new Worker('transcription', processAudioJob, {
  connection: redis,
  concurrency: 2, // Process up to 2 jobs concurrently
});

// Worker event handlers
worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully (FREE mode)`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

console.log('🚀 FREE Background worker started (no external API calls required)');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down worker...');
  await worker.close();
  await redis.quit();
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down worker...');
  await worker.close();
  await redis.quit();
  await mongoose.connection.close();
  process.exit(0);
});
