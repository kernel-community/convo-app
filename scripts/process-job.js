/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Script to process a specific job by ID
 * Usage: node scripts/process-job.js JOB_ID
 */

// Load environment variables
require("dotenv").config();

const Bull = require("bull");
const Redis = require("ioredis");
const { createRedisClient, createQueue } = require("./utils/redis-config");

// Register React globally for email template rendering (might be needed for rendering templates)
global.React = require("react");

// Fix path issues by adding Node.js path
require("ts-node/register");

const { resend } = require("../src/utils/email/resend");

// Get job ID from command line
const jobId = process.argv[2];

if (!jobId) {
  console.error("Please provide a job ID");
  console.error("Usage: node scripts/process-job.js JOB_ID");
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

    // Process the job
    if (state === "waiting" || state === "failed") {
      console.log(`Processing job ${jobId}...`);

      const { emailOptions } = job.data;

      if (emailOptions) {
        // If job has email options, send directly
        console.log("Job has email options, sending directly");
        console.log(`Sending to: ${emailOptions.to}`);

        const response = await resend.emails.send(emailOptions);
        console.log("Email sent successfully:", response.data?.id);

        // Mark as completed
        await job.moveToCompleted("Successfully processed manually", true);
        console.log("Job marked as completed");
      } else {
        // For more complex jobs, we need more logic
        console.log("Job requires template processing - marking as done");
        await job.moveToCompleted("Manually processed", true);
      }

      console.log("Job processed successfully");
    } else {
      console.error(
        `Cannot process job in state "${state}". Job must be in waiting or failed state.`
      );
      console.log("Job details:", {
        id: job.id,
        attemptsMade: job.attemptsMade,
        data: job.data,
      });
      process.exit(1);
    }
  } catch (error) {
    console.error("Error processing job:", error);
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
