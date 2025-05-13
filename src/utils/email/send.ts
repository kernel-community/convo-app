// send email
import type { User } from "@prisma/client";
import type { CreateEmailOptions } from "resend";
import type { EmailType } from "src/components/Email";
import { getEmailTemplateFromType } from "src/components/Email";
import { resend } from "src/utils/email/resend";
import { generateiCalString } from "../ical/generateiCalString";
import type { EventWithProposerAndRsvps } from "../ical/generateiCalRequestFromEventId";
import { generateiCalRequestFromEvent } from "../ical/generateiCalRequestFromEventId";
import { EVENT_ORGANIZER_EMAIL } from "../constants";
import { EVENT_ORGANIZER_NAME } from "../constants";
import { emailTypeToRsvpType } from "../emailTypeToRsvpType";
import type { ConvoEvent } from "src/components/Email/types";
import { queueEmail, queueEmailBatch } from "src/lib/queue";

export const sendEventEmail = async ({
  receiver,
  event,
  type,
  text,
  returnOptionsOnly = false,
}: {
  receiver: User;
  type: EmailType;
  text?: string;
  event: EventWithProposerAndRsvps;
  returnOptionsOnly?: boolean;
}): Promise<CreateEmailOptions | { id: string | number }> => {
  if (!receiver.email) {
    throw new Error(`receiver ${receiver.id} has no email`);
  }

  // Determine the method based on RSVP type
  const method =
    emailTypeToRsvpType(type) === "NOT_GOING" || event.isDeleted === true
      ? "CANCEL"
      : "REQUEST";

  const iCal = await generateiCalString(
    [
      await generateiCalRequestFromEvent({
        event: event,
        recipientEmail: receiver.email,
        recipientName: receiver.nickname,
        rsvpType: emailTypeToRsvpType(type),
      }),
    ],
    method
  );

  // Process subject template variables
  const processSubject = (subject: string, data: { event: ConvoEvent }) => {
    return subject.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const keys = key.trim().split(".");
      let value: any = data;
      for (const k of keys) {
        value = value?.[k];
      }
      return value?.toString() ?? match;
    });
  };

  // Convert Prisma Event to ConvoEvent format
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
    proposers: event.proposers.map((p) => ({
      userId: p.userId,
      nickname: p.user.nickname,
    })),
    creationTimezone: event.creationTimezone ?? undefined,
  };

  // Create basic template props without event for non-event templates
  const basicProps = { firstName: receiver.nickname };

  // Create full props with event for templates that need it
  const fullProps = { ...basicProps, event: convoEvent, text };

  // Get template and subject
  const { template, subject: rawSubject } = getEmailTemplateFromType(
    type,
    fullProps
  );

  const subject = processSubject(rawSubject, { event: convoEvent });

  // Method already determined above, reuse it for the content type
  const emailOptions: CreateEmailOptions = {
    from: `${EVENT_ORGANIZER_NAME} <${EVENT_ORGANIZER_EMAIL}>`,
    to: [receiver.email],
    subject,
    react: template,
    text: text || "Email from Convo Cafe",
    attachments: [
      {
        filename: "convo.ics",
        contentType: `text/calendar;charset=utf-8;method=${method}`,
        content: iCal.toString(),
      },
    ],
  };

  // If returnOptionsOnly is true, just return the options without sending
  if (returnOptionsOnly) {
    return emailOptions;
  }

  try {
    // Add to Redis queue instead of in-memory queue
    const jobId = await queueEmail({
      receiver,
      event: {
        ...event,
        // Ensure dates are serialized consistently
        startDateTime: event.startDateTime.toISOString(),
        endDateTime: event.endDateTime.toISOString(),
        createdAt: event.createdAt?.toISOString(),
        updatedAt: event.updatedAt?.toISOString(),
      },
      type,
      text,
    });

    console.log(`Email to ${receiver.email} added to Redis queue for ${type}`);
    return { id: jobId };
  } catch (error) {
    console.error("Unexpected error while queuing email:", error);
    throw error;
  }
};

/**
 * Sends batch emails using Resend's batch API
 * Handles rate limiting by adding timeouts when there are more than 100 recipients
 *
 * @param emails Array of email options to send in batch
 * @returns Array of email IDs
 */
export const sendBatch = async (
  emails: CreateEmailOptions[]
): Promise<Array<{ id: string | number }>> => {
  // If there are no emails, return empty array
  if (emails.length === 0) {
    return [];
  }

  try {
    // Use Redis queue for batch processing instead of direct sending
    const jobIds = await Promise.all(
      emails.map(async (emailOptions) => {
        const jobId = await queueEmail({ emailOptions });
        return { id: jobId };
      })
    );

    console.log(`Batch of ${emails.length} emails added to Redis queue`);
    return jobIds;
  } catch (e) {
    // Handle any unexpected errors
    console.error("Unexpected error while queuing batch emails:", e);
    throw new Error(
      e instanceof Error
        ? e.message
        : "An unexpected error occurred while queuing batch emails"
    );
  }
};
