import Bull from "bull";
import { queueOptions } from "./config";
import type { ServerEvent } from "src/types";
import type { EmailType } from "src/components/Email";

// Define the priority email job data type
// Define type for email receiver to match the expected structure
interface EmailReceiver {
  id: string;
  email: string | null;
  address: string | null;
  nickname: string;
  isBeta: boolean;
  profile?: {
    image?: string | null;
  } | null;
}

// Define type for email data structure
interface EmailData {
  event: ServerEvent;
  type: EmailType;
  receiver: EmailReceiver;
}

export interface PriorityEmailJobData {
  event: ServerEvent;
  creatorId?: string;
  proposerEmails: EmailData[];
  attendeeEmails: EmailData[];
}

// Create the priority email queue
const priorityEmailQueue = new Bull<PriorityEmailJobData>(
  "priority-email-queue",
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

// Track active priority email jobs for monitoring
let activePriorityEmailJobs = 0;
let totalPriorityEmailJobs = 0;
let completedPriorityEmailJobs = 0;
let failedPriorityEmailJobs = 0;

// Add monitoring events
priorityEmailQueue.on("active", () => {
  activePriorityEmailJobs = Math.max(0, activePriorityEmailJobs); // Reset if negative
  activePriorityEmailJobs++;
  console.log(
    `Priority email job started. Active jobs: ${activePriorityEmailJobs}`
  );
});

priorityEmailQueue.on("completed", () => {
  activePriorityEmailJobs = Math.max(0, activePriorityEmailJobs - 1); // Never go below zero
  completedPriorityEmailJobs++;
  console.log(
    `Priority email job completed. Completed: ${completedPriorityEmailJobs}/${totalPriorityEmailJobs}`
  );
});

priorityEmailQueue.on("failed", (job, err) => {
  activePriorityEmailJobs = Math.max(0, activePriorityEmailJobs - 1); // Never go below zero
  failedPriorityEmailJobs++;
  console.error(
    `Priority email job failed: ${err.message}. Failed: ${failedPriorityEmailJobs}/${totalPriorityEmailJobs}`
  );
});

// Add priority email job to queue
export const queuePriorityEmail = async (
  data: PriorityEmailJobData
): Promise<string | number> => {
  const job = await priorityEmailQueue.add(data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 10000,
    },
    removeOnComplete: true,
  });

  totalPriorityEmailJobs++;
  console.log(
    `Priority email job for event ${data.event.id} queued with job ID: ${job.id}`
  );
  return job.id;
};

// Get priority email queue statistics
export const getPriorityEmailQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    priorityEmailQueue.getWaitingCount(),
    priorityEmailQueue.getActiveCount(),
    priorityEmailQueue.getCompletedCount(),
    priorityEmailQueue.getFailedCount(),
    priorityEmailQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    metrics: {
      activePriorityEmailJobs,
      totalPriorityEmailJobs,
      completedPriorityEmailJobs,
      failedPriorityEmailJobs,
    },
  };
};

// Export the queue for worker processing
export { priorityEmailQueue };
