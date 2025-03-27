import type { EmailType } from "src/components/Email";
import { resend } from "src/utils/email/resend";
import { getEmailTemplateFromType } from "src/components/Email";
import { EVENT_ORGANIZER_EMAIL, EVENT_ORGANIZER_NAME } from "../constants";
import type { User, Event, Email } from "@prisma/client";
import type { ConvoEvent } from "src/components/Email/types";
import { prisma } from "src/utils/db";

/**
 * Schedules reminder emails for a single recipient of a convo
 * @param event The event to schedule reminders for
 * @param recipient The recipient to send reminders to
 * @param isProposer Whether the recipient is the proposer of the event
 * @param isMaybe Whether the recipient is marked as "Maybe" attending
 * @returns Array of created Email records
 */
export const scheduleReminderEmails = async ({
  event,
  recipient,
  isProposer = false,
  isMaybe = false,
}: {
  event: Event;
  recipient: User;
  isProposer?: boolean;
  isMaybe?: boolean;
}): Promise<Email[]> => {
  // Don't schedule reminders for events that are in the past
  const now = new Date();
  if (event.startDateTime <= now) {
    console.log(
      `Event ${event.id} starts in the past, not scheduling reminders`
    );
    return [];
  }

  // Don't schedule if recipient has no email
  if (!recipient.email) {
    console.log(`Recipient ${recipient.id} has no email, skipping reminders`);
    return [];
  }

  // Calculate reminder times
  const oneHourBefore = new Date(
    event.startDateTime.getTime() - 60 * 60 * 1000
  );
  const twentyFourHoursBefore = new Date(
    event.startDateTime.getTime() - 24 * 60 * 60 * 1000
  );

  // Don't schedule reminders that are in the past
  const remindersToSchedule: {
    type: EmailType;
    scheduledTime: Date;
  }[] = [];

  if (oneHourBefore > now) {
    remindersToSchedule.push({
      type: "reminder1hr",
      scheduledTime: oneHourBefore,
    });
  }

  if (twentyFourHoursBefore > now) {
    remindersToSchedule.push({
      type: "reminder24hr",
      scheduledTime: twentyFourHoursBefore,
    });
  }

  if (remindersToSchedule.length === 0) {
    console.log(
      `All reminder times for event ${event.id} are in the past, not scheduling reminders`
    );
    return [];
  }

  // Convert Prisma Event to ConvoEvent format for email template
  const convoEvent: ConvoEvent = {
    id: event.id,
    title: event.title,
    descriptionHtml: event.descriptionHtml ?? undefined,
    startDateTime: event.startDateTime.toISOString(),
    endDateTime: event.endDateTime.toISOString(),
    location: event.location,
    locationType: event.locationType,
    hash: event.hash,
    limit: event.limit,
    sequence: event.sequence,
    isDeleted: event.isDeleted,
    gCalEventId: event.gCalEventId ?? undefined,
    type: event.type,
    proposerId: event.proposerId,
    proposerName: "", // Will be filled in when we have the proposer
  };

  // Get the proposer's name if not already available
  if (isProposer) {
    convoEvent.proposerName = recipient.nickname;
  } else {
    const proposer = await prisma.user.findUnique({
      where: { id: event.proposerId },
    });

    if (proposer) {
      convoEvent.proposerName = proposer.nickname;
    }
  }

  // Create emails for the recipient
  const createdEmails: Email[] = [];

  // Process reminders with rate limiting
  for (let i = 0; i < remindersToSchedule.length; i++) {
    // Safe to access as we're iterating within the array bounds
    const reminder = remindersToSchedule[i];
    // Skip if reminder is undefined (shouldn't happen but TypeScript needs this check)
    if (!reminder) continue;
    try {
      // Get email template and subject
      const basicProps = { firstName: recipient.nickname };
      const fullProps = { ...basicProps, event: convoEvent };

      // Customize subject line for proposers and maybe attendees
      let subject: string;
      let customTemplate;

      if (isProposer) {
        // Custom subject for proposers
        subject = `Your scheduled convo "${event.title}" is coming up soon`;

        // Get the standard template but we'll customize it slightly
        const templateData = getEmailTemplateFromType(reminder.type, fullProps);
        customTemplate = templateData.template;
      } else if (isMaybe) {
        // Custom subject for maybe attendees
        subject = `Reminder: You're tentatively attending "${event.title}" soon`;

        // Get the standard template but we'll customize it slightly
        const templateData = getEmailTemplateFromType(reminder.type, fullProps);
        customTemplate = templateData.template;
      } else {
        // Standard subject and template for confirmed attendees
        const templateData = getEmailTemplateFromType(reminder.type, fullProps);
        subject = templateData.subject;
        customTemplate = templateData.template;
      }

      // Create the event URL
      const eventUrl = `${process.env.NEXT_PUBLIC_URL}/e/${event.hash}`;

      // Schedule the email with Resend
      const { data, error } = await resend.emails.send({
        from: `${EVENT_ORGANIZER_NAME} <${EVENT_ORGANIZER_EMAIL}>`,
        to: [recipient.email],
        subject,
        react: customTemplate,
        text: `Reminder for your ${
          isProposer
            ? "scheduled"
            : isMaybe
            ? "tentatively scheduled"
            : "upcoming"
        } Convo: ${event.title}. View details at: ${eventUrl}`,
        // No attachments as per requirements
        // Instead include the URL to the Convo
        html: `<p>Reminder for your ${
          isProposer
            ? "scheduled"
            : isMaybe
            ? "tentatively scheduled"
            : "upcoming"
        } Convo: ${event.title}.</p>
              <p>View details at: <a href="${eventUrl}">${eventUrl}</a></p>`,
        scheduledAt: reminder.scheduledTime.toISOString(),
      });

      // Add a timeout between requests to respect Resend's rate limit of 2 requests per second
      // Only add timeout if there are more reminders to process
      if (i < remindersToSchedule.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay for 2 req/sec rate limit
      }

      if (error) {
        console.error("Failed to schedule reminder email:", error);
        continue;
      }

      if (!data?.id) {
        console.error("No data returned from Resend when scheduling email");
        continue;
      }

      // Save the scheduled email in the database
      const email = await prisma.email.create({
        data: {
          userId: recipient.id,
          eventId: event.id,
          reminderId: data.id,
          type: mapEmailTypeToDbType(reminder.type),
          sent: false,
          delivered: false,
          bounced: false,
          cancelled: false,
        },
      });

      createdEmails.push(email);
      console.log(
        `Scheduled ${reminder.type} reminder for ${
          isProposer ? "proposer" : isMaybe ? "maybe attendee" : "attendee"
        } ${recipient.id} for event ${event.id}`
      );
    } catch (error) {
      console.error(
        `Error scheduling ${reminder.type} reminder for ${
          isProposer ? "proposer" : isMaybe ? "maybe attendee" : "attendee"
        } ${recipient.id} for event ${event.id}:`,
        error
      );
    }
  }

  return createdEmails;
};

