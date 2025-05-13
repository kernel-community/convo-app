/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Script to reset only active jobs
 * Usage: node scripts/reset-active-jobs.js
 */

// Load environment variables
require("dotenv").config();

const Bull = require("bull");
const Redis = require("ioredis");
const { createRedisClient, createQueue } = require("./utils/redis-config");

async function main() {
  let redisClient = null;
  let queue = null;

  try {
    // Create Redis connection and queue using the shared utility
    redisClient = createRedisClient();
    queue = createQueue("email-queue");

    // Check only active jobs
    console.log("Checking active jobs...");
    const activeJobs = await queue.getJobs(["active"]);

    console.log(`Found ${activeJobs.length} active jobs`);

    if (activeJobs.length === 0) {
      console.log("No active jobs to reset");
      return;
    }

    // Option to resume or reset stalled jobs
    for (const job of activeJobs) {
      console.log(`Job ${job.id} details:`);
      console.log(`- Attempt: ${job.attemptsMade}`);
      console.log(`- Added: ${new Date(job.timestamp).toISOString()}`);
      console.log(`- Data: ${JSON.stringify(job.data).substring(0, 100)}...`);

      // Calculate how long the job has been active
      const now = Date.now();
      const activeTime = now - job.processedOn;
      console.log(`- Active for: ${activeTime / 1000} seconds`);

      // If the job has been active for more than 30 seconds, it's likely stuck
      if (activeTime > 30000) {
        console.log(`Job ${job.id} appears stuck, resetting...`);
        try {
          // First try to update the job's state directly in Redis
          await redisClient.lrem(`bull:email-queue:active`, 1, job.id);
          await redisClient.lpush(`bull:email-queue:wait`, job.id);
          console.log(`Moved job ${job.id} from active to waiting state`);
        } catch (err) {
          console.error(`Failed to reset job ${job.id} in Redis:`, err);

          // Fallback: mark as failed so it can be retried by Bull
          try {
            await job.moveToFailed(
              new Error("Manually reset due to being stuck"),
              true
            );
            console.log(`Moved job ${job.id} to failed state for retry`);
          } catch (failErr) {
            console.error(`Failed to mark job ${job.id} as failed:`, failErr);
          }
        }
      } else {
        console.log(
          `Job ${job.id} hasn't been active long enough to be considered stuck`
        );
      }
    }

    // Get queue stats after cleaning
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    console.log("\nFinal queue state:");
    console.log(`- Waiting: ${waiting}`);
    console.log(`- Active: ${active}`);
    console.log(`- Completed: ${completed}`);
    console.log(`- Failed: ${failed}`);
    console.log(`- Delayed: ${delayed}`);
    console.log(`- Total: ${waiting + active + completed + failed + delayed}`);
  } catch (error) {
    console.error("Error resetting active jobs:", error);
    process.exit(1);
  } finally {
    // Clean up resources
    try {
      if (queue) {
        console.log("\nClosing Bull queue...");
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
