import { reminderQueue, type ReminderJobData } from "../reminders";
import { scheduleReminderEmails } from "src/utils/email/scheduleReminders";
import { prisma } from "src/utils/db";

// Process a reminder job
async function processReminderJob(job: {
  data: ReminderJobData;
}): Promise<void> {
  const { eventId, recipientId, isProposer, isMaybe } = job.data;

  console.log(
    `Processing reminder scheduling job for event ${eventId} and recipient ${recipientId}`
  );

  try {
    // Fetch the event with proposers
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        proposers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    // Fetch the recipient
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      throw new Error(`Recipient ${recipientId} not found`);
    }

    // Schedule reminder emails for this specific recipient
    await scheduleReminderEmails({
      event,
      recipient,
      isProposer,
      isMaybe,
    });

    console.log(
      `Successfully scheduled reminders for event ${eventId} and recipient ${recipientId}`
    );
  } catch (error) {
    console.error(
      `Error scheduling reminders for event ${eventId} and recipient ${recipientId}:`,
      error
    );
    throw error; // Rethrow to allow Bull to handle retries
  }
}

// Start the reminder queue worker
export function startReminderWorker() {
  // Set up concurrency - process up to 5 jobs at a time
  reminderQueue.process(5, processReminderJob);

  console.log("🚀 Reminder queue worker started");

  // Add event handlers for monitoring
  reminderQueue.on("completed", (job) => {
    console.log(
      `✅ Reminder job completed for event ${job.data.eventId} and recipient ${job.data.recipientId}`
    );
  });

  reminderQueue.on("failed", (job, error) => {
    console.error(
      `❌ Reminder job failed for event ${job?.data?.eventId} and recipient ${job?.data?.recipientId}:`,
      error
    );
  });

  return reminderQueue;
}
