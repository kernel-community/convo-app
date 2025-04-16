import _ from "lodash";
import { prisma } from "src/utils/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendEventEmail } from "src/utils/email/send";
import { RSVP_TYPE, type User, type Event } from "@prisma/client";
import { rsvpTypeToEmailType } from "src/utils/rsvpTypetoEmailType";
import {
  scheduleReminderEmails,
  cancelReminderEmailsForUser,
} from "src/utils/email/scheduleReminders";
import type { EmailType } from "src/components/Email";

type RsvpRequest = {
  userId: string;
  eventId: string;
  type: RSVP_TYPE;
};

/**
 * Handles RSVP creation/update, including waitlist logic.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { rsvp }: { rsvp: RsvpRequest } = _.pick(body, ["rsvp"]);

  if (!rsvp || !rsvp.userId || !rsvp.eventId) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch necessary data concurrently
    const [event, user, existingRsvp] = await Promise.all([
      prisma.event.findUniqueOrThrow({
        where: { id: rsvp.eventId },
        include: {
          proposer: true,
          // Include all RSVPs to calculate current counts accurately
          rsvps: { include: { attendee: true } },
        },
      }),
      prisma.user.findUniqueOrThrow({ where: { id: rsvp.userId } }),
      prisma.rsvp.findUnique({
        where: {
          eventId_attendeeId: {
            eventId: rsvp.eventId,
            attendeeId: rsvp.userId,
          },
        },
      }),
    ]);

    if (!user.email) {
      return NextResponse.json(
        { error: `User ${user.id} has no email, cannot process RSVP.` },
        { status: 400 }
      );
    }

    // 2. Determine state and initialize variables
    const eventLimit = event.limit;
    const wasGoing = existingRsvp?.rsvpType === RSVP_TYPE.GOING;
    const isNowGoing = rsvp.type === RSVP_TYPE.GOING;
    const isChangingToMaybeOrNotGoing =
      rsvp.type === RSVP_TYPE.MAYBE || rsvp.type === RSVP_TYPE.NOT_GOING;

    let promotedUser: User | null = null;
    let finalRsvpTypeForUser = rsvp.type; // What the user's RSVP will be set to
    let emailTypeForUser: EmailType | null = null; // Determines which email the user gets
    let responseStatus: "SUCCESS" | "WAITLISTED" = "SUCCESS";

    // 3. --- Core Logic: Handle state changes ---

    // === Scenario 1: User was GOING, now changing status ===
    if (wasGoing && !isNowGoing) {
      console.log(
        `User ${user.id} changing from GOING to ${rsvp.type} for event ${event.id}`
      );
      await prisma.rsvp.update({
        where: { id: existingRsvp.id }, // Use existingRsvp.id which is guaranteed
        data: { rsvpType: rsvp.type },
      });
      finalRsvpTypeForUser = rsvp.type;
      emailTypeForUser = rsvpTypeToEmailType(finalRsvpTypeForUser, true); // Send update email

      // A spot potentially opened up, try to promote
      if (eventLimit > 0) {
        promotedUser = await promoteFromWaitlist(event.id);
      }
    }
    // === Scenario 2: User wants to be GOING ===
    else if (isNowGoing) {
      console.log(
        `User ${user.id} wants to RSVP as GOING for event ${event.id}`
      );
      const currentGoingCount = event.rsvps.filter(
        (r) => r.rsvpType === RSVP_TYPE.GOING && r.attendeeId !== user.id // Exclude self if updating from Maybe->Going
      ).length;

      // Check if event is full
      if (eventLimit > 0 && currentGoingCount >= eventLimit) {
        console.log(
          `Event ${event.id} is full. Adding ${user.id} to waitlist.`
        );
        // Add to waitlist (idempotent)
        await prisma.waitlist.upsert({
          where: { eventId_userId: { eventId: event.id, userId: user.id } },
          create: { eventId: event.id, userId: user.id },
          update: {},
        });
        responseStatus = "WAITLISTED";
        // Don't set finalRsvpTypeForUser or emailTypeForUser, user is not RSVP'd, they are waitlisted
        finalRsvpTypeForUser = RSVP_TYPE.OFF_WAITLIST; // Use special type to signify waitlist status internally
        // emailTypeForUser = null; // No standard RSVP email for waitlisting
        // Set email type to send the waitlisted notification
        emailTypeForUser = "waitlisted";
        // Consider sending a specific "You are waitlisted" email here if desired
      } else {
        // Event not full, grant RSVP
        console.log(
          `Event ${event.id} has space. Upserting RSVP for ${user.id} as GOING.`
        );
        await prisma.rsvp.upsert({
          where: {
            eventId_attendeeId: { eventId: event.id, attendeeId: user.id },
          },
          create: {
            eventId: event.id,
            attendeeId: user.id,
            rsvpType: RSVP_TYPE.GOING,
          },
          update: { rsvpType: RSVP_TYPE.GOING },
        });
        finalRsvpTypeForUser = RSVP_TYPE.GOING;
        emailTypeForUser = existingRsvp
          ? rsvpTypeToEmailType(finalRsvpTypeForUser, true)
          : rsvpTypeToEmailType(finalRsvpTypeForUser);

        // If they were on the waitlist, remove them now they have a spot
        await removeUserFromWaitlist(event.id, user.id);
      }
    }
    // === Scenario 3: User RSVPing Maybe/Not Going (and wasn't previously GOING) ===
    else if (isChangingToMaybeOrNotGoing) {
      console.log(
        `User ${user.id} RSVPing as ${rsvp.type} for event ${event.id}`
      );
      await prisma.rsvp.upsert({
        where: {
          eventId_attendeeId: { eventId: event.id, attendeeId: user.id },
        },
        create: { eventId: event.id, attendeeId: user.id, rsvpType: rsvp.type },
        update: { rsvpType: rsvp.type },
      });
      finalRsvpTypeForUser = rsvp.type;
      emailTypeForUser = existingRsvp
        ? rsvpTypeToEmailType(finalRsvpTypeForUser, true)
        : rsvpTypeToEmailType(finalRsvpTypeForUser);

      // If they were on the waitlist, remove them
      await removeUserFromWaitlist(event.id, user.id);
    } else {
      // This case should technically not be reached if wasGoing and isNowGoing are the same
      // or if the type isn't GOING/MAYBE/NOT_GOING, but log it just in case.
      console.warn(
        `User ${user.id} triggered unhandled RSVP state for event ${event.id}: wasGoing=${wasGoing}, newType=${rsvp.type}`
      );
      // Default to success but don't send email / schedule reminders without knowing the state
      emailTypeForUser = null;
      finalRsvpTypeForUser = existingRsvp?.rsvpType ?? rsvp.type; // Keep old type if possible
    }

    // 4. --- Post-Logic Actions: Send Emails ---
    if (emailTypeForUser) {
      sendEventEmail({
        receiver: user,
        type: emailTypeForUser,
        event: event,
      }).catch((error) =>
        console.error(
          `Error sending RSVP email to ${user.email}: ${error?.message}`
        )
      );
      console.log(
        `Sent ${emailTypeForUser} email to ${user.email} for event ${event.id}`
      );
    }

    if (promotedUser && promotedUser.email) {
      const promotedUserEmail = promotedUser.email; // Store email here
      sendEventEmail({
        receiver: promotedUser,
        type: "off-waitlist",
        event: event,
      }).catch((error) =>
        console.error(
          `Error sending Off Waitlist email to ${promotedUserEmail}: ${error?.message}`
        )
      ); // Use variable
      console.log(
        `Sent Off Waitlist email to ${promotedUserEmail} for event ${event.id}`
      ); // Use variable
    }

    // 5. --- Post-Logic Actions: Handle Reminder Emails ---
    // Only adjust reminders if the user is actually RSVP'd (not waitlisted)
    if (finalRsvpTypeForUser !== RSVP_TYPE.OFF_WAITLIST) {
      try {
        if (
          finalRsvpTypeForUser === RSVP_TYPE.GOING ||
          finalRsvpTypeForUser === RSVP_TYPE.MAYBE
        ) {
          scheduleReminderEmails({
            event: event,
            recipient: user,
            isProposer: event.proposerId === user.id,
            isMaybe: finalRsvpTypeForUser === RSVP_TYPE.MAYBE,
          }).catch((error) =>
            console.error(
              `Error scheduling reminder emails for ${user.id}: ${error?.message}`
            )
          );
          console.log(
            `Scheduled reminders for ${user.id} for event ${event.id} (${finalRsvpTypeForUser})`
          );
        } else if (finalRsvpTypeForUser === RSVP_TYPE.NOT_GOING) {
          await cancelReminderEmailsForUser(event.id, user.id);
          console.log(
            `Cancelled reminders for ${user.id} for event ${event.id}`
          );
        }
      } catch (error) {
        console.error(
          `Error handling reminder emails for user ${user.id}:`,
          error
        );
      }
    }

    // Schedule reminders for the promoted user
    if (promotedUser) {
      const promotedUserId = promotedUser.id; // Declare ID outside try
      try {
        scheduleReminderEmails({
          event: event,
          recipient: promotedUser,
          isProposer: event.proposerId === promotedUserId, // Use variable
          isMaybe: false, // They are now GOING
        }).catch((error) =>
          console.error(
            `Error scheduling reminder emails for promoted user ${promotedUserId}: ${error?.message}`
          )
        ); // Use variable
        console.log(
          `Scheduled reminders for promoted user ${promotedUserId} for event ${event.id}`
        ); // Use variable
      } catch (error) {
        console.error(
          `Error handling reminder emails for promoted user ${promotedUserId}:`,
          error
        ); // Use variable
      }
    }

    // 6. --- Return Response ---
    return NextResponse.json({
      data: { status: responseStatus, eventId: rsvp.eventId },
    });
  } catch (error) {
    console.error("[api/create/rsvp] Error:", error);
    // Handle Prisma Not Found error
    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Event or User not found." },
        { status: 404 }
      );
    }
    // General server error
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

// --- Helper Functions ---

/**
 * Promotes the next user from the waitlist (if any), updates their RSVP to GOING,
 * and returns the promoted user object or null. Handles transaction internally.
 */
