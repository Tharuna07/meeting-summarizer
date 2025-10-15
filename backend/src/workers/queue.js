const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Create the transcription queue
const transcriptionQueue = new Queue('transcription', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10, // Keep last 10 completed jobs
    removeOnFail: 50,     // Keep last 50 failed jobs
    attempts: 3,          // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Function to add a job to the queue
function addToQueue(jobData) {
  return transcriptionQueue.add('process-audio', jobData, {
    priority: 1, // Higher priority for new uploads
  });
}

// Function to get queue statistics
async function getQueueStats() {
  const waiting = await transcriptionQueue.getWaiting();
  const active = await transcriptionQueue.getActive();
  const completed = await transcriptionQueue.getCompleted();
  const failed = await transcriptionQueue.getFailed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
  };
}

// Function to clean up old jobs
async function cleanupQueue() {
  await transcriptionQueue.clean(24 * 60 * 60 * 1000, 100); // Clean jobs older than 24 hours
}

module.exports = {
  transcriptionQueue,
  addToQueue,
  getQueueStats,
  cleanupQueue,
};
