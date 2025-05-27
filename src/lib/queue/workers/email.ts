import type { Job } from "bull";
import type { EmailJobData } from "../email";
import { emailQueue } from "../email";
import { resend } from "src/utils/email/resend";
import { generateiCalString } from "src/utils/ical/generateiCalString";
import { generateiCalRequestFromEvent } from "src/utils/ical/generateiCalRequestFromEventId";
import {
  EVENT_ORGANIZER_EMAIL,
  EVENT_ORGANIZER_NAME,
} from "src/utils/constants";
import { emailTypeToRsvpType } from "src/utils/emailTypeToRsvpType";
import { getEmailTemplateFromType } from "src/components/Email";
import type { ConvoEvent } from "src/components/Email/types";
import type { CreateEmailOptions } from "resend";

// Rate limiting state based on Resend API headers
interface RateLimitState {
  limit: number; // Maximum requests allowed in window (from ratelimit-limit)
  remaining: number; // Requests remaining in current window (from ratelimit-remaining)
  resetSeconds: number; // Seconds until limit resets (from ratelimit-reset)
  nextRequestTime: number; // Timestamp when we can make the next request
}

// Default rate limit state (2 requests per second as per Resend's default)
const rateLimitState: RateLimitState = {
  limit: 2,
  remaining: 2,
  resetSeconds: 1,
  nextRequestTime: 0,
};

// Fixed defaults if headers aren't available
const FIXED_DELAY_MS = 600; // Default to ~1.6 emails per second (80% of limit)
const MAX_JITTER_MS = 300; // Add jitter to avoid synchronized requests
const RATE_LIMIT_BACKOFFS = [
  3000, 6000, 12000, 24000, 48000, 96000, 192000, 384000,
];

/**
 * Update rate limit state based on response headers from Resend
 */
function updateRateLimitState(headers: Record<string, string>): void {
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
}

/**
 * Smart rate limiter that uses Resend API headers to determine wait times
 * @param attempt The current attempt number (0 for first attempt)
 */
