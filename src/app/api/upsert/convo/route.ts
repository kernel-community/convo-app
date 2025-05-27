import _ from "lodash";
import { prisma } from "src/utils/db";
import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";
import type { ClientEventInput, ServerEvent } from "src/types";
import type { Rsvp, User } from "@prisma/client";
import type { EmailType } from "src/components/Email";
import { RSVP_TYPE } from "@prisma/client";
import { DateTime } from "luxon";
import { cancelReminderEmails } from "src/utils/email/scheduleReminders";
import { rrulestr } from "rrule";
import { cleanupRruleString } from "src/utils/rrule";
import { queueEmailBatch } from "src/lib/queue";

// Helper function to check if there are significant changes in the event details
const hasSignificantChanges = (
  previousValues: Partial<ServerEvent>,
  currentEvent: ServerEvent
) => {
  if (!previousValues) return false;

  // Check for changes in date, time or location
  const startTimeChanged =
    previousValues.startDateTime &&
    currentEvent.startDateTime &&
    previousValues.startDateTime.toString() !==
      currentEvent.startDateTime.toString();

  const endTimeChanged =
    previousValues.endDateTime &&
    currentEvent.endDateTime &&
    previousValues.endDateTime.toString() !==
      currentEvent.endDateTime.toString();

  const locationChanged = previousValues.location !== currentEvent.location;

  return startTimeChanged || endTimeChanged || locationChanged;
};

// Use Redis queue to handle emails with proper rate limiting
const sendWithRateLimit = async (
  emailBatches: Array<{
    event: ServerEvent;
    type: EmailType;
    receiver: User;
  }>[]
) => {
  try {
    // Flatten all batches into a single array
    const allEmailOptions = emailBatches.flatMap((batch) =>
      batch.filter(
        (options) =>
          options && options.event && options.type && options.receiver
      )
    );

    if (allEmailOptions.length === 0) {
      console.log("No valid email options to process");
      return;
    }

    console.log(`Queueing ${allEmailOptions.length} emails to Redis`);

    // Queue all emails to Redis in a batch
    const jobIds = await queueEmailBatch(allEmailOptions);

    console.log(`Successfully queued ${jobIds.length} emails to Redis`);
  } catch (error) {
    console.error("Error queueing emails to Redis:", error);
    throw error;
  }
};

// Helper function to send emails asynchronously without blocking the response
const sendEmailsAsync = async (
  event: ServerEvent,
  goingAttendees: (Rsvp & { attendee: User })[] = [],
  maybeAttendees: (Rsvp & { attendee: User })[] = [],
  isUpdate = false,
  previousValues?: Partial<ServerEvent>,
  creatorId?: string // Add parameter for the creator's ID
) => {
  try {
    // Prepare proposer emails
    const proposerEmails = event.proposers.map((proposerEntry) => ({
      event,
      type: (isUpdate ? "update-proposer" : "create") as EmailType,
      receiver: proposerEntry.user,
    }));

    // Check if there are significant changes for attendee notifications
    const hasChanges =
      isUpdate &&
      previousValues &&
      hasSignificantChanges(previousValues as Partial<ServerEvent>, event);

    // Prepare going attendee emails (only if significant changes)
    const goingEmails =
      goingAttendees.length > 0 && hasChanges
        ? goingAttendees.map((rsvp) => ({
            event,
            type: "event-details-updated" as EmailType,
            receiver: rsvp.attendee,
          }))
        : [];

    // Prepare maybe attendee emails (only if significant changes)
    const maybeEmails =
      maybeAttendees.length > 0 && hasChanges
        ? maybeAttendees.map((rsvp) => ({
            event,
            type: "event-details-updated" as EmailType,
            receiver: rsvp.attendee,
          }))
        : [];

    // Combine all attendee emails
    const attendeeEmails = [...goingEmails, ...maybeEmails];

    // Queue priority emails instead of sending directly
    try {
      // Import the queue function to avoid circular dependencies
      const { queuePriorityEmail } = await import("src/lib/queue");

      console.log(`Queueing priority emails for event ${event.id}`);

      // Queue all emails (both priority and regular) through the priority email queue
      // The priority email worker will handle the separation and sending
      await queuePriorityEmail({
        event,
        creatorId,
        proposerEmails,
        attendeeEmails,
      });

      console.log(`Successfully queued all emails for event ${event.id}`);
    } catch (error) {
      console.error("Error queueing priority emails:", error);

      // Fallback to regular queue for all emails if priority queueing fails
      console.log("Falling back to regular queue for all email delivery");

      try {
        const batches = [];

        if (proposerEmails.length > 0) {
          batches.push(proposerEmails);
        }

        if (attendeeEmails.length > 0) {
          batches.push(attendeeEmails);
        }

        if (batches.length > 0) {
          void sendWithRateLimit(batches).catch((error) => {
            console.error("Error in fallback queue email sending:", error);
          });
          console.log(`Fallback: queued ${batches.length} email batches`);
        }
      } catch (fallbackError) {
        // Log but don't throw - we want the API to continue even if email queueing fails
        console.error("Error in fallback queue email sending:", fallbackError);
      }
    }

    // Queue Slack notification instead of sending directly
    try {
      const headersList = headers();
      const host = headersList.get("host") ?? "kernel";

      // Import the queue function to avoid circular dependencies
      const { queueSlackNotification } = await import("src/lib/queue");

      // Queue the Slack notification
      await queueSlackNotification({
        eventId: event.id,
        host,
        type: isUpdate ? "updated" : "new", // "new" | "reminder" | "updated"
      });

      console.log(
        `Slack notification for event ${event.id} queued successfully`
      );
    } catch (error) {
      console.error("Error queueing Slack notification:", error);
      // Continue even if queueing fails - non-critical
    }

    console.log("All notifications processed successfully");
  } catch (error) {
    console.error("Error sending notifications:", error);
    // We don't throw here since this is running asynchronously
  }
};

