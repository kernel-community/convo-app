/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Shared Redis configuration utilities
 * Used across queue management scripts
 */

// Load environment variables if not already loaded
try {
  require("dotenv").config();
} catch (error) {
  console.warn("Error loading .env file:", error.message);
}

/**
 * Returns the Redis URL from environment variables
 * Throws an error if QUEUE_REDIS_URL is not set
 * @returns {string} The Redis connection URL
 */
const getRedisUrl = () => {
  const redisUrl = process.env.QUEUE_REDIS_URL;
  if (!redisUrl) {
    throw new Error(
      "QUEUE_REDIS_URL environment variable is not set. Please set it before running this script."
    );
  }
  return redisUrl;
};

/**
 * Returns common Redis connection options
 * @returns {Object} Redis connection options
 */
const getRedisOptions = () => {
  return {
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    enableReadyCheck: false,
    showFriendlyErrorStack: process.env.NODE_ENV !== "production",
  };
};

/**
 * Creates a Redis connection
 * @returns {import('ioredis').Redis} Redis client instance
 */
const createRedisClient = () => {
  const Redis = require("ioredis");
  const redisUrl = getRedisUrl();
  console.log("Creating Redis connection...");

  return new Redis(redisUrl, getRedisOptions());
};

/**
 * Creates a Bull queue with standard options
 * @param {string} queueName Name of the queue
 * @returns {import('bull').Queue} Bull queue instance
 */
const createQueue = (queueName = "email-queue") => {
  const Bull = require("bull");
  const redisUrl = getRedisUrl();

  return new Bull(queueName, redisUrl);
};

module.exports = {
  getRedisUrl,
  getRedisOptions,
  createRedisClient,
  createQueue,
};
