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

// Create a global email queue with rate limiting
interface EmailQueueItem {
  options: CreateEmailOptions;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

class EmailQueue {
  private queue: EmailQueueItem[] = [];
  private processing = false;
  private rateLimitPerSecond = 5; // Pro plan with higher limit

  addToQueue(item: EmailQueueItem): void {
    this.queue.push(item);
    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;

    // Process up to rateLimitPerSecond items at once
    const batch = this.queue.splice(0, this.rateLimitPerSecond);

    // Send emails in batch
    await Promise.all(
      batch.map(async (item) => {
        try {
          const { data, error } = await resend.emails.send(item.options);

          if (error) {
            console.error("Failed to send email:", error);
            item.reject(error);
            return;
          }

          if (!data) {
            const noDataError = new Error("No data returned from resend");
            console.error(noDataError);
            item.reject(noDataError);
            return;
          }

          item.resolve(data);
          console.log(`Email sent successfully: ${data.id}`);
        } catch (error) {
          console.error("Failed to send email:", error);
          item.reject(error);
        }
      })
    );

    // Add delay before processing next batch
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Continue processing
    this.processQueue();
  }
}

// Create a singleton instance
const emailQueue = new EmailQueue();

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
}): Promise<CreateEmailOptions | { id: string }> => {
  if (!receiver.email) {
    throw new Error(`receiver ${receiver.id} has no email`);
  }
  // @todo @note @dev
  // modifying proposer to be hedwig, only for calendar invites
  // the only problem is that when the recipient marks themselves as No, the recipient might receive a bounced email (since hedwig@convo.cafe does not exist)
  // ideally we'd like the recipients to not mark anything via their calendar
  // so in a way that bounced email might actually be a good reminder for them to go to the app and update their RSVP

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
  console.log({ iCal });
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
    // Instead of sending directly, add to the rate-limited queue
    return await new Promise((resolve, reject) => {
      emailQueue.addToQueue({
        options: emailOptions,
        resolve,
        reject,
      });
      console.log(`Email to ${receiver.email} added to queue for ${type}`);
    });
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
): Promise<Array<{ id: string }>> => {
  // If there are no emails, return empty array
  if (emails.length === 0) {
    return [];
  }

  try {
    // If there are more than 100 recipients, split into batches with timeouts
    if (emails.length > 100) {
      const batchSize = 100;
      const batches = [];

      // Split emails into batches of 100
      for (let i = 0; i < emails.length; i += batchSize) {
        batches.push(emails.slice(i, i + batchSize));
      }

      // Send each batch with a timeout between them to respect rate limits
      const results = [];
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        if (!batch) continue;

        console.log(
          `Sending batch ${i + 1} of ${batches.length} (${batch.length} emails)`
        );

        const { data, error } = await resend.batch.send(batch);

        if (error) {
          console.error("Batch email sending failed:", error);
          throw new Error(`Failed to send batch emails: ${error.message}`);
        }

        if (!data) {
          throw new Error("No data returned from resend batch send");
        }

        // Handle the response data properly
        // The data object should have a 'data' property that contains the array of results
        if (Array.isArray(data)) {
          results.push(...data);
        } else if (data.data && Array.isArray(data.data)) {
          // If data has a nested data array property
          results.push(...data.data);
        } else {
          // If it's a single result
          results.push(data as any);
        }

        // Add timeout between batches to avoid rate limits (except for the last batch)
        if (i < batches.length - 1) {
          console.log("Waiting 1 second before sending next batch...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return results;
    } else {
      // For smaller batches, send all at once
      const { data, error } = await resend.batch.send(emails);

      if (error) {
        console.error("Batch email sending failed:", error);
        throw new Error(`Failed to send batch emails: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from resend batch send");
      }

      // Handle the response data properly
      // The data object should have a 'data' property that contains the array of results
      if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        // If data has a nested data array property
        return data.data;
      } else {
        // If it's a single result
        return [data as any];
      }
    }
  } catch (e) {
    // Handle any unexpected errors from the API
    console.error("Unexpected error while sending batch emails:", e);
    throw new Error(
      e instanceof Error
        ? e.message
        : "An unexpected error occurred while sending batch emails"
    );
  }
};
