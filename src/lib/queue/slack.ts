import Bull from "bull";
import { queueOptions } from "./config";

// Define the slack notification job data type
export interface SlackJobData {
  eventId: string;
  host: string;
  type: "new" | "reminder" | "updated";
  communityId: string;
}

// Create the slack notification queue
const slackQueue = new Bull<SlackJobData>(
  "slack-queue",
  queueOptions.redis as string,
  {
    defaultJobOptions: queueOptions.defaultJobOptions,
    settings: {
      stalledInterval: 30000, // 30 seconds
      lockDuration: 60000, // 60 seconds
      lockRenewTime: 15000, // 15 seconds
      maxStalledCount: 2,
    },
  }
);

// Track active slack notification jobs for monitoring
let activeSlackJobs = 0;
let totalSlackJobs = 0;
let completedSlackJobs = 0;
let failedSlackJobs = 0;

// Add monitoring events
slackQueue.on("active", () => {
  activeSlackJobs = Math.max(0, activeSlackJobs); // Reset if negative
  activeSlackJobs++;
  console.log(
    `Slack notification job started. Active jobs: ${activeSlackJobs}`
  );
});

slackQueue.on("completed", () => {
  activeSlackJobs = Math.max(0, activeSlackJobs - 1); // Never go below zero
  completedSlackJobs++;
  console.log(
    `Slack notification job completed. Completed: ${completedSlackJobs}/${totalSlackJobs}`
  );
});

slackQueue.on("failed", (job, err) => {
  activeSlackJobs = Math.max(0, activeSlackJobs - 1); // Never go below zero
  failedSlackJobs++;
  console.error(
    `Slack notification job failed: ${err.message}. Failed: ${failedSlackJobs}/${totalSlackJobs}`
  );
});

// Add slack notification job to queue
export const queueSlackNotification = async (
  data: SlackJobData
): Promise<string | number> => {
  const job = await slackQueue.add(data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 10000,
    },
    removeOnComplete: true,
  });

  totalSlackJobs++;
  console.log(
    `Slack notification for event ${data.eventId} queued with job ID: ${job.id}`
  );
  return job.id;
};

// Get slack queue statistics
export const getSlackQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    slackQueue.getWaitingCount(),
    slackQueue.getActiveCount(),
    slackQueue.getCompletedCount(),
    slackQueue.getFailedCount(),
    slackQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    metrics: {
      activeSlackJobs,
      totalSlackJobs,
      completedSlackJobs,
      failedSlackJobs,
    },
  };
};

// Export the queue for worker processing
export { slackQueue };
