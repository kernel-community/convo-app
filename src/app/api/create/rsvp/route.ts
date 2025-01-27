import _ from "lodash";
import { prisma } from "src/utils/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendEventEmail } from "src/utils/email/send";
import type { RSVP_TYPE } from "@prisma/client";
import { rsvpTypeToEmailType } from "src/utils/rsvpTypetoEmailType";

type RsvpRequest = {
  userId: string;
  eventId: string;
  type: RSVP_TYPE;
};

/**
 * Create an RSVP in the database and send email
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { rsvp }: { rsvp: RsvpRequest } = _.pick(body, ["rsvp"]);
  console.log({ rsvp });
  if (!rsvp || !rsvp.userId || !rsvp.eventId) {
    throw new Error(
      `[api/create/rsvp] invalid request body: ${JSON.stringify(rsvp)}`
    );
  }
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: rsvp.eventId },
    include: {
      proposer: true,
      rsvps: {
        include: {
          attendee: true,
        },
      },
    },
  });
  console.log({ event });
  const eventLimit = event.limit;
  const eventRsvpsLength = event.rsvps.length;
  if (eventLimit !== 0 && eventRsvpsLength >= eventLimit) {
    return NextResponse.json({ data: "Limit reached. RSVP not allowed!" });
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: rsvp.userId },
  });
  console.log({ user });
  const { id: attendeeId } = user;
  const upserted = await prisma.rsvp.upsert({
    where: {
      eventId_attendeeId: {
        eventId: rsvp.eventId,
        attendeeId,
      },
    },
    create: {
      eventId: rsvp.eventId,
      attendeeId,
      rsvpType: rsvp.type,
    },
    update: {
      eventId: rsvp.eventId,
      attendeeId,
      rsvpType: rsvp.type,
    },
  });
  console.log({ upserted });
  console.log(
    `added RSVP for ${JSON.stringify(upserted.eventId)} for user: ${user.id}`
  );

  if (!user.email) {
    throw new Error(`user ${user.id} has no email`);
  }
  // send email to the attendee
  const data = await sendEventEmail({
    receiver: user,
    type: rsvp.type ? rsvpTypeToEmailType(rsvp.type) : "invite-going",
    event: event,
  });
  console.log(`sent email to ${user.email} for event ${rsvp.eventId}`);
  console.log({ data });
  return NextResponse.json({ data: rsvp.eventId });
}
