import { prisma } from "src/utils/db";
import { sendEventInviteEmail } from "src/utils/email/send";
import { EmailType } from "@prisma/client";
import { reminderEnumToEmailType } from "src/utils/emailTypeConversions";

export const runtime = "edge";

const REMINDER_WINDOWS = {
  "24hr": 24 * 60 * 60 * 1000,
  "1hr": 60 * 60 * 1000,
  "1min": 60 * 1000,
};

export async function GET() {
  const now = new Date();

  // Find events starting in the next 24 hours
  const upcomingEvents = await prisma.event.findMany({
    where: {
      startDateTime: {
        gte: now,
        lte: new Date(now.getTime() + REMINDER_WINDOWS["24hr"]),
      },
      isDeleted: false,
    },
    include: {
      proposer: true,
      rsvps: {
        include: {
          attendee: true,
        },
      },
      reminders: true, // Include already sent reminders
    },
  });

  const remindersSent = [];

  for (const event of upcomingEvents) {
    const timeUntilEvent = event.startDateTime.getTime() - now.getTime();

    // Check each reminder window
    for (const [window, ms] of Object.entries(REMINDER_WINDOWS)) {
      /**
       * 24hr reminder: Sends when event is between 24:00:00 and 23:59:00 hours away
       * 1hr reminder: Sends when event is between 1:00:00 and 0:59:00 hours away
       * 1min reminder: Sends when event is between 1:00 and 0:00 minutes away
       */
      if (timeUntilEvent <= ms && timeUntilEvent > ms - 60000) {
        const reminderType =
          window === "24hr"
            ? EmailType.REMINDER24HR
            : window === "1hr"
            ? EmailType.REMINDER1HR
            : EmailType.REMINDER1MIN;

        // Send to all attendees
        for (const rsvp of event.rsvps) {
          // Check if this reminder was already sent
          const reminderExists = event.reminders.some(
            (reminder) =>
              reminder.userId === rsvp.attendeeId &&
              reminder.type === reminderType
          );

          if (!reminderExists) {
            try {
              await sendEventInviteEmail({
                receiver: rsvp.attendee,
                type: reminderEnumToEmailType(reminderType),
                event: event,
              });
              remindersSent.push({
                eventId: event.id,
                userId: rsvp.attendeeId,
                type: reminderType,
              });
            } catch (error) {
              console.error(
                `Failed to send ${reminderType} to ${rsvp.attendee.email}:`,
                error
              );
            }
          }
        }

        // Special handling for 1hr reminder to proposer
        if (window === "1hr") {
          const proposerReminderExists = event.reminders.some(
            (reminder) =>
              reminder.userId === event.proposer.id &&
              reminder.type === EmailType.REMINDER1HRPROPOSER
          );

          if (!proposerReminderExists) {
            try {
              await sendEventInviteEmail({
                receiver: event.proposer,
                type: reminderEnumToEmailType(EmailType.REMINDER1HRPROPOSER),
                event: event,
              });
              remindersSent.push({
                eventId: event.id,
                userId: event.proposer.id,
                type: EmailType.REMINDER1HRPROPOSER,
              });
            } catch (error) {
              console.error(
                `Failed to send proposer reminder to ${event.proposer.email}:`,
                error
              );
            }
          }
        }
      }
    }
  }

  return Response.json({
    success: true,
    remindersSent: remindersSent.length,
    timestamp: now.toISOString(),
  });
}
