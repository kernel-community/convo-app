import Bull from "bull";
import { queueOptions } from "./config";
import type { User } from "@prisma/client";
import type { EmailType } from "src/components/Email";
import type { CreateEmailOptions } from "resend";
// Define the job data type
export interface EmailJobData {
  // Option 1: Send with standard parameters
  receiver?: User;
  event?: any; // Use any for event to allow both Date objects and serialized dates
  type?: EmailType;
  text?: string;
  previousRsvpType?: "GOING" | "MAYBE" | "NOT_GOING";
  // Option 2: Send with pre-built email options
  emailOptions?: CreateEmailOptions;
}

// Create the email queue - use redis URL from queueOptions
const emailQueue = new Bull<EmailJobData>(
  "email-queue",
  queueOptions.redis as string,
  {
    defaultJobOptions: queueOptions.defaultJobOptions,
    settings: {
      // Increase the stall check interval to reduce false positives
      stalledInterval: 30000, // 30 seconds (default is 30s)
      // How many milliseconds a job can be active before it's considered stalled
      lockDuration: 60000, // 60 seconds (default is 30s)
      // Maximum number of jobs to process concurrently
      lockRenewTime: 15000, // 15 seconds (default is 15s)
      maxStalledCount: 2, // Allow a job to stall twice before marking as failed (default is 1)
    },
  }
);

// Track active emails for monitoring
let activeEmails = 0;
let totalEmails = 0;
let completedEmails = 0;
let failedEmails = 0;

// Add monitoring events
emailQueue.on("active", () => {
  activeEmails = Math.max(0, activeEmails); // Reset if negative
  activeEmails++;
  console.log(`Email job started. Active jobs: ${activeEmails}`);
});

emailQueue.on("completed", () => {
  activeEmails = Math.max(0, activeEmails - 1); // Never go below zero
  completedEmails++;
  console.log(
    `Email job completed. Completed: ${completedEmails}/${totalEmails}`
  );
});

emailQueue.on("failed", (job, err) => {
  activeEmails = Math.max(0, activeEmails - 1); // Never go below zero
  failedEmails++;
  console.error(
    `Email job failed: ${err.message}. Failed: ${failedEmails}/${totalEmails}`
  );
});

// Add single job to queue
export const queueEmail = async (
  data: EmailJobData
): Promise<string | number> => {
  const job = await emailQueue.add(data, {
    attempts: 10,
    backoff: {
      type: "exponential",
      delay: 10000,
    },
    removeOnComplete: true,
  });

  totalEmails++;
  const recipient =
    data.receiver?.email || data.emailOptions?.to?.[0] || "unknown";
  console.log(`Email to ${recipient} queued with job ID: ${job.id}`);
  return job.id;
};

// Add multiple jobs to queue
export const queueEmailBatch = async (
  dataArray: EmailJobData[]
): Promise<(string | number)[]> => {
  const jobs = await Promise.all(
    dataArray.map((data) =>
      emailQueue.add(data, {
        attempts: 20,
        backoff: {
          type: "exponential",
          delay: 10000,
        },
        removeOnComplete: true,
      })
    )
  );

  totalEmails += dataArray.length;
  const jobIds = jobs.map((job) => job.id);
  console.log(`Queued ${jobs.length} emails, job IDs: ${jobIds.join(", ")}`);
  return jobIds;
};

// Get queue statistics
export const getQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    processStats: {
      activeEmails,
      totalEmails,
      completedEmails,
      failedEmails,
    },
  };
};

// Remove a specific job from the queue
export const removeJob = async (jobId: string | number): Promise<boolean> => {
  try {
    const job = await emailQueue.getJob(jobId);
    if (!job) {
      console.log(`Job ${jobId} not found`);
      return false;
    }

    await job.remove();
    console.log(`Job ${jobId} removed successfully`);
    return true;
  } catch (error) {
    console.error(`Error removing job ${jobId}:`, error);
    return false;
  }
};

// Clear all jobs from the queue
export const clearQueue = async (): Promise<{
  removed: number;
  failed: number;
  waiting: number;
  active: number;
  delayed: number;
  completed: number;
}> => {
  try {
    // Get all jobs of different states
    const [waiting, active, delayed, completed, failed] = await Promise.all([
      emailQueue.getWaiting(),
      emailQueue.getActive(),
      emailQueue.getDelayed(),
      emailQueue.getCompleted(),
      emailQueue.getFailed(),
    ]);

    console.log(
      `Found jobs - Waiting: ${waiting.length}, Active: ${active.length}, Delayed: ${delayed.length}, Completed: ${completed.length}, Failed: ${failed.length}`
    );

    // Combine all jobs and remove them
    const allJobs = [
      ...waiting,
      ...active,
      ...delayed,
      ...completed,
      ...failed,
    ];
    const results = await Promise.allSettled(
      allJobs.map((job) => job.remove())
    );

    const removed = results.filter((r) => r.status === "fulfilled").length;
    const failedToRemove = results.filter(
      (r) => r.status === "rejected"
    ).length;

    console.log(
      `Removed ${removed} jobs, failed to remove ${failedToRemove} jobs`
    );

    return {
      removed,
      failed: failedToRemove,
      waiting: waiting.length,
      active: active.length,
      delayed: delayed.length,
      completed: completed.length,
    };
  } catch (error) {
    console.error("Error clearing queue:", error);
    throw error;
  }
};

// Export the queue for worker processing
export { emailQueue };
