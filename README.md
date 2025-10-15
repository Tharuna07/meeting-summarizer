# 🎙️ Meeting Summarizer

An AI-powered application that transcribes meeting audio files and generates comprehensive summaries with action items using OpenAI's Whisper and GPT models.

## ✨ Features

- **Audio Transcription**: Upload audio files (MP3, MP4, M4A, WAV, OGG) and get accurate transcriptions using OpenAI Whisper
- **AI-Powered Summarization**: Generate intelligent summaries with key decisions and action items using GPT-4
- **Action Item Tracking**: Track and manage follow-up tasks with due dates and owners
- **Real-time Processing**: Background job queue for handling large files efficiently
- **Modern Web Interface**: Clean, responsive React frontend for easy interaction
- **RESTful API**: Complete backend API for integration and extensibility

## 🏗️ Architecture

### Backend (Node.js + Express)

- **API Server**: Express.js with MongoDB for data persistence
- **Audio Processing**: OpenAI Whisper API for speech-to-text
- **AI Summarization**: GPT-4 for intelligent content analysis
- **Job Queue**: BullMQ with Redis for background processing
- **File Handling**: Multer for audio file uploads

### Frontend (React)

- **Upload Interface**: Drag-and-drop audio file upload
- **Meeting Dashboard**: View all meetings and their processing status
- **Summary Display**: Rich presentation of transcripts, summaries, and action items
- **Action Management**: Interactive checkboxes for task completion

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local or cloud instance)
3. **Redis** (for job queue)
4. **OpenAI API Key** (get from [OpenAI Platform](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd meeting-summarizer
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment**

   ```bash
   # Copy the example environment file
   cp backend/env.example backend/.env

   # Edit backend/.env with your configuration:
   # - MONGO_URI: Your MongoDB connection string
   # - OPENAI_API_KEY: Your OpenAI API key
   # - REDIS_URL: Your Redis connection string
   ```

5. **Start Services**

   ```bash
   # Terminal 1: Start MongoDB and Redis
   # Make sure MongoDB is running on localhost:27017
   # Make sure Redis is running on localhost:6379

   # Terminal 2: Start the backend server
   cd backend
   npm run dev

   # Terminal 3: Start the background worker
   cd backend
   npm run worker

   # Terminal 4: Start the frontend
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## 📁 Project Structure

```
meeting-summarizer/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── Meeting.js          # MongoDB schema
│   │   ├── routes/
│   │   │   ├── uploads.js          # File upload endpoints
│   │   │   └── meetings.js         # Meeting CRUD endpoints
│   │   ├── services/
│   │   │   ├── transcriptionService.js  # OpenAI Whisper integration
│   │   │   └── summarizationService.js  # GPT summarization
│   │   ├── workers/
│   │   │   ├── queue.js            # Job queue setup
│   │   │   └── processor.js        # Background worker
│   │   └── server.js               # Express server
│   ├── uploads/                    # Temporary audio storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js                  # Main React component
│   │   ├── App.css                 # Styling
│   │   └── index.js                # React entry point
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**

```env
MONGO_URI=mongodb://localhost:27017/meeting-summarizer
PORT=4000
OPENAI_API_KEY=your_openai_api_key_here
REDIS_URL=redis://localhost:6379
MAX_FILE_SIZE=50000000
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/ogg
```

### API Endpoints

| Method | Endpoint                                   | Description          |
| ------ | ------------------------------------------ | -------------------- |
| POST   | `/api/uploads`                             | Upload audio file    |
| GET    | `/api/meetings`                            | Get all meetings     |
| GET    | `/api/meetings/:id`                        | Get specific meeting |
| PUT    | `/api/meetings/:id/action-items/:actionId` | Update action item   |
| DELETE | `/api/meetings/:id`                        | Delete meeting       |
| GET    | `/api/meetings/stats/queue`                | Get queue statistics |

## 🎯 Usage

### 1. Upload Audio

- Navigate to the web interface
- Click "Choose File" and select an audio file
- The file will be uploaded and queued for processing

### 2. Monitor Processing

- View the processing status in the meetings list
- Status updates: `uploaded` → `transcribing` → `completed`

### 3. Review Results

- Click on a completed meeting to view:
  - **Summary**: AI-generated overview
  - **Key Decisions**: Important decisions made
  - **Action Items**: Tasks with owners and due dates
  - **Full Transcript**: Complete meeting transcript

### 4. Manage Action Items

- Check off completed tasks
- Add new action items manually
- Track progress and follow-ups

## 🔍 Processing Flow

1. **Upload**: Audio file uploaded via web interface
2. **Queue**: File added to background processing queue
3. **Transcription**: OpenAI Whisper converts audio to text
4. **Summarization**: GPT-4 analyzes transcript and generates summary
5. **Storage**: Results saved to MongoDB
6. **Display**: Frontend shows processed results

## 🛠️ Development

### Running in Development Mode

```bash
# Backend with auto-reload
cd backend && npm run dev

# Background worker
cd backend && npm run worker

# Frontend with hot-reload
cd frontend && npm start
```

### Testing

```bash
# Test backend endpoints
curl -X POST http://localhost:4000/api/uploads \
  -F "audio=@test-meeting.mp3" \
  -F "title=Test Meeting"
```

## 🚀 Deployment

### Docker Deployment (Recommended)

1. **Create Dockerfile for backend**
2. **Use MongoDB Atlas for database**
3. **Use Redis Cloud for job queue**
4. **Deploy frontend to Vercel/Netlify**
5. **Deploy backend to Railway/Heroku**

### Environment Setup

- **Production MongoDB**: Use MongoDB Atlas
- **Production Redis**: Use Redis Cloud or AWS ElastiCache
- **OpenAI API**: Ensure sufficient credits
- **File Storage**: Consider AWS S3 for production

## 📊 Performance Considerations

- **File Size**: Max 25MB per file (OpenAI Whisper limit)
- **Processing Time**: ~1-2 minutes per 10 minutes of audio
- **Concurrent Jobs**: Configurable worker concurrency
- **Storage**: Audio files cleaned up after processing

## 🔒 Security

- **API Keys**: Store securely in environment variables
- **File Upload**: Validate file types and sizes
- **CORS**: Configure for production domains
- **Rate Limiting**: Consider implementing for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **"OpenAI API Key not found"**

   - Ensure your `.env` file has the correct API key
   - Check that the key has sufficient credits

2. **"MongoDB connection failed"**

   - Ensure MongoDB is running
   - Check the connection string in `.env`

3. **"Redis connection failed"**

   - Ensure Redis is running
   - Check the Redis URL in `.env`

4. **"File upload fails"**
   - Check file size (max 25MB)
   - Verify supported audio format

### Support

For issues and questions:

1. Check the troubleshooting section
2. Review the logs in the terminal
3. Open an issue on GitHub

## 🎥 Demo

[Add your demo video link here once created]

---

**Built with ❤️ using Node.js, React, OpenAI, MongoDB, and Redis**
