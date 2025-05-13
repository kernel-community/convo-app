/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Script to retry a failed job
 * Usage: node scripts/retry-job.js JOB_ID
 */

// Load environment variables
require("dotenv").config();

const Bull = require("bull");
const Redis = require("ioredis");
const { createRedisClient, createQueue } = require("./utils/redis-config");

// Get job ID from command line
const jobId = process.argv[2];

if (!jobId) {
  console.error("Please provide a job ID");
  console.error("Usage: node scripts/retry-job.js JOB_ID");
  process.exit(1);
}

async function main() {
  let redisClient = null;
  let queue = null;

  try {
    // Create Redis connection and queue using the shared utility
    redisClient = createRedisClient();
    queue = createQueue("email-queue");

    // Get the job
    console.log(`Fetching job ${jobId}...`);
    const job = await queue.getJob(jobId);

    if (!job) {
      console.error(`Job ${jobId} not found`);
      process.exit(1);
    }

    // Get job state
    const state = await job.getState();
    console.log(`Job ${jobId} is in state: ${state}`);

    if (state === "failed") {
      console.log("Retrying failed job...");
      await job.retry();
      console.log("Job moved to waiting state");
    } else {
      console.log(
        `Cannot retry job in '${state}' state. Only failed jobs can be retried.`
      );
    }

    // Get updated job status
    const newState = await job.getState();
    console.log(`Job ${jobId} new state: ${newState}`);
  } catch (error) {
    console.error("Error retrying job:", error);
    process.exit(1);
  } finally {
    // Clean up resources
    try {
      if (queue) {
        console.log("Closing Bull queue...");
        await queue.close();
      }

      if (redisClient) {
        console.log("Closing Redis connection...");
        await redisClient.quit();
      }

      console.log("Connections closed");
    } catch (err) {
      console.error("Error closing connections:", err);
    }

    process.exit(0);
  }
}

main();
