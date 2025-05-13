/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Script to fix jobs stuck in active state
 * Usage: node scripts/fix-stuck-jobs.js [reset|complete|remove]
 */

// Load environment variables
require("dotenv").config();
const { createRedisClient, createQueue } = require("./utils/redis-config");

// Get action from command line
const action = process.argv[2] || "reset";
if (!["reset", "complete", "remove"].includes(action)) {
  console.error("Invalid action. Must be one of: reset, complete, remove");
  console.error(
    "Usage: node scripts/fix-stuck-jobs.js [reset|complete|remove]"
  );
  process.exit(1);
}

async function main() {
  let redisClient = null;
  let queue = null;

  try {
    // Create Redis connection and queue using the shared utility
    redisClient = createRedisClient();
    queue = createQueue("email-queue");

    // Get all active jobs
    console.log("Fetching active jobs...");
    const activeJobs = await queue.getJobs(["active"]);

    console.log(`Found ${activeJobs.length} active jobs`);

    if (activeJobs.length === 0) {
      console.log("No active jobs to fix");
      return;
    }

    // Clean up stuck jobs before processing individual jobs
    if (action === "reset") {
      console.log("Cleaning all stuck jobs...");
      // Clean jobs that have been stuck in the active state for more than 10 seconds
      await queue.clean(10000, "active");
      console.log("Stuck jobs cleanup completed");
    }

    // Process each job based on action
    for (const job of activeJobs) {
      console.log(`Processing job ${job.id}...`);

      switch (action) {
        case "reset":
          // Move job back to waiting state
          console.log(`Resetting job ${job.id} to waiting state`);
          // Use an alternative approach since moveToWaiting doesn't exist
          // Either retry the job or recreate it
          await job.discard(); // Release the job from active state
          await queue.add(job.data, {
            jobId: job.id,
            removeOnComplete: job.opts.removeOnComplete,
            removeOnFail: job.opts.removeOnFail,
            attempts: job.opts.attempts,
            backoff: job.opts.backoff,
            priority: job.opts.priority,
          });
          break;

        case "complete":
          // Mark job as completed
          console.log(`Marking job ${job.id} as completed`);
          await job.moveToCompleted(
            "Manually completed to fix stuck job",
            true
          );
          break;

        case "remove":
          // Remove job completely
          console.log(`Removing job ${job.id}`);
          await job.remove();
          break;
      }

      console.log(`Job ${job.id} processed`);
    }

    // Get final queue state
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

    console.log(`\nSuccessfully ${action}ed ${activeJobs.length} jobs`);
  } catch (error) {
    console.error("Error fixing stuck jobs:", error);
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
