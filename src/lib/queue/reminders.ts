import Bull from "bull";
import { queueOptions } from "./config";

// Define the reminder job data type
export interface ReminderJobData {
  eventId: string;
  recipientId: string;
  isProposer: boolean;
  isMaybe: boolean;
}

// Create the reminder scheduling queue
const reminderQueue = new Bull<ReminderJobData>(
  "reminder-queue",
  queueOptions.redis as string,
  {
    defaultJobOptions: queueOptions.defaultJobOptions,
    settings: {
      stalledInterval: 30000, // 30 seconds
      lockDuration: 60000, // 60 seconds
      lockRenewTime: 15000, // 15 seconds
      maxStalledCount: 2, // Allow a job to stall twice before marking as failed
    },
  }
);

// Track active reminder scheduling jobs for monitoring
let activeReminderJobs = 0;
let totalReminderJobs = 0;
let completedReminderJobs = 0;
let failedReminderJobs = 0;

// Add monitoring events
reminderQueue.on("active", () => {
  activeReminderJobs = Math.max(0, activeReminderJobs); // Reset if negative
  activeReminderJobs++;
  console.log(`Reminder job started. Active jobs: ${activeReminderJobs}`);
});

reminderQueue.on("completed", () => {
  activeReminderJobs = Math.max(0, activeReminderJobs - 1); // Never go below zero
  completedReminderJobs++;
  console.log(
    `Reminder job completed. Completed: ${completedReminderJobs}/${totalReminderJobs}`
  );
});

reminderQueue.on("failed", (job, err) => {
  activeReminderJobs = Math.max(0, activeReminderJobs - 1); // Never go below zero
  failedReminderJobs++;
  console.error(
    `Reminder job failed: ${err.message}. Failed: ${failedReminderJobs}/${totalReminderJobs}`
  );
});

// Add single reminder job to queue
export const queueReminderScheduling = async (
  data: ReminderJobData
): Promise<string | number> => {
  const job = await reminderQueue.add(data, {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 10000,
    },
    removeOnComplete: true,
  });

  totalReminderJobs++;
  console.log(
    `Reminder scheduling for event ${data.eventId} and recipient ${data.recipientId} queued with job ID: ${job.id}`
  );
  return job.id;
};

// Add multiple reminder jobs to queue
export const queueReminderBatch = async (
  dataArray: ReminderJobData[]
): Promise<(string | number)[]> => {
  const jobs = await Promise.all(
    dataArray.map((data) =>
      reminderQueue.add(data, {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 10000,
        },
        removeOnComplete: true,
      })
    )
  );

  totalReminderJobs += dataArray.length;
  console.log(`Batch of ${dataArray.length} reminder scheduling jobs queued`);
  return jobs.map((job) => job.id);
};

// Get reminder queue statistics
export const getReminderQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    reminderQueue.getWaitingCount(),
    reminderQueue.getActiveCount(),
    reminderQueue.getCompletedCount(),
    reminderQueue.getFailedCount(),
    reminderQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    metrics: {
      activeReminderJobs,
      totalReminderJobs,
      completedReminderJobs,
      failedReminderJobs,
    },
  };
};

// Export the queue for worker processing
export { reminderQueue };
