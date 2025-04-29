import _, { isNil } from "lodash";
import { prisma } from "src/utils/db";
import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { ClientEventInput, ServerEvent } from "src/types";
import { sendEventEmail } from "src/utils/email/send";
import type { Rsvp, User } from "@prisma/client";
import { RSVP_TYPE } from "@prisma/client";
import { DateTime } from "luxon";
import { sendMessage } from "src/utils/slack/sendMessage";
import {
  scheduleReminderEmails,
  cancelReminderEmails,
} from "src/utils/email/scheduleReminders";

// Helper function to send emails asynchronously without blocking the response
const sendEmailsAsync = async (
  event: ServerEvent,
  goingAttendees: (Rsvp & { attendee: User })[] = [],
  maybeAttendees: (Rsvp & { attendee: User })[] = [],
  isUpdate = false
) => {
  try {
    // Send email to all proposers
    const proposerEmailPromises = event.proposers.map((proposerEntry) =>
      sendEventEmail({
        event,
        type: isUpdate ? "update-proposer" : "create",
        receiver: proposerEntry.user,
      })
    );
    await Promise.all(proposerEmailPromises); // Process proposer emails

    // Send emails to attendees who RSVP'd as Going
    if (goingAttendees.length > 0) {
      // Collect all email options
      const goingEmailPromises = goingAttendees.map((rsvp) =>
        sendEventEmail({
          event,
          type: "update-attendee-going",
          receiver: rsvp.attendee,
        })
      );

      // Process in batches to avoid rate limiting
      for (let i = 0; i < goingEmailPromises.length; i += 10) {
        const batch = goingEmailPromises.slice(i, i + 10);
        await Promise.all(batch);

        // Add a small delay between batches to avoid rate limiting
        if (i + 10 < goingEmailPromises.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    // Send emails to attendees who RSVP'd as Maybe
    if (maybeAttendees.length > 0) {
      // Collect all email options
      const maybeEmailPromises = maybeAttendees.map((rsvp) =>
        sendEventEmail({
          event,
          type: "update-attendee-maybe",
          receiver: rsvp.attendee,
        })
      );

      // Process in batches to avoid rate limiting
      for (let i = 0; i < maybeEmailPromises.length; i += 10) {
        const batch = maybeEmailPromises.slice(i, i + 10);
        await Promise.all(batch);

        // Add a small delay between batches to avoid rate limiting
        if (i + 10 < maybeEmailPromises.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

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

  if (startDateTime < now || endDateTime < now) {
    return NextResponse.json(
      { error: "Event cannot be scheduled in the past" },
      { status: 400 }
    );
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

    // --- Proposer Update Logic ---
    // Check if the user making the request is one of the current proposers
    const isUserAProposer = eventToUpdate.proposers.some(
      (p) => p.userId === userId
    );

    if (!isUserAProposer) {
      return NextResponse.json(
        {
          error:
            "Permission denied: Only current proposers can update the event.",
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

    // Start sending emails asynchronously without awaiting
    sendEmailsAsync(updated, goingAttendees, maybeAttendees, true).catch(
      (error) => {
        console.error("Background email sending failed:", error);
      }
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

  // Find or create the kernel community
  let community = await prisma.community.findUnique({
    where: { subdomain: "kernel" },
  });

  // If community doesn't exist, create it
  if (!community || isNil(community)) {
    console.log("Kernel community not found, creating it now");
    community = await prisma.community.create({
      data: {
        subdomain: "kernel",
        displayName: "Kernel",
        description: "Kernel Community",
      },
    });
    console.log("Created new kernel community:", community.id);
  }

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
