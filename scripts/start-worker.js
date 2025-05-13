/* eslint-disable @typescript-eslint/no-var-requires */
// Load environment variables from .env file
require("dotenv").config();

// Register React globally for email template rendering
global.React = require("react");

// Import the server environment validation
try {
  require("../src/env/server.mjs");
} catch (error) {
  console.warn("Environment validation skipped:", error.message);
}

// Verify Redis connection is available or fail early
try {
  const { getRedisUrl } = require("./utils/redis-config");
  // This will throw an error if QUEUE_REDIS_URL is not set
  const redisUrl = getRedisUrl();
  console.log("QUEUE_REDIS_URL verified:", redisUrl.includes("redis://"));
} catch (error) {
  console.error("Error with Redis configuration:", error.message);
  console.error("Please set QUEUE_REDIS_URL environment variable");
  process.exit(1);
}

// Log environment state
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("RESEND_API_KEY available:", !!process.env.RESEND_API_KEY);
console.log("QUEUE_REDIS_URL available:", !!process.env.QUEUE_REDIS_URL);

// If no API key is set, set a development one for local testing
if (
  !process.env.RESEND_API_KEY &&
  (process.env.NODE_ENV === "development" || !process.env.NODE_ENV)
) {
  console.log("Setting fake RESEND_API_KEY for development");
  process.env.RESEND_API_KEY = "re_development_key";
}

// Start the worker with more detailed logging
async function startWorker() {
  console.log("Initializing worker...");

  try {
    // Import the queue and get stats before starting worker
    const { emailQueue, getQueueStats } = require("../src/lib/queue/email");

    // Check if queue has jobs before starting worker
    const stats = await getQueueStats();
    console.log("Queue stats before starting worker:", stats);

    // Start the worker manually instead of just requiring the module
    const { startWorkers } = require("../src/lib/queue/workers/index.ts");
    const worker = startWorkers();

    console.log("Worker started successfully");

    // Add event listeners to the queue to see job events
    emailQueue.on("active", (job) => {
      console.log(`Job ${job.id} has started processing`);
    });

    emailQueue.on("completed", (job) => {
      console.log(`Job ${job.id} has been completed`);
    });

    emailQueue.on("failed", (job, err) => {
      console.log(`Job ${job.id} has failed with error: ${err.message}`);
    });

    // Log queue status every 5 seconds
    setInterval(async () => {
      const currentStats = await getQueueStats();
      console.log("Current queue stats:", currentStats);
    }, 5000);

    return worker;
  } catch (error) {
    console.error("Error starting worker:", error);
    throw error;
  }
}

// Run the worker
startWorker()
  .then(() => console.log("Worker setup complete"))
  .catch((err) => {
    console.error("Worker setup failed:", err);
    process.exit(1);
  });
