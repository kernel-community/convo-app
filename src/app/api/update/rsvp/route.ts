// update rsvp
// used to cancel an rsvp

import { pick } from "lodash";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "src/server/db";

type RsvpUpdateRequest = {
  userId: string;
  eventId: string;
  toRsvp: boolean; // false to remove rsvp, true to add rsvp
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { rsvp }: { rsvp: RsvpUpdateRequest } = pick(body, ["rsvp"]);
  if (!rsvp || !rsvp.userId || !rsvp.eventId) {
    throw new Error(`invalid request body: ${JSON.stringify(rsvp)}`);
  }
  const { userId, eventId, toRsvp } = rsvp;
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });
  let result;
  try {
    if (!toRsvp) {
      result = await prisma.rsvp.delete({
        where: {
          eventId_attendeeId: {
            attendeeId: user.id,
            eventId,
          },
        },
      });
    }
    if (toRsvp) {
      result = await prisma.rsvp.upsert({
        where: {
          eventId_attendeeId: {
            attendeeId: user.id,
            eventId,
          },
        },
        create: {
          eventId,
          attendeeId: user.id,
        },
        update: {
          eventId,
          attendeeId: user.id,
        },
      });
    }
  } catch (err) {
    throw err;
  }

  console.log(`RSVP updated: ${JSON.stringify(rsvp)}`);

  return NextResponse.json({
    data: result,
  });
}
