import Redis from "ioredis";

// Require the QUEUE_REDIS_URL environment variable to be set
if (!process.env.QUEUE_REDIS_URL) {
  throw new Error(
    "QUEUE_REDIS_URL environment variable is required for queue operations"
  );
}

// Use environment variable exclusively - no fallbacks with credentials
const redisUrl = process.env.QUEUE_REDIS_URL;

// Check if the Redis URL uses SSL (rediss://)
const usesTLS = redisUrl.startsWith("rediss://");

// Log for debugging (hide credentials in logs)
console.log(
  `Redis connection configured (config.ts) with${usesTLS ? "" : "out"} TLS`
);

// Additional Redis connection options for Vercel deployment
const redisOptions = {
  enableReadyCheck: false,
  maxRetriesPerRequest: 10, // Reduce from null (infinite) to 3 to avoid hanging
  // Only apply TLS options if using a secure connection
  ...(usesTLS && {
    tls: { rejectUnauthorized: false },
    enableTLSForSentinelMode: false,
  }),
  retryStrategy: (times: number) => {
    // Exponential backoff for connection retries
    return Math.min(times * 100, 3000);
  },
  // Add a connection timeout to avoid hanging indefinitely
  connectTimeout: 10000,
  // Add better error handling
  showFriendlyErrorStack: true,
};

// Bull requires specific Redis settings
// DON'T pass the Redis client directly to Bull
// Instead, pass the connection options
export const queueOptions = {
  // For Vercel, we need to provide Redis options rather than just the URL
  redis: redisUrl,
  defaultJobOptions: {
    attempts: 20, // Retry failed jobs up to 20 times
    backoff: {
      // Exponential backoff strategy
      type: "exponential",
      delay: 5000, // Starting from 5 seconds
    },
    removeOnComplete: true, // Remove successful jobs
    removeOnFail: false, // Keep failed jobs for debugging
    // Improved stalled job handling
    failParentOnFailure: false, // Don't fail parent jobs if child jobs fail
    timeout: 120000, // 2 minutes timeout for job execution
    stackTraceLimit: 100, // More stack trace for debugging
    // If a job fails with a rate limit error (429), use a specific backoff
    backoffStrategy: (attemptsMade: number, err: any) => {
      // For rate limit errors, use recommended backoff from Resend
      if (
        err &&
        ((typeof err.name === "string" && err.name === "rate_limit_exceeded") ||
          (typeof err.message === "string" &&
            err.message.includes("rate limit")))
      ) {
        // Start with a larger backoff for rate limit errors
        // Use recommended time from retry-after header if available
        if (
          err.headers &&
          err.headers["retry-after"] &&
          !isNaN(parseInt(err.headers["retry-after"], 10))
        ) {
          const retryAfterSeconds = parseInt(err.headers["retry-after"], 10);
          return retryAfterSeconds * 1000;
        }

        // Otherwise use exponential backoff starting at 5s
        return Math.min(Math.pow(2, attemptsMade) * 5000, 30 * 60 * 1000); // Cap at 30 minutes
      }

      // For other errors, default to regular exponential backoff
      return Math.min(Math.pow(1.5, attemptsMade) * 5000, 30 * 60 * 1000);
    },
  },
};

// For non-Bull operations, use this Redis client
export const redisClient = new Redis(redisUrl, redisOptions);

// Add error handling to the client
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err.message);
  // Don't crash the application on Redis errors
});

// Add connection success logging
redisClient.on("connect", () => {
  // Don't log the full URL with credentials
  console.log("Redis connected successfully");
});
