/**
 * deletes all sessions if sessions array is empty
 */
import _ from "lodash";
import { prisma } from "src/utils/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendEventEmail } from "src/utils/email/send";
import type { ClientEventInput } from "src/types";
import { RSVP_TYPE } from "@prisma/client";
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    event,
  }: {
    event: ClientEventInput;
  } = _.pick(body, ["event"]);

  const {
    title,
    limit,
    location,
    description,
    recurrenceRule,
    dateTimeStartAndEnd,
    id,
  } = event;
  console.log(`
    \nUpdating Event: ${JSON.stringify(event)}\n
  `);

  const eventToUpdate = await prisma.event.findUniqueOrThrow({ where: { id } });
  const updated = await prisma.event.update({
    where: { id },
    data: {
      title,
      descriptionHtml: description,
      limit: Number(limit),
      location,
      rrule: recurrenceRule || null,
      startDateTime: new Date(dateTimeStartAndEnd.start),
      endDateTime: new Date(dateTimeStartAndEnd.end),
      sequence: eventToUpdate.sequence + 1,
    },
    include: {
      proposer: true,
      rsvps: {
        include: {
          attendee: true,
        },
      },
    },
  });

  console.log(`Sending email to proposer`);
  // send email to the proposer
  await sendEventEmail({
    receiver: updated.proposer,
    type: "update-proposer",
    event: updated,
  });

  console.log(`Sending email to attendees marked as going`);
  // send update emails to all attendees marked as "going"
  await Promise.all(
    updated.rsvps
      .filter((rsvp) => rsvp.rsvpType === RSVP_TYPE.GOING)
      .map((rsvp) =>
        sendEventEmail({
          receiver: rsvp.attendee,
          type: "update-attendee-going",
          event: updated,
        })
      )
  );

  console.log(`Sending email to attendees marked as maybe`);
  // send update emails to all attendees marked as "maybe"
  await Promise.all(
    updated.rsvps
      .filter((rsvp) => rsvp.rsvpType === RSVP_TYPE.MAYBE)
      .map((rsvp) =>
        sendEventEmail({
          receiver: rsvp.attendee,
          type: "update-attendee-maybe",
          event: updated,
        })
      )
  );

  return NextResponse.json({
    data: { updated },
  });
}
