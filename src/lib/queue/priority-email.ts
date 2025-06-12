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
  // Add support for RSVP type parameters for iCal generation
  previousRsvpType?: "GOING" | "MAYBE" | "NOT_GOING";
  approvalRsvpType?: "GOING" | "MAYBE" | "NOT_GOING";
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

// Send priority emails immediately without queueing
export const sendPriorityEmailImmediately = async (
  data: PriorityEmailJobData
): Promise<void> => {
  console.log(
    `🚀 Sending priority emails immediately for event ${data.event.id}`
  );

  try {
    // Import the direct email function
    const { sendDirectEmailsWithPriority } = await import(
      "src/utils/email/directResend"
    );
    const { queueEmailBatch } = await import("./email");

    // Fix dates: convert string dates back to Date objects
    const fixedEvent = {
      ...data.event,
      startDateTime: new Date(data.event.startDateTime),
      endDateTime: new Date(data.event.endDateTime),
      createdAt: data.event.createdAt
        ? new Date(data.event.createdAt)
        : new Date(),
      updatedAt: data.event.updatedAt
        ? new Date(data.event.updatedAt)
        : new Date(),
    };

    // Fix dates in proposer emails
    const fixedProposerEmails = data.proposerEmails.map((email) => ({
      ...email,
      event: {
        ...email.event,
        startDateTime: new Date(email.event.startDateTime),
        endDateTime: new Date(email.event.endDateTime),
        createdAt: email.event.createdAt
          ? new Date(email.event.createdAt)
          : new Date(),
        updatedAt: email.event.updatedAt
          ? new Date(email.event.updatedAt)
          : new Date(),
      },
    }));

    // Fix dates in attendee emails
    const fixedAttendeeEmails = data.attendeeEmails.map((email) => ({
      ...email,
      event: {
        ...email.event,
        startDateTime: new Date(email.event.startDateTime),
        endDateTime: new Date(email.event.endDateTime),
        createdAt: email.event.createdAt
          ? new Date(email.event.createdAt)
          : new Date(),
        updatedAt: email.event.updatedAt
          ? new Date(email.event.updatedAt)
          : new Date(),
      },
    }));

    // Send emails immediately
    const { sentResults, attendeeEmailsForQueue } =
      await sendDirectEmailsWithPriority({
        event: fixedEvent,
        creatorId: data.creatorId,
        proposerEmails: fixedProposerEmails,
        attendeeEmails: fixedAttendeeEmails,
      });

    console.log(
      `✅ ${sentResults.length} priority emails sent immediately for event ${data.event.id}`
    );

    // Queue any remaining attendee emails for later processing
    if (attendeeEmailsForQueue.length > 0) {
      console.log(
        `📬 Queueing ${attendeeEmailsForQueue.length} attendee emails for later processing`
      );
      await queueEmailBatch(attendeeEmailsForQueue);
    }
  } catch (error) {
    console.error(
      `❌ Error sending priority emails immediately for event ${data.event.id}:`,
      error
    );

    // Fallback to queue system if immediate sending fails
    console.log("🔄 Falling back to queue system for priority emails");
    await queuePriorityEmail(data);
  }
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
