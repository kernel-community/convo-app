import _ from "lodash";
import { prisma } from "src/utils/db";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, hash } = _.pick(body, ["userId", "hash"]);

  if (!userId || !hash) {
    throw new Error(`invalid request body: ${JSON.stringify(req.body)}`);
  }

  const { id: eventId } = await prisma.event.findFirstOrThrow({
    where: { hash },
    select: { id: true },
  });

  const rsvp = await prisma.rsvp.findUnique({
    where: {
      eventId_attendeeId: {
        eventId,
        attendeeId: userId,
      },
    },
  });

  return NextResponse.json({
    data: { rsvp },
  });
}
