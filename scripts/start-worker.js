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
  console.log(" Initializing workers...");

  try {
    // Import the centralized queue system
    const queueSystem = require("../src/lib/queue");

    // Display initial queue stats if available
    try {
      // Email queue stats
      const emailStats = await queueSystem.getQueueStats();
      console.log(" Email queue stats:", JSON.stringify(emailStats, null, 2));

      // Reminder queue stats
      const reminderStats = await queueSystem.getReminderQueueStats();
      console.log(
        " Reminder queue stats:",
        JSON.stringify(reminderStats, null, 2)
      );

      // Slack queue stats
      const slackStats = await queueSystem.getSlackQueueStats();
      console.log(" Slack queue stats:", JSON.stringify(slackStats, null, 2));

      // Priority email queue stats
      const priorityStats = await queueSystem.getPriorityEmailQueueStats();
      console.log(
        " Priority email queue stats:",
        JSON.stringify(priorityStats, null, 2)
      );
    } catch (statsError) {
      console.warn(" Could not get all queue stats:", statsError.message);
    }

    // Start all workers using the centralized starter
    console.log(" Starting all queue workers...");
    queueSystem.startWorkers();
    console.log(" All workers started successfully");

    // Log queue status periodically (every 30 seconds)
    const statsInterval = setInterval(async () => {
      try {
        console.log("\n--- Queue Stats Update ---");
        const emailStats = await queueSystem.getQueueStats();
        console.log(
          " Email queue:",
          emailStats.waiting,
          "waiting,",
          emailStats.active,
          "active,",
          emailStats.completed,
          "completed"
        );

        const reminderStats = await queueSystem.getReminderQueueStats();
        console.log(
          " Reminder queue:",
          reminderStats.waiting,
          "waiting,",
          reminderStats.active,
          "active,",
          reminderStats.completed,
          "completed"
        );

        const slackStats = await queueSystem.getSlackQueueStats();
        console.log(
          " Slack queue:",
          slackStats.waiting,
          "waiting,",
          slackStats.active,
          "active,",
          slackStats.completed,
          "completed"
        );

        const priorityStats = await queueSystem.getPriorityEmailQueueStats();
        console.log(
          " Priority email:",
          priorityStats.waiting,
          "waiting,",
          priorityStats.active,
          "active,",
          priorityStats.completed,
          "completed"
        );
      } catch (error) {
        console.warn(" Error getting queue stats:", error.message);
      }
    }, 30000); // Every 30 seconds

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n Graceful shutdown initiated...");
      clearInterval(statsInterval);
      console.log("Queue workers will shut down automatically.");
      console.log("Goodbye! ");
      process.exit(0);
    });

    // Prevent the process from exiting
    console.log("All queue workers started. Waiting for jobs...\n");
    console.log(
      "Press Ctrl+C to exit workers. Redis connections will be cleaned up automatically."
    );
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
