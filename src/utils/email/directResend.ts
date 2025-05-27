import { resend } from "./resend";
import type { User } from "@prisma/client";
import type { EmailType } from "src/components/Email";
import { getEmailTemplateFromType } from "src/components/Email";
import { generateiCalString } from "../ical/generateiCalString";
import { generateiCalRequestFromEvent } from "../ical/generateiCalRequestFromEventId";
import { EVENT_ORGANIZER_EMAIL, EVENT_ORGANIZER_NAME } from "../constants";
import type { ServerEvent } from "src/types";
import { emailTypeToRsvpType } from "../emailTypeToRsvpType";
import type { ConvoEvent } from "src/components/Email/types";

// Type definitions for Resend API responses
interface ResendEmailData {
  id: string;
}

interface ResendErrorResponse {
  statusCode?: number;
  name?: string;
  message: string;
}

interface ResendEmailResponse {
  data: ResendEmailData | null;
  error: ResendErrorResponse | null;
  headers?: Record<string, string>;
}

// Rate limiting state based on Resend API headers
interface RateLimitState {
  limit: number; // Maximum requests allowed in window (from ratelimit-limit)
  remaining: number; // Requests remaining in current window (from ratelimit-remaining)
  resetSeconds: number; // Seconds until limit resets (from ratelimit-reset)
  nextRequestTime: number; // Timestamp when we can make the next request
}

// Default state - assume 2 requests per second as per Resend's default
const rateLimitState: RateLimitState = {
  limit: 2,
  remaining: 2,
  resetSeconds: 1,
  nextRequestTime: 0,
};

/**
 * Process template variables in email subject
 */
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

/**
 * Update rate limit state based on response headers from Resend
 */
const updateRateLimitState = (headers: Record<string, string>): void => {
  if (headers["ratelimit-limit"]) {
    rateLimitState.limit = parseInt(headers["ratelimit-limit"], 10);
  }

  if (headers["ratelimit-remaining"]) {
    rateLimitState.remaining = parseInt(headers["ratelimit-remaining"], 10);
  }

  if (headers["ratelimit-reset"]) {
    rateLimitState.resetSeconds = parseInt(headers["ratelimit-reset"], 10);

    // Calculate the next safe time to make a request
    const now = Date.now();

    if (rateLimitState.remaining <= 0) {
      // If no requests remaining, we need to wait for the reset
      rateLimitState.nextRequestTime = now + rateLimitState.resetSeconds * 1000;
      console.log(
        `Rate limit reached. Next request allowed in ${rateLimitState.resetSeconds} seconds`
      );
    } else {
      // If we have requests remaining, calculate safe interval
      // Distribute remaining requests over the reset period with a small buffer
      const safeIntervalMs = Math.max(
        50, // Minimum 50ms between requests
        ((rateLimitState.resetSeconds * 1000) /
          (rateLimitState.remaining + 1)) *
          0.8 // 20% buffer
      );
      rateLimitState.nextRequestTime = now + safeIntervalMs;
    }
  }

  // If retry-after header is present (received 429), it takes precedence
  if (headers["retry-after"]) {
    const retryAfterSeconds = parseInt(headers["retry-after"], 10);
    rateLimitState.nextRequestTime = Date.now() + retryAfterSeconds * 1000;
    console.log(
      `Received retry-after header. Waiting ${retryAfterSeconds} seconds before next request`
    );
  }

  console.log(
    `Rate limit state updated: ${rateLimitState.remaining}/${rateLimitState.limit} requests remaining, reset in ${rateLimitState.resetSeconds}s`
  );
};

/**
 * Smart rate limiter that uses Resend API headers to determine wait times
 */
