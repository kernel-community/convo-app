/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Script to show detailed information about jobs in the queue
 * Usage: node scripts/show-jobs.js [active|waiting|failed|delayed|completed|all]
 */

// Load environment variables
require("dotenv").config();

const Bull = require("bull");
const Redis = require("ioredis");
const { createRedisClient, createQueue } = require("./utils/redis-config");

// Get job type from command line
const jobType = process.argv[2] || "all";
const validTypes = [
  "active",
  "waiting",
  "failed",
  "delayed",
  "completed",
  "all",
];

if (!validTypes.includes(jobType)) {
  console.error(`Invalid job type: ${jobType}`);
  console.error(`Usage: node scripts/show-jobs.js [${validTypes.join("|")}]`);
  process.exit(1);
}

// Helper function to format job data
const formatJobData = (job) => {
  try {
    const details = {
      id: job.id,
      state: job.state,
      attemptsMade: job.attemptsMade,
      timestamp: new Date(job.timestamp).toLocaleString(),
      // Try to extract relevant info from different job data structures
      to:
        job.data.receiver?.email ||
        (job.data.receiver && typeof job.data.receiver === "string"
          ? job.data.receiver
          : null) ||
        (job.data.emailOptions?.to
          ? job.data.emailOptions.to.join(", ")
          : null) ||
        "Unknown",
      type: job.data.type || "Unknown",
    };

    // Add delay info if available
    if (job.delay) {
      details.delayUntil = new Date(job.timestamp + job.delay).toLocaleString();
      details.delayMs = job.delay;
    }

    // Add failure info if available
    if (job.failedReason) {
      details.failedReason = job.failedReason;
    }

    return details;
  } catch (error) {
    console.error("Error formatting job data:", error);
    return { id: job.id, error: "Failed to parse job data", rawData: job.data };
  }
};

async function main() {
  let redisClient = null;
  let queue = null;

  try {
    // Create Redis connection and queue using the shared utility
    redisClient = createRedisClient();
    queue = createQueue("email-queue");

    // Get jobs based on type
    let jobs = [];
    if (jobType === "all") {
      // Get jobs by various types
      const activeJobs = await queue.getJobs(["active"]);
      const waitingJobs = await queue.getJobs(["waiting"]);
      const delayedJobs = await queue.getJobs(["delayed"]);
      const failedJobs = await queue.getJobs(["failed"]);
      const completedJobs = await queue.getJobs(["completed"], 0, 10); // Only get the 10 most recent completed jobs

      jobs = [
        ...activeJobs.map((job) => ({ ...job, state: "active" })),
        ...waitingJobs.map((job) => ({ ...job, state: "waiting" })),
        ...delayedJobs.map((job) => ({ ...job, state: "delayed" })),
        ...failedJobs.map((job) => ({ ...job, state: "failed" })),
        ...completedJobs.map((job) => ({ ...job, state: "completed" })),
      ];
    } else {
      jobs = await queue.getJobs([jobType]);
      jobs = jobs.map((job) => ({ ...job, state: jobType }));
    }

    // Sort jobs by timestamp (newest first)
    jobs.sort((a, b) => b.timestamp - a.timestamp);

    console.log(`\nFound ${jobs.length} jobs in ${jobType} state\n`);

    // Display job details
    for (const job of jobs) {
      const details = formatJobData(job);
      console.log(
        `${details.state.toUpperCase()} JOB #${details.id} (${
          details.timestamp
        })`
      );
      console.log(`  To: ${details.to}`);
      console.log(`  Type: ${details.type}`);
      console.log(`  Attempts: ${details.attemptsMade}`);

      if (details.delayUntil) {
        console.log(
          `  Delayed until: ${details.delayUntil} (${details.delayMs}ms)`
        );
      }

      if (details.failedReason) {
        console.log(`  Failed reason: ${details.failedReason}`);
      }

      console.log();
    }

    // Get queue stats
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    console.log("\nQueue Stats:");
    console.log("============");
    console.log(`- Waiting: ${waiting}`);
    console.log(`- Active: ${active}`);
    console.log(`- Completed: ${completed}`);
    console.log(`- Failed: ${failed}`);
    console.log(`- Delayed: ${delayed}`);
    console.log(`- Total: ${waiting + active + completed + failed + delayed}`);
  } catch (error) {
    console.error("Error getting job details:", error);
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
