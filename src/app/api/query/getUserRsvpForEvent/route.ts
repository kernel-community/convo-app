import _ from "lodash";
import { prisma } from "src/server/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, event } = _.pick(body, ["userId", "event"]);
  if (!userId || !event) {
    throw new Error(`invalid request body: ${JSON.stringify(req.body)}`);
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
  const rsvp = await prisma.rsvp.findUnique({
    where: {
      eventId_attendeeId: {
        eventId: event,
        attendeeId: user.id,
      },
    },
  });

  // res.status(200).json({
  //   data: {
  //     isRsvp: !!rsvp,
  //   },
  // });
  return NextResponse.json({
    data: {
      isRsvp: !!rsvp,
    },
  });
}