/**
 * Schedules reminder emails for multiple recipients of a convo
 * @param event The event to schedule reminders for
 * @param attendees The attendees to send reminders to
 * @returns Array of created Email records
 */
export const scheduleReminderEmailsForMultipleRecipients = async ({
  event,
  attendees,
}: {
  event: Event;
  attendees: User[];
}): Promise<Email[]> => {
  const createdEmails: Email[] = [];

  // Process attendees with rate limiting
  for (let i = 0; i < attendees.length; i++) {
    // Safe to access as we're iterating within the array bounds
    const attendee = attendees[i];
    // Skip if attendee is undefined (shouldn't happen but TypeScript needs this check)
    if (!attendee) continue;
    const emails = await scheduleReminderEmails({
      event,
      recipient: attendee,
      isProposer: attendee.id === event.proposerId,
    });

    createdEmails.push(...emails);

    // Add a timeout between processing attendees to respect Resend's rate limit
    // Only add timeout if there are more attendees to process
    if (i < attendees.length - 1) {
      console.log(
        `Processed reminders for attendee ${i + 1}/${
          attendees.length
        }, waiting before next attendee...`
      );
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay for 2 req/sec rate limit
    }
  }

  return createdEmails;
};

/**
 * Cancels all scheduled reminder emails for an event
 * @param eventId The ID of the event to cancel reminders for
 */
export const cancelReminderEmails = async (eventId: string): Promise<void> => {
  try {
    // Get all scheduled emails for this event
    const emails = await prisma.email.findMany({
      where: {
        eventId,
        cancelled: false,
        sent: false,
      },
    });

    // Cancel each email
    for (const email of emails) {
      try {
        // Cancel the scheduled email with Resend
        await resend.emails.cancel(email.reminderId);

        // Update the email record
        await prisma.email.update({
          where: { id: email.id },
          data: { cancelled: true },
        });

        console.log(
          `Cancelled reminder email ${email.id} for event ${eventId}`
        );
      } catch (error) {
        console.error(
          `Error cancelling reminder email ${email.id} for event ${eventId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error(
      `Error cancelling reminder emails for event ${eventId}:`,
      error
    );
    throw error;
  }
};

/**
 * Cancels all scheduled reminder emails for a specific user for an event
 * @param eventId The ID of the event
 * @param userId The ID of the user
 */
export const cancelReminderEmailsForUser = async (
  eventId: string,
  userId: string
): Promise<void> => {
  try {
    // Get all scheduled emails for this user and event
    const emails = await prisma.email.findMany({
      where: {
        eventId,
        userId,
        cancelled: false,
        sent: false,
      },
    });

    // Cancel each email
    for (const email of emails) {
      try {
        // Cancel the scheduled email with Resend
        await resend.emails.cancel(email.reminderId);

        // Update the email record
        await prisma.email.update({
          where: { id: email.id },
          data: { cancelled: true },
        });

        console.log(
          `Cancelled reminder email ${email.id} for user ${userId} for event ${eventId}`
        );
      } catch (error) {
        console.error(
          `Error cancelling reminder email ${email.id} for user ${userId} for event ${eventId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error(
      `Error cancelling reminder emails for user ${userId} for event ${eventId}:`,
      error
    );
    throw error;
  }
};

/**
 * Maps the email template type to the database EmailType enum
 */
// Define a type for the database email types to match Prisma's EmailType enum
type DbEmailType =
  | "CREATE"
  | "INVITE"
  | "UPDATE"
  | "REMINDER24HR"
  | "REMINDER1HR"
  | "REMINDER1MIN"
  | "REMINDER1HRPROPOSER";

/**
 * Maps the email template type to the database EmailType enum
 */
function mapEmailTypeToDbType(type: EmailType): DbEmailType {
  switch (type) {
    case "reminder1hr":
      return "REMINDER1HR";
    case "reminder24hr":
      return "REMINDER24HR";
    case "reminder1min":
      return "REMINDER1MIN";
    case "reminder1hrProposer":
      return "REMINDER1HRPROPOSER";
    case "create":
      return "CREATE";
    case "invite-going":
    case "invite-maybe":
    case "invite-not-going":
      return "INVITE";
    case "update-proposer":
    case "update-attendee-going":
    case "update-attendee-maybe":
      return "UPDATE";
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}