export async function POST(req: NextRequest) {
  console.time("total-api-time");
  console.time("parse-json");
  const body = await req.json();
  const {
    event,
    userId,
  }: {
    event: ClientEventInput;
    userId: string;
  } = _.pick(body, ["event", "userId"]);
  console.timeEnd("parse-json");

  // Validate that event dates are not in the past
  const now = DateTime.now();

  // Handle both Date objects and ISO strings
  const startDateTime =
    event.dateTimeStartAndEnd.start instanceof Date
      ? DateTime.fromJSDate(event.dateTimeStartAndEnd.start)
      : DateTime.fromISO(event.dateTimeStartAndEnd.start);

  const endDateTime =
    event.dateTimeStartAndEnd.end instanceof Date
      ? DateTime.fromJSDate(event.dateTimeStartAndEnd.end)
      : DateTime.fromISO(event.dateTimeStartAndEnd.end);

  if (!startDateTime.isValid || !endDateTime.isValid) {
    return NextResponse.json(
      {
        error: "Invalid date format provided",
        details: {
          start: event.dateTimeStartAndEnd.start,
          end: event.dateTimeStartAndEnd.end,
          startValid: startDateTime.isValid,
          endValid: endDateTime.isValid,
        },
      },
      { status: 400 }
    );
  }

  // For series events, we only need to validate that there are future occurrences
  if (event.recurrenceRule) {
    try {
      const rruleSetObject = rrulestr(
        cleanupRruleString(event.recurrenceRule),
        {
          dtstart: startDateTime.toJSDate(),
        }
      );

      // Get the next occurrence after now
      const futureDate = DateTime.now().plus({ months: 6 }).toJSDate();
      const nextOccurrences = rruleSetObject.between(
        now.toJSDate(),
        futureDate,
        true
      );

      if (nextOccurrences.length === 0) {
        return NextResponse.json(
          { error: "Series has no future occurrences" },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid recurrence rule" },
        { status: 400 }
      );
    }
  } else {
    // For non-series events, validate that the event is not in the past
    if (startDateTime < now || endDateTime < now) {
      return NextResponse.json(
        { error: "Event cannot be scheduled in the past" },
        { status: 400 }
      );
    }
  }

  // If event.id exists, it's an update operation
  if (event.id) {
    const eventToUpdate = await prisma.event.findUniqueOrThrow({
      where: { id: event.id },
      include: {
        proposers: {
          include: {
            user: { include: { profile: true } },
          },
        },
        rsvps: {
          include: {
            attendee: true,
          },
        },
      },
    });

    // Save previous values to detect significant changes
    const previousValues = {
      startDateTime: eventToUpdate.startDateTime,
      endDateTime: eventToUpdate.endDateTime,
      location: eventToUpdate.location,
    };

    // --- Proposer Update Logic ---
    // Get the user making the request
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user is a proposer or a Kernel community member
    const isUserAProposer = eventToUpdate.proposers.some(
      (p) => p.userId === userId
    );

    // Check if user is a Kernel community member (email ends with @kernel.community)
    const userEmail = currentUser.email || "";
    const isKernelCommunityMember = userEmail.endsWith("@kernel.community");

    // Allow update if user is either a proposer or a Kernel community member
    if (!isUserAProposer && !isKernelCommunityMember) {
      return NextResponse.json(
        {
          error:
            "Permission denied: Only current proposers or Kernel community members can update the event.",
        },
        { status: 403 }
      );
    }

    // Get current proposer IDs
    const currentProposerIds = new Set(
      eventToUpdate.proposers.map((p) => p.userId)
    );

    // Get incoming proposer IDs from the request
    const incomingProposerIds = new Set(
      event.proposers?.map((p) => p.userId) ?? []
    );

    // Ensure the requesting user remains a proposer (cannot remove self implicitly)
    if (!incomingProposerIds.has(userId)) {
      incomingProposerIds.add(userId);
    }

    // Calculate differences
    const proposersToAdd = [...incomingProposerIds]
      .filter((id) => !currentProposerIds.has(id))
      .map((id) => ({ userId: id }));

    const proposerIdsToRemove = [...currentProposerIds].filter(
      (id) => !incomingProposerIds.has(id)
    );

    // --- End Proposer Update Logic ---

    const updated = await prisma.event.update({
      where: { id: event.id },
      data: {
        title: event.title,
        descriptionHtml: event.description,
        limit: event.limit ? Number(event.limit) : 0,
        location: event.location,
        rrule: event.recurrenceRule || null,
        startDateTime: new Date(event.dateTimeStartAndEnd.start),
        endDateTime: new Date(event.dateTimeStartAndEnd.end),
        sequence: eventToUpdate.sequence + 1,
        type: event.type,
        requiresApproval:
          event.requiresApproval ?? eventToUpdate.requiresApproval, // Update approval requirement or keep existing
        // Update proposers
        proposers: {
          // Create new proposer entries for those added
          create: proposersToAdd,
          // Delete proposer entries for those removed
          deleteMany: {
            userId: { in: proposerIdsToRemove },
          },
        },
        // Preserve the original creation timezone - don't update it
        // We'll only add a UI for changing timezone later if needed
      },
      include: {
        proposers: {
          include: {
            user: { include: { profile: true } },
          },
        },
        rsvps: {
          include: {
            attendee: {
              include: {
                profile: true,
              },
            },
          },
        },
        collections: true,
        community: {
          include: {
            slack: true,
          },
        },
      },
    });

    // Filter attendees
    const goingAttendees = updated.rsvps.filter(
      (rsvp) => rsvp.rsvpType === RSVP_TYPE.GOING
    );

    const maybeAttendees = updated.rsvps.filter(
      (rsvp) => rsvp.rsvpType === RSVP_TYPE.MAYBE
    );

    // Start sending emails asynchronously without awaiting or catching
    // Error handling is now inside the sendEmailsAsync function
    void sendEmailsAsync(
      updated,
      goingAttendees,
      maybeAttendees,
      true,
      previousValues,
      userId
    );

    // Cancel existing reminder emails and queue new ones using the reminder queue
    // We now do just the cancelation synchronously, and queue the scheduling
    // This significantly reduces API response time
    (async () => {
      try {
        // Step 1: Cancel existing reminder emails - this we still do synchronously
        console.log(
          `Canceling existing reminder emails for event ${updated.id}`
        );
        await cancelReminderEmails(updated.id);

        // Step 2: Prepare recipients for queueing
        const proposerUsers = updated.proposers.map((p) => p.user); // Get all proposer users
        const allRecipients = [
          ...proposerUsers, // Use all proposer users
          ...goingAttendees.map((rsvp) => rsvp.attendee),
          ...maybeAttendees.map((rsvp) => rsvp.attendee),
        ];

        // Step 3: Import queue functions to avoid circular dependencies
        const { queueReminderBatch } = await import("src/lib/queue");

        // Step 4: Prepare batch of reminder jobs
        const reminderJobs = allRecipients
          .filter((recipient) => recipient && recipient.id) // Filter out any undefined recipients
          .map((recipient) => {
            // Determine if this recipient is a "maybe" attendee
            const isMaybeAttendee = maybeAttendees.some(
              (rsvp) => rsvp.attendee.id === recipient.id
            );

            // Check if the recipient is one of the proposers
            const isProposer = updated.proposers.some(
              (p) => p.userId === recipient.id
            );

            // Create the reminder job data
            return {
              eventId: updated.id,
              recipientId: recipient.id,
              isProposer,
              isMaybe: isMaybeAttendee,
            };
          });

        // Step 5: Queue the batch of reminder jobs
        if (reminderJobs.length > 0) {
          const jobIds = await queueReminderBatch(reminderJobs);
          console.log(
            `Queued ${jobIds.length} reminder jobs for updated event ${updated.id}`
          );
        } else {
          console.log(`No valid recipients found for event ${updated.id}`);
        }
      } catch (error) {
        console.error(
          `Error processing reminders for updated event ${updated.id}:`,
          error
        );
      }
    })();

    return NextResponse.json(updated);
  }

  // If no event.id, it's a create operation
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const hash = event.hash || nanoid(10);

  // Use the centralized utility to get or create the appropriate community
  console.time("community-resolution");
  const community = await getCommunityFromSubdomain();
  console.timeEnd("community-resolution");

  // --- Proposer Create Logic ---
  // Prepare the list of proposers to create
  // Start with the user making the request
  const proposerCreateList = new Set<string>([userId]);
  // Add proposers from the input, if any
  event.proposers?.forEach((p) => proposerCreateList.add(p.userId));

  const proposersToCreate = [...proposerCreateList].map((id) => ({
    userId: id,
  }));
  // --- End Proposer Create Logic ---

  // The creationTimezone is now part of the event object
  // It was captured on the client side to ensure we're using the user's actual timezone
  console.time("db-create-operation");
  // Break down the timing of different parts of the database operation
  console.time("db-prepare-data");
  // Prepare the data for the event creation
  const eventData = {
    title: event.title,
    descriptionHtml: event.description,
    limit: event.limit ? Number(event.limit) : 0,
    location: event.location,
    rrule: event.recurrenceRule || null,
    startDateTime: new Date(event.dateTimeStartAndEnd.start),
    endDateTime: new Date(event.dateTimeStartAndEnd.end),
    hash,
    proposers: {
      // Use the prepared list
      create: proposersToCreate,
    },
    communityId: community.id,
    series: event.recurrenceRule ? true : false,
    isDeleted: false,
    sequence: 0,
    type: event.type,
    creationTimezone: event.creationTimezone, // Store the timezone the event was created in
    requiresApproval: event.requiresApproval ?? false, // Add approval requirement field
  };
  console.timeEnd("db-prepare-data");

  // Log the actual database operation time separately
  console.time("db-execute-query");
  const created = await prisma.event.create({
    data: eventData,
    include: {
      proposers: {
        include: {
          user: { include: { profile: true } },
        },
      },
      rsvps: {
        include: {
          attendee: {
            include: {
              profile: true,
            },
          },
        },
      },
      collections: true,
      community: {
        include: {
          slack: true,
        },
      },
    },
  });
  console.timeEnd("db-execute-query");
  console.timeEnd("db-create-operation");

  // Start sending emails asynchronously without awaiting
  // Don't await or use catch - start this fully asynchronously to improve response time
  // Fire and forget approach
  sendEmailsAsync(created, [], [], false, undefined, userId).catch((error) => {
    console.error("Background email sending failed:", error);
  });

  // Queue reminder scheduling in parallel - fully asynchronous
  // This significantly improves API response time
  if (user) {
    // Start this operation without awaiting
    (async () => {
      try {
        // Import the queue function here to avoid circular dependencies
        const { queueReminderScheduling } = await import("src/lib/queue");

        // Queue the reminder scheduling for the creator
        const reminderJobId = await queueReminderScheduling({
          eventId: created.id,
          recipientId: user.id,
          isProposer: true,
          isMaybe: false,
        });

        console.log(
          `Reminder scheduling for event ${created.id} and recipient ${user.id} queued with job ID: ${reminderJobId}`
        );
      } catch (error) {
        console.error(
          `Error queueing reminder scheduling for new event ${created.id}:`,
          error
        );
        // Non-blocking error - we continue even if queueing fails
      }
    })();
  }

  console.timeEnd("total-api-time");
  return NextResponse.json(created);
}
