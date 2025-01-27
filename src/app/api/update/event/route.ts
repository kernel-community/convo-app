/**
 * deletes all sessions if sessions array is empty
 */
import _ from "lodash";
import { prisma } from "src/utils/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendEventEmail } from "src/utils/email/send";
import type { ClientEventInput } from "src/types";
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

  // send email for event update
  await sendEventEmail({
    receiver: updated.proposer,
    type: "update",
    event: updated,
  });

  return NextResponse.json({
    data: { updated },
  });
}
