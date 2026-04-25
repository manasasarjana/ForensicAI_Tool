const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Redis Connection
const connection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Setup Queues
const reportQueue = new Queue('ReportGeneration', { connection });
const evidenceHashQueue = new Queue('EvidenceVerification', { connection });

module.exports = {
  connection,
  reportQueue,
  evidenceHashQueue
};
