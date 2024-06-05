import _ from "lodash";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "src/server/db";
import formatEvent from "src/server/utils/formatEvent";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ids } = _.pick(body, ["ids"]);
  if (!ids || ids.length === 0) {
    throw new Error("id undefined in req.body");
  }
  const eventsPromises = ids
    .filter((id: string) => id.length > 0)
    .map((id: string) =>
      prisma.event.findUniqueOrThrow({
        where: { id },
        include: {
          proposer: true,
          rsvps: {
            include: {
              attendee: true,
            },
          },
          collections: true,
        },
      })
    );
  const events = await Promise.all(eventsPromises);
  if (events.length > 0) {
    const formattedEvents = formatEvent(events);
    // return res.status(200).json({ data: formattedEvents });
    return NextResponse.json({
      data: formattedEvents,
    });
  }
  // return res.status(200).json({ data: [] });
  return NextResponse.json({
    data: [],
  });
}
