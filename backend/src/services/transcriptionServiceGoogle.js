const speech = require('@google-cloud/speech');
const fs = require('fs');

class GoogleTranscriptionService {
  constructor() {
    // Initialize Google Cloud Speech client
    // You can use Application Default Credentials or service account key
    this.client = new speech.SpeechClient({
      // Option 1: Use environment variable GOOGLE_APPLICATION_CREDENTIALS
      // Option 2: Use service account key file
      // keyFilename: 'path/to/service-account-key.json',
    });
  }

  async transcribeAudio(filePath) {
    try {
      console.log(`🎤 Starting Google Speech-to-Text for: ${filePath}`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Audio file not found: ${filePath}`);
      }

      // Read the audio file
      const audioBytes = fs.readFileSync(filePath).toString('base64');

      // Configure the request
      const audio = {
        content: audioBytes,
      };

      const config = {
        encoding: this.detectEncoding(filePath),
        sampleRateHertz: 16000, // Adjust based on your audio
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'latest_long', // Best for longer audio
      };

      const request = {
        audio: audio,
        config: config,
      };

      // Perform the transcription
      const [response] = await this.client.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      console.log(`✅ Google transcription completed for: ${filePath}`);
      
      return {
        text: transcription,
        language: 'en-US',
        confidence: response.results[0]?.alternatives[0]?.confidence || 0.9,
        segments: response.results.map(result => ({
          text: result.alternatives[0].transcript,
          confidence: result.alternatives[0].confidence,
          startTime: result.alternatives[0].words?.[0]?.startTime?.seconds || 0,
          endTime: result.alternatives[0].words?.slice(-1)[0]?.endTime?.seconds || 0
        }))
      };
    } catch (error) {
      console.error('❌ Google transcription failed:', error.message);
      throw new Error(`Google transcription failed: ${error.message}`);
    }
  }

  detectEncoding(filePath) {
    const ext = filePath.toLowerCase().split('.').pop();
    const encodingMap = {
      'wav': 'LINEAR16',
      'mp3': 'MP3',
      'mp4': 'MP4',
      'm4a': 'MP4',
      'ogg': 'OGG_OPUS',
      'flac': 'FLAC'
    };
    return encodingMap[ext] || 'WEBM_OPUS';
  }

  validateAudioFile(filePath) {
    const allowedExtensions = ['.mp3', '.mp4', '.m4a', '.wav', '.ogg', '.flac'];
    const ext = path.extname(filePath).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Unsupported audio format: ${ext}`);
    }

    // Google Speech-to-Text has a 60MB limit for synchronous requests
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    if (fileSizeInMB > 60) {
      throw new Error(`File too large: ${fileSizeInMB.toFixed(2)}MB (max 60MB)`);
    }

    return true;
  }
}

module.exports = new GoogleTranscriptionService();
