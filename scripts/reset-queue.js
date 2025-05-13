/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Script to reset the queue counters and clean up jobs
 * Usage: node scripts/reset-queue.js
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

    // Get queue stats before cleaning
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    console.log("\nCurrent queue state:");
    console.log(`- Waiting: ${waiting}`);
    console.log(`- Active: ${active}`);
    console.log(`- Completed: ${completed}`);
    console.log(`- Failed: ${failed}`);
    console.log(`- Delayed: ${delayed}`);
    console.log(`- Total: ${waiting + active + completed + failed + delayed}`);

    // Clear all jobs - remove everything
    console.log("\nClearing all jobs...");
    await queue.clean(0, "active");
    await queue.clean(0, "completed");
    await queue.clean(0, "failed");
    await queue.clean(0, "delayed");
    await queue.clean(0, "wait");

    // Reset all queue metrics in Redis
    console.log("Resetting queue metrics...");
    const keys = await redisClient.keys("bull:email-queue:*");
    for (const key of keys) {
      if (key.includes("stats")) {
        await redisClient.del(key);
      }
    }

    // Pause then resume the queue to reset its state
    console.log("Pausing queue...");
    await queue.pause(true);
    console.log("Resuming queue...");
    await queue.resume();

    console.log("\nQueue has been completely reset!");

    // Get queue stats after cleaning
    const [newWaiting, newActive, newCompleted, newFailed, newDelayed] =
      await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);

    console.log("\nFinal queue state:");
    console.log(`- Waiting: ${newWaiting}`);
    console.log(`- Active: ${newActive}`);
    console.log(`- Completed: ${newCompleted}`);
    console.log(`- Failed: ${newFailed}`);
    console.log(`- Delayed: ${newDelayed}`);
    console.log(
      `- Total: ${
        newWaiting + newActive + newCompleted + newFailed + newDelayed
      }`
    );
  } catch (error) {
    console.error("Error resetting queue:", error);
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