const applyRateLimit = async (): Promise<void> => {
  const now = Date.now();

  if (now < rateLimitState.nextRequestTime) {
    const waitTime = rateLimitState.nextRequestTime - now;
    console.log(
      `Rate limiting: waiting ${waitTime}ms before next request based on Resend headers`
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  // Without headers yet, use default spacing
  if (rateLimitState.nextRequestTime === 0) {
    // Default to 500ms spacing (2 req/sec) until we get headers
    rateLimitState.nextRequestTime = now + 500;
  }
};

/**
 * Handle rate limit errors (429) with exponential backoff
 */
const handleRateLimitError = async (attemptNumber = 0): Promise<void> => {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc. with a cap
  const backoff = Math.min(2 ** attemptNumber * 1000, 30000);
  console.log(
    `Rate limit exceeded. Using exponential backoff: ${backoff}ms (attempt ${
      attemptNumber + 1
    })`
  );

  rateLimitState.nextRequestTime = Date.now() + backoff;
  await new Promise((resolve) => setTimeout(resolve, backoff));
};

/**
 * Sends an email directly via Resend without using the queue
 */
export const sendDirectEmail = async (
  {
    event,
    type,
    receiver,
  }: {
    event: ServerEvent;
    type: EmailType;
    receiver: User;
  },
  attemptNumber = 0
): Promise<{ id: string }> => {
  try {
    // Validate recipient email
    if (!receiver.email) {
      throw new Error(`Recipient ${receiver.id} has no email address`);
    }

    // Apply rate limiting before sending
    await applyRateLimit();

    console.log(`Sending direct email to ${receiver.email} with type: ${type}`);

    // Check if this email type requires iCal generation
    const rsvpType = emailTypeToRsvpType(type);
    let iCal: string | null = null;

    // Only generate iCal for RSVP-related emails, not approval notifications
    if (rsvpType !== null) {
      const method =
        rsvpType === "NOT_GOING" || event.isDeleted === true
          ? "CANCEL"
          : "REQUEST";

      const icalRequest = generateiCalRequestFromEvent({
        event,
        recipientEmail: receiver.email,
        recipientName: receiver.nickname,
        rsvpType: rsvpType,
      });

      iCal = icalRequest
        ? await generateiCalString([icalRequest], method)
        : null;
    }

    // Convert event to ConvoEvent format for email templates
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

    // Generate email content from template
    const { template, subject: rawSubject } = getEmailTemplateFromType(type, {
      firstName: receiver.nickname,
      event: convoEvent,
    });

    const subject = processSubject(rawSubject, { event: convoEvent });

    // Prepare attachments if iCal exists
    const attachments =
      iCal && rsvpType !== null
        ? [
            {
              filename: "convo.ics",
              contentType: `text/calendar;charset=utf-8;method=${
                rsvpType === "NOT_GOING" || event.isDeleted === true
                  ? "CANCEL"
                  : "REQUEST"
              }`,
              content: iCal.toString(),
            },
          ]
        : [];

    // Send email directly with Resend
    // Cast response to our custom type to access headers
    const response = (await resend.emails.send({
      from: `${EVENT_ORGANIZER_NAME} <${EVENT_ORGANIZER_EMAIL}>`,
      to: [receiver.email],
      subject,
      react: template,
      text: `Email from Convo Cafe: ${subject}`,
      attachments,
    })) as unknown as ResendEmailResponse;

    const { data, error, headers } = response;

    // Update rate limit state based on response headers
    if (headers) {
      updateRateLimitState(headers);
    }

    // Handle rate limit errors specifically
    if (error && error.statusCode === 429) {
      console.log(
        `Rate limit exceeded for email to ${receiver.email}. Retrying...`
      );

      // Handle rate limit with exponential backoff
      await handleRateLimitError(attemptNumber);

      // Retry the request with incremented attempt number
      return sendDirectEmail({ event, type, receiver }, attemptNumber + 1);
    }

    if (error) {
      console.error(`Failed to send direct email to ${receiver.email}:`, error);
      throw error;
    }

    if (!data?.id) {
      throw new Error(
        `No ID received from Resend for email to ${receiver.email}`
      );
    }

    console.log(`Email sent successfully to ${receiver.email}, ID: ${data.id}`);
    return { id: data.id };
  } catch (error) {
    // Check if this is a rate limit error
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      (error as ResendErrorResponse).statusCode === 429
    ) {
      console.log(
        `Rate limit exceeded for email to ${receiver.email}. Retrying...`
      );

      // Handle rate limit with exponential backoff
      await handleRateLimitError(attemptNumber);

      // Retry the request with incremented attempt number (max 5 retries)
      if (attemptNumber < 5) {
        return sendDirectEmail({ event, type, receiver }, attemptNumber + 1);
      }
    }

    console.error(`Error sending direct email:`, error);
    throw error;
  }
};

/**
 * Send emails directly via Resend with prioritization:
 * 1. Creator first (direct)
 * 2. Other proposers next (direct)
 * 3. Returns attendee emails for queue processing
 */
export const sendDirectEmailsWithPriority = async (options: {
  event: ServerEvent;
  creatorId?: string;
  proposerEmails: Array<{
    event: ServerEvent;
    type: EmailType;
    receiver: User;
  }>;
  attendeeEmails: Array<{
    event: ServerEvent;
    type: EmailType;
    receiver: User;
  }>;
}): Promise<{
  sentResults: Array<{ id: string }>;
  attendeeEmailsForQueue: Array<{
    event: ServerEvent;
    type: EmailType;
    receiver: User;
  }>;
}> => {
  const { event, creatorId, proposerEmails, attendeeEmails } = options;
  const results: Array<{ id: string }> = [];

  try {
    // 1. Find and send creator email first
    if (creatorId) {
      const creatorEmail = proposerEmails.find(
        (email) => email.receiver.id === creatorId
      );

      if (creatorEmail) {
        console.log(
          `Sending creator email to ${creatorEmail.receiver.email} (${creatorId}) first`
        );
        const result = await sendDirectEmail(creatorEmail);
        results.push(result);
      }
    }

    // 2. Send other proposer emails
    const otherProposerEmails = creatorId
      ? proposerEmails.filter((email) => email.receiver.id !== creatorId)
      : proposerEmails;

    if (otherProposerEmails.length > 0) {
      console.log(
        `Sending ${otherProposerEmails.length} other proposer emails`
      );
      for (const emailData of otherProposerEmails) {
        const result = await sendDirectEmail(emailData);
        results.push(result);
      }
    }

    // 3. Return attendee emails for queue processing instead of direct sending
    console.log(
      `Returning ${attendeeEmails.length} attendee emails for queue processing`
    );

    return {
      sentResults: results,
      attendeeEmailsForQueue: attendeeEmails,
    };
  } catch (error) {
    console.error("Error in sendDirectEmailsWithPriority:", error);
    // Return partial results and remaining attendee emails
    return {
      sentResults: results,
      attendeeEmailsForQueue: attendeeEmails,
    };
  }
};