async function promoteFromWaitlist(eventId: string): Promise<User | null> {
  const waitlist = await prisma.waitlist.findMany({
    where: { eventId: eventId },
    orderBy: { createdAt: "asc" },
    take: 1,
    include: { user: true },
  });

  if (!waitlist[0]) {
    console.log(`No users on waitlist for event ${eventId} to promote.`);
    return null; // No one on waitlist
  }

  const { user: userToPromote, id: waitlistEntryId } = waitlist[0];

  if (!userToPromote) {
    console.error(
      `Waitlist entry ${waitlistEntryId} for event ${eventId} is missing user data.`
    );
    // Attempt to delete the corrupt entry
    try {
      await prisma.waitlist.delete({ where: { id: waitlistEntryId } });
    } catch (delError) {
      console.error(
        `Failed to delete corrupt waitlist entry ${waitlistEntryId}:`,
        delError
      );
    }
    return null;
  }

  console.log(
    `Attempting to promote user ${userToPromote.id} (waitlist entry ${waitlistEntryId}) for event ${eventId}`
  );

  try {
    // Use transaction to ensure atomicity of promotion
    await prisma.$transaction([
      prisma.waitlist.delete({ where: { id: waitlistEntryId } }),
      prisma.rsvp.upsert({
        where: {
          eventId_attendeeId: {
            eventId: eventId,
            attendeeId: userToPromote.id,
          },
        },
        create: {
          eventId: eventId,
          attendeeId: userToPromote.id,
          rsvpType: RSVP_TYPE.GOING,
        },
        update: { rsvpType: RSVP_TYPE.GOING },
      }),
    ]);
    console.log(
      `Successfully promoted user ${userToPromote.id} for event ${eventId}`
    );
    return userToPromote;
  } catch (txError) {
    console.error(
      `Transaction failed during waitlist promotion for user ${userToPromote.id} (waitlist entry ${waitlistEntryId}):`,
      txError
    );
    // Don't return user if transaction failed, as their state is uncertain
    return null;
  }
}

/**
 * Removes a specific user from the waitlist for an event.
 * Logs success or failure but doesn't throw errors to prevent blocking main flow.
 */
async function removeUserFromWaitlist(
  eventId: string,
  userId: string
): Promise<void> {
  try {
    const deleted = await prisma.waitlist.deleteMany({
      where: { eventId: eventId, userId: userId },
    });
    if (deleted.count > 0) {
      console.log(`Removed user ${userId} from waitlist for event ${eventId}`);
    } else {
      // console.log(`User ${userId} was not on the waitlist for event ${eventId} (or already removed).`);
    }
  } catch (error) {
    console.error(
      `Error removing user ${userId} from waitlist for event ${eventId}:`,
      error
    );
    // Important: Don't re-throw, allow main function to continue
  }
}