async function rateLimit(attempt = 0): Promise<void> {
  const now = Date.now();

  // If we're within a rate limit window, respect the next request time
  if (now < rateLimitState.nextRequestTime) {
    const waitTime = rateLimitState.nextRequestTime - now;
    console.log(
      `[${new Date().toISOString()}] Rate limiting: waiting ${waitTime}ms before next request based on Resend headers`
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    return;
  }

  // If we don't have header information yet or starting fresh
  if (rateLimitState.nextRequestTime === 0) {
    // Calculate retry backoff if this is a retry attempt
    let backoff = 0;
    if (attempt > 0) {
      const backoffIndex = Math.min(
        attempt - 1,
        RATE_LIMIT_BACKOFFS.length - 1
      );
      backoff = RATE_LIMIT_BACKOFFS[backoffIndex] || 0;
    }

    // Add small random jitter to avoid exact synchronization
    const jitter = Math.floor(Math.random() * MAX_JITTER_MS);

    // Calculate total delay - ALWAYS use full fixed delay plus jitter and backoff
    const totalDelay = FIXED_DELAY_MS + jitter + backoff;

    // Log what we're doing
    const timestamp = new Date().toISOString();
    if (backoff > 0) {
      console.log(
        `[${timestamp}] Using conservative rate limit: ${totalDelay}ms between emails (includes ${backoff}ms backoff for attempt ${
          attempt + 1
        })`
      );
    } else {
      console.log(
        `[${timestamp}] Using conservative rate limit: ${totalDelay}ms between emails (fixed:${FIXED_DELAY_MS}ms + jitter:${jitter}ms)`
      );
    }

    // Wait the calculated time
    await new Promise((resolve) => setTimeout(resolve, totalDelay));

    // Set a default next request time (conservative approach)
    rateLimitState.nextRequestTime = Date.now() + FIXED_DELAY_MS;
  }

  console.log(`[${new Date().toISOString()}] Sending email now`);
}

/**
 * Sends an email via Resend API and captures rate limit headers
 */
async function sendEmail(options: CreateEmailOptions) {
  // Cast the response to get access to headers
  interface ResendResponse {
    data?: { id: string } | null;
    error?: {
      message: string;
      name?: string;
      statusCode?: number;
    } | null;
    headers?: Record<string, string>;
  }

  // Send the email
  const response = (await resend.emails.send(
    options
  )) as unknown as ResendResponse;
  const { data, error, headers } = response;

  // Update rate limit state if headers are present
  if (headers) {
    updateRateLimitState(headers);
  }

  // Check for rate limit error (429)
  if (error && error.statusCode === 429) {
    console.error(`Rate limit exceeded for email to ${options.to}`);

    // Check for retry-after header
    if (headers && headers["retry-after"]) {
      const retryAfterSeconds = parseInt(headers["retry-after"], 10);
      console.log(`Retry-After header received: ${retryAfterSeconds} seconds`);
    }

    // Throw a specific error for rate limits that Bull will handle
    const rateLimitError = new Error("rate_limit_exceeded");
    rateLimitError.name = "rate_limit_exceeded";
    throw rateLimitError;
  }

  if (error) {
    console.error(`Failed to send email to ${options.to}:`, error);
    throw error;
  }

  if (!data) {
    const noDataError = new Error("No data returned from resend");
    console.error(noDataError);
    throw noDataError;
  }

  console.log(`Email sent successfully to ${options.to}: ${data.id}`);
  return data;
}

/**
 * Helper function to ensure we have a valid Date object
 */
function ensureDate(dateValue: any): Date {
  if (dateValue instanceof Date) {
    return dateValue;
  }

  // Handle string ISO format
  if (typeof dateValue === "string") {
    return new Date(dateValue);
  }

  // Handle numeric timestamp
  if (typeof dateValue === "number") {
    return new Date(dateValue);
  }

  // Handle objects with toISOString method (like serialized dates)
  if (dateValue && typeof dateValue === "object" && dateValue.toISOString) {
    return dateValue;
  }

  // Fallback
  console.warn("Invalid date value, using current date:", dateValue);
  return new Date();
}

/**
 * Starts the email worker process
 */
export const startEmailWorker = () => {
  console.log("Email worker started");

  // Handle rate limit errors specially
  emailQueue.on("failed", async (job, err) => {
    // Check if the error is a rate limit error
    const isRateLimit =
      err &&
      ((typeof err.name === "string" && err.name === "rate_limit_exceeded") ||
        (typeof err.message === "string" &&
          err.message.includes("rate limit")));

    if (isRateLimit) {
      console.log(
        `Rate limit error for job ${job.id}, retrying with exponential backoff`
      );

      // Note: We don't need to manually retry the job
      // Bull will automatically retry based on the job options with exponential backoff
      // We only log the information for monitoring purposes

      // Calculate what the delay would be for reference
      const attempt = job.attemptsMade || 0;
      const backoffIndex = Math.min(attempt, RATE_LIMIT_BACKOFFS.length - 1);
      const delay = RATE_LIMIT_BACKOFFS[backoffIndex] || 5000;

      console.log(
        `Job ${
          job.id
        } will be retried automatically with delay ~${delay}ms (attempt ${
          attempt + 1
        })`
      );
    }
  });

  // Handle stalled job events
  emailQueue.on("stalled", (jobId) => {
    console.warn(
      `Job ${jobId} has stalled. It will be automatically restarted.`
    );

    // After a job stalls, we'll check for and clean up any ghost jobs
    setTimeout(async () => {
      try {
        // Get all active jobs
        const activeJobs = await emailQueue.getJobs(["active"]);
        console.log(`Checking ${activeJobs.length} active jobs after stall...`);

        // Check if any have been active too long (over 2 minutes)
        const now = Date.now();
        let ghostJobsFound = 0;

        for (const job of activeJobs) {
          if (job.processedOn && now - job.processedOn > 120000) {
            ghostJobsFound++;
            console.log(
              `Ghost job ${job.id} detected (active for ${Math.round(
                (now - job.processedOn) / 1000
              )} seconds)`
            );

            try {
              // Try to move to failed state so it can be retried
              await job.moveToFailed(
                new Error("Ghost job detected and reset by worker"),
                true // Remove job from active list even if moveToFailed fails
              );
              console.log(`Ghost job ${job.id} was moved to failed state`);
            } catch (err) {
              console.error(`Error moving ghost job ${job.id} to failed:`, err);
            }
          }
        }

        if (ghostJobsFound > 0) {
          console.log(`Found and reset ${ghostJobsFound} ghost jobs`);
        }
      } catch (err) {
        console.error("Error cleaning up after stall:", err);
      }
    }, 5000); // Wait 5 seconds before cleaning up
  });

  // Add periodic cleanup to check for ghost jobs every 5 minutes
  const cleanupInterval = setInterval(async () => {
    try {
      console.log("Running periodic queue cleanup...");

      // First, clean up any jobs stuck in active state for too long
      const activeCount = await emailQueue.getActiveCount();

      if (activeCount > 0) {
        console.log(`Found ${activeCount} active jobs, checking for ghosts...`);

        // Clean jobs that have been stuck in the active state for more than 2 minutes
        const cleaned = await emailQueue.clean(120000, "active");
        console.log(`Cleaned ${cleaned.length} stuck active jobs`);

        // If jobs were cleaned, check if any remaining active jobs need manual intervention
        if (cleaned.length > 0) {
          const remainingActive = await emailQueue.getJobs(["active"]);
          console.log(
            `${remainingActive.length} active jobs remain after cleaning`
          );
        }
      }

      // Report updated queue stats after cleanup
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        emailQueue.getWaitingCount(),
        emailQueue.getActiveCount(),
        emailQueue.getCompletedCount(),
        emailQueue.getFailedCount(),
        emailQueue.getDelayedCount(),
      ]);

      console.log("Queue stats after cleanup:", {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed,
      });
    } catch (err) {
      console.error("Error during periodic cleanup:", err);
    }
  }, 5 * 60 * 1000); // Run every 5 minutes

  // Process one job at a time to avoid rate limit issues
  emailQueue.process(1, async (job: Job<EmailJobData>) => {
    console.log(`Processing email job ${job.id}`);
    const attempt = job.attemptsMade || 0;

    // Create a progress heartbeat to prevent the job from being marked as stalled
    const heartbeatInterval = setInterval(() => {
      job.progress(0).catch((err) => {
        console.error(`Error sending heartbeat for job ${job.id}:`, err);
      });
    }, 5000); // Every 5 seconds

    try {
      // If job already has precomputed email options, use them directly
      if (job.data.emailOptions) {
        // Apply rate limiting before sending
        await rateLimit(attempt);
        return await sendEmail(job.data.emailOptions);
      }

      // Otherwise, validate required fields for standard email
      const {
        receiver,
        event: rawEvent,
        type,
        text,
        previousRsvpType,
      } = job.data;

      if (!receiver || !rawEvent || !type) {
        throw new Error(
          `Missing required data for email job ${job.id}: receiver, event, or type is undefined`
        );
      }

      // Log raw event data for debugging
      console.log(
        `Raw event data for job ${job.id}:`,
        typeof rawEvent,
        "startDateTime:",
        rawEvent.startDateTime,
        "type:",
        typeof rawEvent.startDateTime
      );

      // Fix date serialization issue by converting strings back to Date objects
      const event = {
        ...rawEvent,
        // Handle various date formats safely
        startDateTime: ensureDate(rawEvent.startDateTime),
        endDateTime: ensureDate(rawEvent.endDateTime),
        createdAt: rawEvent.createdAt
          ? ensureDate(rawEvent.createdAt)
          : new Date(),
        updatedAt: rawEvent.updatedAt
          ? ensureDate(rawEvent.updatedAt)
          : new Date(),
      };

      // Add more debug info
      console.log("Event dates after conversion:");
      console.log(
        "- startDateTime:",
        event.startDateTime,
        typeof event.startDateTime
      );
      console.log(
        "- endDateTime:",
        event.endDateTime,
        typeof event.endDateTime
      );

      // Now that we've validated the required fields, use type assertion
      const validatedEvent = event;
      const validatedReceiver = receiver;
      const validatedType = type;

      if (!validatedReceiver.email) {
        throw new Error(`Receiver ${validatedReceiver.id} has no email`);
      }

      // Log what we're sending for debugging
      console.log(
        `Preparing email to ${validatedReceiver.email} for event ${validatedEvent.id} with type ${validatedType}`
      );

      // Check if this email type needs iCal generation
      const rsvpType = emailTypeToRsvpType(validatedType);
      let iCal: string | null = null;

      // Only generate iCal for RSVP-related emails, not approval notifications
      if (rsvpType !== null) {
        const method =
          rsvpType === "NOT_GOING" || validatedEvent.isDeleted === true
            ? "CANCEL"
            : "REQUEST";

        iCal = await generateiCalString(
          [
            await generateiCalRequestFromEvent({
              event,
              recipientEmail: validatedReceiver.email,
              recipientName: validatedReceiver.nickname,
              rsvpType: rsvpType,
              previousRsvpType: previousRsvpType,
            }),
          ],
          method
        );
      }

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
        id: validatedEvent.id,
        title: validatedEvent.title,
        descriptionHtml: validatedEvent.descriptionHtml ?? undefined,
        startDateTime: validatedEvent.startDateTime.toISOString(),
        endDateTime: validatedEvent.endDateTime.toISOString(),
        location: validatedEvent.location,
        locationType: validatedEvent.locationType,
        hash: validatedEvent.hash,
        limit: validatedEvent.limit,
        sequence: validatedEvent.sequence,
        isDeleted: validatedEvent.isDeleted,
        gCalEventId: validatedEvent.gCalEventId ?? undefined,
        type: validatedEvent.type,
        proposers: validatedEvent.proposers.map(
          (p: { userId: string; user: { nickname: string } }) => ({
            userId: p.userId,
            nickname: p.user.nickname,
          })
        ),
        creationTimezone: validatedEvent.creationTimezone ?? undefined,
      };

      // Create basic template props without event for non-event templates
      const basicProps = { firstName: validatedReceiver.nickname };

      // Create full props with event for templates that need it
      const fullProps = { ...basicProps, event: convoEvent, text };

      // Get template and subject
      const { template, subject: rawSubject } = getEmailTemplateFromType(
        validatedType,
        fullProps
      );

      const subject = processSubject(rawSubject, { event: convoEvent });

      // Build email options
      const emailOptions: CreateEmailOptions = {
        from: `${EVENT_ORGANIZER_NAME} <${EVENT_ORGANIZER_EMAIL}>`,
        to: [validatedReceiver.email],
        subject,
        react: template,
        text: text || "Email from Convo Cafe",
      };

      // Only add iCal attachment for RSVP emails, not approval notifications
      if (iCal && rsvpType !== null) {
        const method =
          rsvpType === "NOT_GOING" || validatedEvent.isDeleted === true
            ? "CANCEL"
            : "REQUEST";
        emailOptions.attachments = [
          {
            filename: "convo.ics",
            contentType: `text/calendar;charset=utf-8;method=${method}`,
            content: iCal.toString(),
          },
        ];
      }

      // Apply rate limiting before sending email with backoff for retries
      console.log(`Sending rate-limited email to ${validatedReceiver.email}`);
      await rateLimit(attempt);

      // Send the email with the generated options
      const result = await sendEmail(emailOptions);

      // Clear the heartbeat interval before returning
      clearInterval(heartbeatInterval);
      return result;
    } catch (error) {
      console.error(`Error processing email job ${job.id}:`, error);
      // Clear the heartbeat interval before rethrowing
      clearInterval(heartbeatInterval);
      throw error; // Rethrowing will trigger Bull's retry mechanism
    }
  });

  // Return an enhanced queue with the cleanup function
  const enhancedQueue = {
    ...emailQueue,
    cleanup: () => {
      clearInterval(cleanupInterval);
      return emailQueue.close();
    },
  };

  return enhancedQueue;
};
