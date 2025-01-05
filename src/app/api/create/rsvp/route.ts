import _ from "lodash";
import { prisma } from "src/utils/db";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type RsvpRequest = {
  userId: string;
  eventId: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const headersList = headers();
  const host = headersList.get("host") ?? "kernel";

  const { rsvp }: { rsvp: RsvpRequest } = _.pick(body, ["rsvp"]);
  if (!rsvp || !rsvp.userId || !rsvp.eventId) {
    throw new Error(`invalid request body: ${JSON.stringify(rsvp)}`);
  }
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: rsvp.eventId },
    include: { rsvps: true },
  });
  const eventLimit = event.limit;
  const eventRsvpsLength = event.rsvps.length;
  if (eventLimit !== 0 && eventRsvpsLength >= eventLimit) {
    // return res.status(410).json({ data: "RSVP not allowed!" });
    return NextResponse.json({ data: "RSVP not allowed!" });
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: rsvp.userId },
  });
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
    },
    update: {
      eventId: rsvp.eventId,
      attendeeId,
    },
  });

  console.log(
    `added RSVP for ${JSON.stringify(upserted.eventId)} for user: ${user.id}`
  );

  // send email
  try {
    await fetch(
      `${
        host?.includes("localhost") ? "http" : "https"
      }://${host}/api/services/calendar/email/send`,
      {
        body: JSON.stringify({
          eventIds: [rsvp.eventId],
          recipientEmail: user.email,
          recipientName: user.nickname,
          type: "invite",
        }),
        method: "POST",
        headers: { "Content-type": "application/json" },
      }
    );
  } catch (err) {
    console.log(`Error in creating google calendar event`);
    console.error(err);
  }

  return NextResponse.json({ data: rsvp.eventId });
}
