import _, { isNil } from "lodash";
import { prisma } from "src/utils/db";
import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { ClientEventInput } from "src/types";
import { sendEventEmail } from "src/utils/email/send";
import { RSVP_TYPE } from "@prisma/client";
import { DateTime } from "luxon";
import { sendMessage } from "src/utils/slack/sendMessage";

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
        proposer: true,
        rsvps: {
          include: {
            attendee: true,
          },
        },
      },
    });

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
      },
      include: {
        proposer: true,
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
            google: true,
            slack: true,
          },
        },
      },
    });

    // Send email for event update to proposer
    await sendEventEmail({
      event: updated,
      type: "update-proposer",
      receiver: updated.proposer,
    });

    // Send emails to attendees who RSVP'd as Going
    const goingAttendees = updated.rsvps.filter(
      (rsvp) => rsvp.rsvpType === RSVP_TYPE.GOING
    );

    await Promise.all(
      goingAttendees.map((rsvp) =>
        sendEventEmail({
          event: updated,
          type: "update-attendee-going",
          receiver: rsvp.attendee,
        })
      )
    );

    // Send emails to attendees who RSVP'd as Maybe
    const maybeAttendees = updated.rsvps.filter(
      (rsvp) => rsvp.rsvpType === RSVP_TYPE.MAYBE
    );

    await Promise.all(
      maybeAttendees.map((rsvp) =>
        sendEventEmail({
          event: updated,
          type: "update-attendee-maybe",
          receiver: rsvp.attendee,
        })
      )
    );

    // send notification on a slack channel
    const headersList = headers();
    const host = headersList.get("host") ?? "kernel";
    await sendMessage({
      event: updated,
      host,
      type: "updated", // "new" | "reminder" | "updated"
    });

    return NextResponse.json(updated);
  }

  // If no event.id, it's a create operation
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const hash = event.hash || nanoid(10);

  const community = await prisma.community.findUnique({
    where: { subdomain: "kernel" },
  });

  if (!community || isNil(community)) {
    throw new Error(
      "Community is undefined. Every event should belong to a community"
    );
  }

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
      proposerId: userId,
      communityId: community.id,
      series: event.recurrenceRule ? true : false,
      isDeleted: false,
      sequence: 0,
    },
    include: {
      proposer: true,
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

  // Send email for event creation
  await sendEventEmail({
    event: created,
    type: "create",
    receiver: user,
  });

  // send notification on a slack channel
  const headersList = headers();
  const host = headersList.get("host") ?? "kernel";

  await sendMessage({
    event: created,
    host,
    type: "new", // "new" | "reminder" | "updated"
  });

  return NextResponse.json(created);
}
