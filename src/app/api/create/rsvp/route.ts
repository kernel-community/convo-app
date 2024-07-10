import _ from "lodash";
import { prisma } from "src/utils/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type RsvpRequest = {
  userId: string;
  events: Array<string>;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { rsvp }: { rsvp: RsvpRequest } = _.pick(body, ["rsvp"]);
  if (!rsvp || !rsvp.userId || !rsvp.events) {
    throw new Error(`invalid request body: ${JSON.stringify(rsvp)}`);
  }
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: rsvp.events[0] },
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
  const rsvps = rsvp.events.map((eventId) =>
    prisma.rsvp.upsert({
      where: {
        eventId_attendeeId: {
          eventId,
          attendeeId,
        },
      },
      create: {
        eventId,
        attendeeId,
      },
      update: {
        eventId,
        attendeeId,
      },
    })
  );

  const response = await Promise.all(rsvps);
  const eventIds = response.map((r) => r.eventId);

  console.log(
    `added RSVP for ${JSON.stringify(eventIds)} for user: ${user.id}`
  );

  return NextResponse.json({ data: eventIds });
}
