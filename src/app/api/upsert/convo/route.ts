import _ from "lodash";
import { prisma } from "src/utils/db";
import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCommunityFromSubdomain } from "src/utils/getCommunityFromSubdomain";
import type { ClientEventInput, ServerEvent } from "src/types";
import { sendEventEmail } from "src/utils/email/send";
import type { Rsvp, User } from "@prisma/client";
import type { EmailType } from "src/components/Email";
import { RSVP_TYPE } from "@prisma/client";
import { DateTime } from "luxon";
import { sendMessage } from "src/utils/slack/sendMessage";
import {
  scheduleReminderEmails,
  cancelReminderEmails,
} from "src/utils/email/scheduleReminders";
import { rrulestr } from "rrule";
import { cleanupRruleString } from "src/utils/rrule";

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

// Rate-limited email sender that respects Resend's 2 req/sec limit
const sendWithRateLimit = async (
  emailBatches: Array<{
    event: ServerEvent;
    type: EmailType;
    receiver: User;
  }>[]
) => {
  // Process all batches sequentially
  for (const batch of emailBatches) {
    // Process each batch - sending up to 2 emails in parallel
    for (let i = 0; i < batch.length; i += 2) {
      // Send up to 2 emails in parallel (respecting rate limits of 2 req/sec)
      const promises = [];
      if (i < batch.length) {
        // Ensure each item is a valid email options object before sending
        const emailOptions = batch[i];
        if (
          emailOptions &&
          emailOptions.event &&
          emailOptions.type &&
          emailOptions.receiver
        ) {
          promises.push(sendEventEmail(emailOptions));
        }
      }

      if (i + 1 < batch.length) {
        // Ensure each item is a valid email options object before sending
        const emailOptions = batch[i + 1];
        if (
          emailOptions &&
          emailOptions.event &&
          emailOptions.type &&
          emailOptions.receiver
        ) {
          promises.push(sendEventEmail(emailOptions));
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);

        // Add a delay of 1 second after each pair to respect rate limit
        if (i + 2 < batch.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  }
};

// Helper function to send emails asynchronously without blocking the response
const sendEmailsAsync = async (
  event: ServerEvent,
  goingAttendees: (Rsvp & { attendee: User })[] = [],
  maybeAttendees: (Rsvp & { attendee: User })[] = [],
  isUpdate = false,
  previousValues?: Partial<ServerEvent>
) => {
  try {
    // Prepare all email batches
    const batches: Array<
      {
        event: ServerEvent;
        type: EmailType;
        receiver: User;
      }[]
    > = [];

    // Prepare proposer emails
    const proposerEmails = event.proposers.map((proposerEntry) => ({
      event,
      type: (isUpdate ? "update-proposer" : "create") as EmailType,
      receiver: proposerEntry.user,
    }));

    if (proposerEmails.length > 0) {
      batches.push(proposerEmails);
    }

    // Check if there are significant changes for attendee notifications
    const hasChanges =
      isUpdate &&
      previousValues &&
      hasSignificantChanges(previousValues as Partial<ServerEvent>, event);

    // Prepare going attendee emails (only if significant changes)
    if (goingAttendees.length > 0 && hasChanges) {
      const goingEmails = goingAttendees.map((rsvp) => ({
        event,
        type: "event-details-updated" as EmailType,
        receiver: rsvp.attendee,
      }));

      batches.push(goingEmails);
    }

    // Prepare maybe attendee emails (only if significant changes)
    if (maybeAttendees.length > 0 && hasChanges) {
      const maybeEmails = maybeAttendees.map((rsvp) => ({
        event,
        type: "event-details-updated" as EmailType,
        receiver: rsvp.attendee,
      }));

      batches.push(maybeEmails);
    }

    // Fire and forget - send all emails in the background
    // This way the API response isn't delayed by email sending
    void sendWithRateLimit(batches).catch((error) => {
      console.error("Error sending rate-limited emails:", error);
    });

    // Send notification on a slack channel
    const headersList = headers();
    const host = headersList.get("host") ?? "kernel";
    await sendMessage({
      event,
      host,
      type: isUpdate ? "updated" : "new", // "new" | "reminder" | "updated"
    });

    console.log("All notifications sent successfully");
  } catch (error) {
    console.error("Error sending notifications:", error);
    // We don't throw here since this is running asynchronously
  }
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    event,
    userId,
  }: {
    event: ClientEventInput;
    userId: string;
  } = _.pick(body, ["event", "userId"]);

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
      previousValues
    );

    // Cancel existing reminder emails and schedule new ones
    // We do this in the background to avoid blocking the response
    (async () => {
      try {
        // Cancel existing reminder emails
        await cancelReminderEmails(updated.id);

        // Schedule new reminder emails for all proposers and attendees
        const proposerUsers = updated.proposers.map((p) => p.user); // Get all proposer users
        const allRecipients = [
          ...proposerUsers, // Use all proposer users
          ...goingAttendees.map((rsvp) => rsvp.attendee),
          ...maybeAttendees.map((rsvp) => rsvp.attendee),
        ];

        // Schedule reminders for each recipient individually
        // Schedule reminder emails asynchronously without blocking the response
        // This prevents users from seeing a loading state while emails are being scheduled
        Promise.all(
          allRecipients.map(async (recipient) => {
            // Determine if this recipient is a "maybe" attendee
            const isMaybeAttendee = maybeAttendees.some(
              (rsvp) => rsvp.attendee.id === recipient.id
            );

            // Check if the recipient is one of the proposers
            const isProposer = updated.proposers.some(
              (p) => p.userId === recipient.id
            );

            return scheduleReminderEmails({
              event: updated,
              recipient,
              isProposer: isProposer, // Use the calculated value
              isMaybe: isMaybeAttendee,
            });
          })
        ).catch((error) => {
          console.error(`Error scheduling reminder emails: ${error}`);
        });

        console.log(
          `Scheduling reminder emails for updated event ${updated.id}`
        );
      } catch (error) {
        console.error(
          `Error rescheduling reminder emails for updated event ${updated.id}:`,
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
  const community = await getCommunityFromSubdomain();

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
  const created = await prisma.event.create({
    data: {
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

  // Start sending emails asynchronously without awaiting
  sendEmailsAsync(created).catch((error) => {
    console.error("Background email sending failed:", error);
  });

  // Schedule reminder emails
  // We do this in the background to avoid blocking the response
  Promise.all([
    // Schedule reminder emails for the proposer with custom subject line
    scheduleReminderEmails({
      event: created,
      recipient: user,
      isProposer: true,
    }),
  ])
    .then(() => {
      console.log(
        `Scheduled reminder emails for proposer of new event ${created.id}`
      );
    })
    .catch((error) => {
      console.error(
        `Error scheduling reminder emails for new event ${created.id}:`,
        error
      );
    });

  return NextResponse.json(created);
}
