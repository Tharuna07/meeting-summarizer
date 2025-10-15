const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class TranscriptionService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(filePath) {
    try {
      console.log(`🎤 Starting transcription for: ${filePath}`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Audio file not found: ${filePath}`);
      }

      // Create a readable stream from the file
      const audioFile = fs.createReadStream(filePath);
      
      // Transcribe using OpenAI Whisper API
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'verbose_json',
        language: 'en', // You can make this configurable
        temperature: 0.0, // More deterministic output
      });

      console.log(`✅ Transcription completed for: ${filePath}`);
      
      return {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        segments: transcription.segments || []
      };
    } catch (error) {
      console.error('❌ Transcription failed:', error.message);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  // Helper method to validate audio file
  validateAudioFile(filePath) {
    const allowedExtensions = ['.mp3', '.mp4', '.m4a', '.wav', '.ogg'];
    const ext = path.extname(filePath).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Unsupported audio format: ${ext}`);
    }

    // Check file size (max 25MB for OpenAI Whisper)
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    if (fileSizeInMB > 25) {
      throw new Error(`File too large: ${fileSizeInMB.toFixed(2)}MB (max 25MB)`);
    }

    return true;
  }
}

module.exports = new TranscriptionService();
