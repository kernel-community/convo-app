import {
  priorityEmailQueue,
  type PriorityEmailJobData,
} from "../priority-email";
import { sendDirectEmailsWithPriority } from "src/utils/email/directResend";
import { queueEmailBatch } from "../email";

// Process a priority email job
async function processPriorityEmailJob(job: {
  data: PriorityEmailJobData;
}): Promise<void> {
  const { event, creatorId, proposerEmails, attendeeEmails } = job.data;

  console.log(
    `Processing priority email job for event ${event.id} with ${proposerEmails.length} proposer emails and ${attendeeEmails.length} attendee emails`
  );

  try {
    // Fix dates: convert string dates back to Date objects
    const fixedEvent = {
      ...event,
      startDateTime: new Date(event.startDateTime),
      endDateTime: new Date(event.endDateTime),
      // Always create valid Date objects for required fields to satisfy TypeScript
      createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
      updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date(),
    };

    // Fix dates in proposer emails
    const fixedProposerEmails = proposerEmails.map((email) => ({
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
    const fixedAttendeeEmails = attendeeEmails.map((email) => ({
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

    console.log(`Date objects restored for event ${event.id}`);

    // Send the direct emails with priority
    const { sentResults, attendeeEmailsForQueue } =
      await sendDirectEmailsWithPriority({
        event: fixedEvent,
        creatorId,
        proposerEmails: fixedProposerEmails,
        attendeeEmails: fixedAttendeeEmails,
      });

    console.log(
      `${sentResults.length} emails sent directly with priority order`
    );

    // Process any remaining attendee emails through the regular queue
    if (attendeeEmailsForQueue.length > 0) {
      console.log(
        `Processing ${attendeeEmailsForQueue.length} attendee emails through regular queue`
      );

      await queueEmailBatch(attendeeEmailsForQueue);
    }

    console.log(`Successfully processed priority emails for event ${event.id}`);
  } catch (error) {
    console.error(
      `Error processing priority emails for event ${event.id}:`,
      error
    );

    // Fallback to regular queue for all emails if direct sending fails
    console.log("Falling back to regular queue for all email delivery");

    const batches = [];

    if (proposerEmails.length > 0) {
      batches.push(proposerEmails);
    }

    if (attendeeEmails.length > 0) {
      batches.push(attendeeEmails);
    }

    if (batches.length > 0) {
      try {
        for (const batch of batches) {
          await queueEmailBatch(batch);
        }
        console.log(`Fallback: queued ${batches.length} email batches`);
      } catch (queueError) {
        console.error("Error in fallback queue email sending:", queueError);
        throw queueError; // Rethrow for retry
      }
    }
  }
}

// Start the priority email queue worker
export function startPriorityEmailWorker() {
  // Set up concurrency - process up to 2 jobs at a time
  // Lower concurrency to prevent overwhelming Resend API
  priorityEmailQueue.process(2, processPriorityEmailJob);

  console.log("🚀 Priority email queue worker started");

  // Add event handlers for monitoring
  priorityEmailQueue.on("completed", (job) => {
    console.log(
      `✅ Priority email job completed for event ${job.data.event.id}`
    );
  });

  priorityEmailQueue.on("failed", (job, error) => {
    console.error(
      `❌ Priority email job failed for event ${job?.data?.event?.id}:`,
      error
    );
  });

  return priorityEmailQueue;
}
